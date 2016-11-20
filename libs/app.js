/* jslint browser: true */
/* global $, openDB, saveAs, MYPDF, Blob, FileReader */

window.onload = function () {
	var	cons = {NAME: "ThoomicDB", VERSION: 1},
		empresa = ["cif", "name", "telefono", "email"],
		domicilio = $('#domicilio'), cp = $('#cp'), poblacion = $('#poblacion'), pais = $('#pais'),
		vector = [],
		clientDB = [],
		valido = true,
		noclientes = 0,
		forms = document.getElementById("form_datos"),
		panel = $('#panel'),
		btn_delete = $('#deleteID'),
		popup_nuevo_cliente = $('#nuevo_cliente'),
		popup_delete = $('#popup_delete'),
		popup_address = $('#address'),
		deltitulo = $('#deltitulo'),
		paneltitulo = $('#panel_titulo'),
		lista = $('#lista'),
		listapanel = $('#datapanel'),
		nuevobill = $('#nuevobill'),
		juego = document.getElementById("jogo"),
		txjogo = document.getElementById("txjogo"),
		filter = document.getElementById('myFilter'),
		formbill = $('#form_bill'),
		titulobill = $('#titulobill'),
		numerobill = $('#numerobill'),
		fechabill = $('#fechabill'),
		concepto = $('#concepto'),
		cantidad = $('#cantidad'),
		precio = $('#precio'),
		status = $('#status'),
		mn = $('#msg'),
		rotulo = $('#rotulo'),
		principal = $('#principal'),
		txconcept = document.getElementById('texto_concepto'),
		txnew = document.getElementById('texto_new'),
		titulo = $('#titulo_nuevo');

	function texto(msg) {
		if (msg) {
				mn.text(msg);
				status.animate({ opacity: "1" });
				setTimeout(function () { status.animate({ opacity: '0' }); }, 3000);
		}
	}

	function loadSetup() {
		var nombresetup = getSetup();

		if (!nombresetup[1]) {
			rotulo.text("Please, edit your data biller.");
		} else {
			rotulo.text("Your company: " + nombresetup[1]);
		}
	}

	function getFullDate() {
		var dato = new Date(), d, m, a;

		d = dato.getDate();
		m = dato.getMonth();
		m = m + 1;
		a = dato.getFullYear();
		dato = (d + "/" + m + "/" + a);

		return dato;
	}

	function clear(objeto) {
		if (objeto) {
			for (var x=0;x<objeto.elements.length;x++) {
				objeto.elements[x].value = '';
				objeto.elements[x].style.background = '#FFFFFF';
			}
			txnew.innerHTML = '';
		}
	}

	function getBill(name) {
		var n = parseInt(localStorage.getItem(name), 10);

		if (n) {
			n = n + 1;
		} else {
			n = 1;
		}

		localStorage.setItem(name, n);
		return n;
	}

	function edit(data) {
		var z;

		if (data) {
			panel.panel('close');
			clear(forms);
			titulo.text("Update " + data[empresa[1]]);
			for (z in empresa) {
				if (empresa.hasOwnProperty(z)) {
					if (data[empresa[z]]) {
						forms.elements[z].value = data[empresa[z]];
					}
				}
			}
			popup_nuevo_cliente.popup('open', {positionTo: "window", transition: 'pop'});
		}
	}

	function bill() {
		var n;

		titulobill.text(paneltitulo.text());

		n = "000000" + getBill(titulobill.text());
		numerobill.text(n);
		fechabill.text(getFullDate());

		concepto.val('');
		cantidad.val('');
		precio.val('');
		txconcept.innerHTML = '';

		nuevobill.popup();
		nuevobill.popup('open', {positionTo: "window", transition: "pop"});
	}
	function newcli(){
		clear(forms);

		if (paneltitulo.text() === "Thoomic") {
			titulo.text("New Client");
			rotulo.text("+ Add Client");
			popup_nuevo_cliente.popup('open', { positionTo: "window", transition: "pop" });

		} else {
			titulo.text("New Bill");
			rotulo.text("+ Add Invoice");
			bill();
		}
	}

	function getSetup() {
		var z, mydata = [];

		for (z in empresa) {
			if (empresa.hasOwnProperty(z)) {
				mydata.push(localStorage.getItem(empresa[z]));
			}
		}

		if (mydata) {
			return mydata;
		} else {
			return false;
		}
	}

	function mysetup() {
		var datos, z;
		clear(forms);

		titulo.text("Invoice Issuer");
		datos = getSetup();
		if (datos) {
			for (z in datos) {
				if (datos.hasOwnProperty(z)) {
					forms.elements[z].value = datos[z];
				}
			}
		}
		popup_nuevo_cliente.popup('open', {positionTo: "window", transition: "pop"});
	}

	function saveSetup(data) {
		var z;

		if (data) {
			for (z in data) {
				if (data.hasOwnProperty(z)) {
					localStorage.setItem(z, data[z]);
					texto(z + " " + localStorage.getItem(z));
				}
			}
			texto("Saved data from the invoice issuer!!");
		}

	}

	function importfile() {
		panel.panel('close');

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			$('#readfile').popup('open', { positionTo: "window", transition: "pop" });
		} else {
			texto("Error: Not support File Api");
		}
	}

	function exportdata() {

		popup_delete.popup('open', { positionTo: "window", transition: "pop" });
		deltitulo.text("Export...");
	}

	function deleteID() {

		panel.panel('close');
		deltitulo.text("Deleting...");
		popup_delete.popup('open', { positionTo: "window", transition: "pop" });
	}

	function refreshBill(datos) {
		var id, suma, respuesta = [], formo = document.getElementById('#form_update'), tax = $('#tax'), sel = $('#sel');

		if (datos) {
			$("<li>").append("<a href='#' id=" + datos.name + "><h3>" + datos.titulo + "</h3><p>Date: " + datos.fecha + "&nbsp;&nbsp;&nbsp;&nbsp;Bill Nº: " + datos.name + "&nbsp;&nbsp;&nbsp;&nbsp;</p></a>").appendTo(lista);

			titulobill.text(datos.titulo);
			id = "#" + datos.name;

			$(id).click(function (event) {
				var z, x, idfac;
				event.stopPropagation();
				listapanel.empty();

				MYPDF.init();
				openDB.odb.open(cons, datos.titulo, MYPDF.client, 'get');
				for (z in datos) {
					if (datos.hasOwnProperty(z)) {

						if (z === "titulo") {

						} else {

							if (z === "name") {
								idfac = "#fac" + datos[z];
								$("<li>").append("<a href='#' class='color' id=fac" + datos[z] + ">Nº " + datos[z] + "</a>").appendTo(listapanel);
							} else {
								if (z === "fecha") {
									$("<li class='color'>").append("<span>" + datos[z] + "</span>").appendTo(listapanel);
								} else {
									for (x in datos[z]) {
										if (datos[z].hasOwnProperty(x) && (x === "concepto")) {
											suma = datos[z].cantidad * datos[z].precio;
											$("<li class='color'>").append("<span class='cantidad'>" + datos[z].cantidad + "</span><span>&nbsp;" + datos[z][x] + "</span><span>&nbsp;&nbsp;&nbsp;" + suma + "&#8364;</span>").appendTo(listapanel);
											MYPDF.bill(datos[z].concepto, datos[z].cantidad, datos[z].precio);
										}
									}
								}
							}
						}
					}
				}

				$('#btn_generating').click(function (event) {
					var mytax = 21;
					if (tax.val()) {
						mytax = tax.val();
					}
					localStorage.setItem('tax', mytax);
					MYPDF.save($('#comments').val(), mytax, sel.val());

					$('#genpdf').popup('close');
				});

				$(idfac).click(function (event) {
					panel.panel('close');
					MYPDF.name(datos.titulo);
					MYPDF.date(datos.fecha);
					MYPDF.fac(datos.name);

					respuesta = getSetup();
					if (respuesta[1]) {
						MYPDF.setup(respuesta);
						$('#comments').val('');
						mytax = localStorage.getItem('tax');
						if(mytax > 0) {
							tax.val(parseInt(mytax));
						} else {
							tax.val('');
						}

						$('#genpdf').popup('open', { positionTo: "window", transition: "pop" });
					} else {
						texto("Setup is empty, write it!!");
					}
				});

				btn_delete.text(datos.name);
				listapanel.listview('refresh');
				panel.panel('open');
			});
			lista.listview('refresh');
		}
	}

	function bills(data) {
		if (data) {
			var consbill = {NAME: data, VERSION: 1};
			paneltitulo.text(data);
			panel.panel('close');
			lista.empty();
			openDB.odb.open(consbill, null, refreshBill, 'read');
		}
	}

	function checkInput(element, tx) {
		element.css('background-color', '#ffcc66').trigger('create');
		element.on('focusin', function () {
			element.css('background-color', '#ffffff').trigger('create');
		});
		tx.innerHTML = "Insufficient " + element.attr('placeholder') + "...";
	}

	function Conceptos(con, quantity, price) {
		this.concepto = con;
		this.cantidad = quantity;
		this.precio = price;
	}

	function nextbill() {
		var newbill;

		if (concepto.val()) {
			if ((cantidad.val()) && (!isNaN(cantidad.val())) && (cantidad.val() > 0)) {
				if ((precio.val()) && (!isNaN(precio.val())) && (precio.val() > 0)) {
					newbill = new Conceptos(concepto.val(), cantidad.val(), precio.val());

					vector.push(newbill);
					txconcept.innerHTML = "<span><b style='font'>" + concepto.val() + "</b></span>";
					concepto.val('');
					cantidad.val('');
					precio.val('');
					return true;
				} else {
					checkInput(precio, txconcept);
					return false;
				}
			} else {
				checkInput(cantidad, txconcept);
				return false;
			}
		} else {
			checkInput(concepto, txconcept);
			return false;
		}
	}

	function saveallbill() {
		var z, myconcepto, fac = {}, consbill = {NAME: titulobill.text(), VERSION: 1};

		fac.titulo = titulobill.text();
		fac.name = numerobill.text() + fac.titulo.substring(0,1);
		fac.fecha = fechabill.text();

		if (nextbill()) {
			for (z in vector) {
				if (vector.hasOwnProperty(z)) {
					myconcepto = "concepto" + z;
					fac[myconcepto] = vector[z];
				}
			}
			openDB.odb.open(consbill, fac, texto, 'add');
			nuevobill.popup('close');
			bills(fac.titulo);
		}
		vector = [];
	}

	var refreshClientes = function (datos) {
		var id, token, z;

		if (datos) {
			$('#logo').hide();

			clientDB.push(datos);

			domicilio.val('');
			token = datos[empresa[1]].split('.', 1).toString();

			$("<li>").append("<a href='#' id=" + token + "><h3><span>" + datos[empresa[1]] + "</span></h3><p><span>" + datos[empresa[0]] + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[2]] + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[3]] + "</span></p></a>").appendTo(lista);

			id = "#" + token;
			$(id).click(function (event) {
				event.stopPropagation();

				listapanel.empty();
				for (z in datos) {
					if (datos.hasOwnProperty(z)) {
						if (datos[z]) {
							if (z === "cif") {
								$("<li>").append("<a href='#' class='color' id=" + z + ">" + datos[z] + "</a>").appendTo(listapanel);
							} else {
								if (z === "name") {
									$("<li>").append("<a href='#' class='color' id=" + z + ">" + datos[z] + "</a>").appendTo(listapanel);
								} else {
									$("<li class='color'>").append("<span>" + datos[z] + "</span>").appendTo(listapanel);
								}
							}
						}
					}
				}

				if (!datos.domicilio || !datos.cp || !datos.pais || !datos.poblacion) {
					$("<li>").append("<a href='#' class='color' id=moreaddress>Add Location</a>").appendTo(listapanel);
				}
				$('#moreaddress').click(function (event) {
					$('#update').text(datos.name);

					domicilio.val(datos.domicilio);
					poblacion.val(datos.poblacion);
					cp.val(datos.cp);
					pais.val(datos.pais);

					popup_address.popup('open', {positionTo: "window", transition: 'pop'});
					panel.panel('close');
					rotulo.text("Enter the address of the customer.");
				});
				$('#cif').click(function (event) {
					bills(datos[empresa[1]]);
					rotulo.text("Click + and create your bill.");
				});

				$('#name').click(function (event) {
					edit(datos);
					rotulo.text("Modify your customer data.");
				});

				listapanel.listview('refresh');
				panel.panel('open');
			});

			lista.listview('refresh');
		}
	};

	function loadDB() {
		paneltitulo.text("Thoomic");
		lista.empty();
		filter.focus();
		clientDB = [];
		openDB.odb.open(cons, "", refreshClientes, 'read');
	}

	function reqText(data) {
		var lines, z;

		lines = JSON.parse(data);
		if (lines) {
			for (z in lines) {
				if (lines.hasOwnProperty(z)) {
					openDB.odb.open(cons, lines[z], texto, 'add');
				}
			}
			loadDB();
		}
	}

	function importData(e) {
		var file, reader;
		$('#readfile').popup('close');

		file = e.target.files[0];
		if (file) {
			reader = new FileReader();
			reader.onload = function (e) {
				var contents = e.target.result;
				reqText(contents);
			};
			reader.readAsText(file);
		}
	}

	function refreshsetup(datos) {
		if (datos) {
			$("<li>").append("<a href='#' id=" + token + "><h3><span>" + datos[empresa[1]] + "</span></h3><p><span>" + datos[empresa[0]] +
			 "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[2]] + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[3]] + "</span></p></a><p>" +
			 "<a href='#' data-role='button' data-mini='true' id='bupdate' class='ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-corner-all ui-shadow color'>Add Location</a>" +
			 "</p>").appendTo(lista);
		}
	}

	function save_client() {
		var objeto = {}, cif = $('#id_cif'), nombre = $('#id_nombre'), telefono = $('#id_telefono'), email = $('#id_email');

		if (/^(\+\d{2,3}\s)*\d{9,10}$/.test(telefono.val())) {
			objeto.telefono = telefono.val();
		} else {
			checkInput(telefono, txnew);
		}
		if (nombre.val()) {
			objeto.name = nombre.val();
		} else {
			checkInput(nombre, txnew);
		}

		if (/^\w+$/.test(cif.val())) {
			objeto.cif = cif.val();
		} else {
			checkInput(cif, txnew);
		}

		if  (/^(([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4}))*$/.test(email.val())) {
			objeto.email = email.val();
		} else {
			checkInput(email, txnew);
			objeto.telefono = '';
		}

		if (objeto.name && objeto.cif && objeto.telefono) {
			popup_nuevo_cliente.popup('close');

			if (titulo.text() === 'Invoice Issuer') {
				saveSetup(objeto);
				refreshsetup();
			} else {
				if (titulo.text() === 'New Client') {
					openDB.odb.open(cons, objeto, texto, 'add');
				} else {
					openDB.odb.open(cons, objeto, texto, 'update');
				}

				loadDB();
			}
		}
	}

	function save_location() {
		var objeto = {};

		objeto.name = $('#update').text();
		texto(objeto.name);

		if (/\w*/.test(cp.val())) {
			objeto.cp = cp.val();
		} else {
			checkInput(cp);
		}

		if (/\w*/.test(domicilio.val())) {
			objeto.domicilio = domicilio.val();
		} else {
			checkInput(domicilio);
		}

		if (/\w*/.test(poblacion.val())) {
			objeto.poblacion = poblacion.val();
		} else {
			checkInput(poblacion);
		}

		if (/\w*/.test(pais.val())) {
			objeto.pais = pais.val();
		} else {
			checkInput(pais);
		}
		popup_address.popup('close');
		if ($('#update').text() === 'Invoice Issuer') {
			localStorage.setItem('issuer', objeto);
		} else {
			openDB.odb.open(cons, objeto, texto, 'update');
			loadDB();
		}

		domicilio.val('');
		cp.val('');
		poblacion.val('');
		pais.val('');
	}

	function delDB() {
		var mynb, filename = "ThoomicDB.json", blob, ref, name = $('#name'), consbill = {};

		if (deltitulo.text() === "Export...") {
			try {
				if (clientDB) {
					blob = new Blob([JSON.stringify(clientDB)], {type: "application/json"});
					saveAs(blob, filename);
					texto("ThoomicDB is saved.");
				} else {
					texto("No data in DataBase.");
				}
			} catch (event) {
				texto("Error: Thoomic.json is not saved. " + event.message);
			}
		} else {
			if (paneltitulo.text() === "Thoomic") {
				mynb = name.text();
				openDB.odb.open(cons, mynb, texto, 'delete');
				consbill = {NAME: mynb, VERSION: 1};
				openDB.odb.open(consbill, null, texto, 'deleteDB');
				loadDB();
			} else {
				consbill = {NAME: paneltitulo.text(), VERSION: 1};
				ref = btn_delete.text();
				mynb = paneltitulo.text();
				openDB.odb.open(consbill, ref, texto, 'delete');
				lista.empty();
				openDB.odb.open(consbill, mynb, refreshBill, 'read');
			}
		}
	}

	function loadEvents() {
		var btn_reload = $('#reload'),
			btn_nuevo = $('#id_nuevo_cliente'),
			btn_import = $('#import'),
			btn_export = $('#export'),
			btn_save = $('#btn_save'),
			btn_menu = $('#menu'),
			btn_update = $('#bupdate'),
			btn_popup_delete = $('#btn_popup_delete'),
			btn_domi = $('#bsave'),
			btn_save_bill = $('#btn_save_bill'),
			btn_next_bill = $('#btn_next_bill');


		filter.addEventListener('keyup', function(event) {
			switch (event.keyCode) {
				case 13:
					if (filter.value === "db" || filter.value === "add") {
						newcli();
					}
					filter.value = "";
					break;
				default:

			}
			if (event.keyCode === 107) {
				newcli();
			}
		});
		document.getElementById('selectfile').addEventListener('change', importData, false);
		document.getElementById('nuevo_cliente').addEventListener('keydown', function(event) {
			if (event.keyCode === 13) {
				save_client();
			}
		});
		document.getElementById('nuevo_cliente').addEventListener('keydown', function(event) {
			if (event.keyCode === 27) {
				popup_nuevo_cliente.popup('close');
			}
		});
		btn_domi.click(function (){
			save_location();
		});
		btn_reload.click(function () {
			rotulo.text("Load your customer DB.");
			loadDB();
		});
		btn_reload.hover(function () {
			rotulo.text("Load your customer DB.");
		});

		btn_import.click(function () {
			rotulo.text("Imports the customer data file.");

		});
		btn_import.hover(function () {
			rotulo.text("Imports the customer data file.");
		});
		btn_update.click(function () {
			var ob = {};

			rotulo.text("Update the address of the issuerof the invoice.");
			ob = (localStorage.getItem('issuer'));
			direccion.val(ob.direccion);
			poblacion.val(ob.poblacion);
			cp.val(ob.cp);
			pais.val(ob.pais);
			popup_address.popup('open', {positionTo: "window", transition: 'pop'});
		});
		btn_export.click(function () {
			rotulo.text("Exports customer database.");
			exportdata();
		});
		btn_export.hover(function () {
			rotulo.text("Exports customer database.");
		});

		btn_nuevo.click(function () {
			newcli();
		});
		btn_nuevo.hover(function () {
			if (paneltitulo.text() === "Thoomic") {
				rotulo.text("+ Add Client");
			} else {
				rotulo.text("+ Add Invoice");
			}

		});
		lista.hover(function () {
			rotulo.text("Save & Export your Client Database.");
		});

		btn_save.click(function () {
			save_client();
		});

		btn_delete.click(function () {
			deleteID();
		});

		btn_save_bill.click(function () {
			saveallbill();
		});

		btn_next_bill.click(function () {
			nextbill();
		});

		btn_popup_delete.click(function () {
			delDB();
		});
		btn_menu.click(function() {
			rotulo.text("Store the data of your company.");
			mysetup();
		});
		btn_menu.hover(function() {
			rotulo.text("Write the data of your company.");
		});

	}
	loadEvents();
	loadSetup();
	loadDB();
};
