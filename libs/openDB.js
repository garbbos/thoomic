var openDB = (function () {
	'use strict';
	var oDB = {}, indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDb || window.msIndexedDB,
		read = function (store, callback) {
			var cursor, res;

			try {
				res = store.openCursor();
				res.onsuccess = function (e) {
					cursor = e.target.result;

					if (cursor) {
						callback(cursor.value);
						cursor['continue']();
					} else {
						return;
					}
				};
				res.onerror = function (e) {
					callback("Error no data");
					return;
				};
			} catch (event) {
				callback("Read DB failed. " + event.message);
			}
		},

		getID = function (store, data, callback) {
			var res;

			try {
				res = store.get(data);

				res.onsuccess = function (e) {
					callback(res.result);
					return res.result;
				};
				res.onerror = function (e) {
					callback("Error: get " + e.message);
					return;
				};
			} catch (event) {
				window.console.log("Read record failed. " + event.message);
			}
		},

		deleteDB = function (store, callback) {
			try {
				indexedDB.deleteDatabase(store);
			} catch (e) {
				callback("Error " + e.message);
			}
		},

		add = function (store, data, callback) {
			var req;

			try {
				req = store.add(data).onsuccess = function (e) {
					callback("Add record " + JSON.stringify(data.name) + " success.");
					return true;
				};
			} catch (event) {
				callback("ADD record failed. " + event.message);
				return;
			}
		},

		del = function (store, data, callback) {
			var res;

			try {

				res = store['delete'](data);
				res.onsuccess = function (e) {
					callback(data + "  is Deleted.");
					return true;
				};
				res.onerror = function (e) {
					callback("Error " + data + "  is not Deleted.");
					return;
				};
			} catch (event) {
				callback("ADD record failed. " + event.message);
				return;
			}
		},

		update = function (store, data, callback) {
			var record, res;

			try {
				res = store.get(data.name);
				res.onsuccess = function (ev) {

					record = res.result;
					if (record) {
						var z;

						for (z in data) {
							if (data.hasOwnProperty(z)) {
								if (z !== 'name') {
									record[z] = data[z];
								}
							}
						}

						store.put(record).onsuccess = function (e) {
							callback("Update record: UPDATE " + record.name);
						};
					}
				};

				res.onerror = function (ev) {
					store.add(record).onsuccess = function (e) {
						callback("Update record: ADD " + record.name);
					};
				};

			} catch (event) {
				callback("ADD record failed. " + event.message);
			}
		};

	oDB.open = function (cons, data, callback, modo) {
		var db, request, transaction, store;

		try {
			request = indexedDB.open(cons.NAME, cons.VERSION);

			request.onerror = function (e) {
				window.console.log("OpenDB: open... request.onerror " + e.message);
				return;
            };

			request.onupgradeneeded = function (e) {
				db = e.target.result;

				if (!db.objectStoreNames.contains('clientes')) {
					store = db.createObjectStore('clientes', { keyPath: "name" });
				}
            };

			request.onsuccess = function (e) {
				db = e.target.result;
				transaction = db.transaction('clientes', 'readwrite');
				store = transaction.objectStore('clientes');

				if (modo === 'read') {
					read(store, callback);
				}

				if (modo === 'get') {
					getID(store, data, callback);
				}

				if (modo === 'add') {
					add(store, data, callback);
				}

				if (modo === 'update') {
					update(store, data, callback);
				}

				if (modo === 'delete') {
					del(store, data, callback);
				}

				if (modo === 'deleteDB') {
					deleteDB(cons.NAME, callback);
				}
			};
		} catch (event) {
			callback("Error open DB. " + event.message);
			return;
		}
	};

	return {
		odb: oDB
	};
}());
