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
						callback("OpenDB: No more data in database.");
						return;
					}
				};
				res.onerror = function (e) {
					callback("OpenDB: Error no data exists.");
					return;
				};
			} catch (event) {
				callback("OpenDB: Failure reading the database. " + event.message);
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
					callback("OpenDB: get " + e.message);
					return;
				};
			} catch (event) {
				callback("OpenDB: Failure reading record. " + event.message);
			}
		},

		deleteDB = function (store, callback) {
			try {
				indexedDB.deleteDatabase(store);
			} catch (e) {
				callback("OpenDB: Error " + e.message);
			}
		},

		add = function (store, data, callback) {
			var req;

			try {
				req = store.add(data).onsuccess = function (e) {
					callback("OpenDB: Add record " + JSON.stringify(data.name) + " success.");
					return true;
				};
			} catch (event) {
				callback("OpenDB: Failure adding record. " + event.message);
				return;
			}
		},

		del = function (store, data, callback) {
			var res;

			try {

				res = store['delete'](data);
				res.onsuccess = function (e) {
					callback("OpenDB:" + data + "  is deleted.");
					return true;
				};
				res.onerror = function (e) {
					callback("OpenDB: Failure deleting " + data + ".");
					return;
				};
			} catch (event) {
				callback("OpenDB: Failure deleting record. " + event.message);
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
							callback("OpenDB: Updating " + record.name + " customer data." );
						};
					}
				};

				res.onerror = function (ev) {
					store.add(record).onsuccess = function (e) {
						callback("OpenDB: Adding " + record.name + "customer data");
					};
				};

			} catch (event) {
				callback("OpenDB: Failure to add client data. " + event.message);
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

				switch (modo) {
					case 'read':
						read(store, callback);
						break;
					case 'get':
						getID(store, data, callback);
					break;
					case 'add':
						add(store, data, callback);
					break;
					case 'update':
						update(store, data, callback);
					break;
					case 'delete':
						del(store, data, callback);
					break;
					case 'deleteDB':
						deleteDB(cons.NAME, callback);
					break;
					default:
						callback("OpenDB: There is no operation defined.");
				}
			};
		} catch (event) {
			callback("OpenDB: Failure to open database. " + event.message);
			return;
		}
	};

	return {
		odb: oDB
	};
}());
