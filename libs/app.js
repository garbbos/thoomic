/* jslint browser: true */
/* global $, openDB, saveAs, MYPDF, Blob, FileReader */
window.onload = function () {
    'use strict';
	var	cons = {NAME: "ThoomicDB", VERSION: 1},
		empresa = ["cif", "name", "telefono", "email"],
		domicilio = $('#domicilio'),
        cp = $('#cp'),
        poblacion = $('#poblacion'),
        pais = $('#pais'),
		vector = [],
		clientDB = [],
        facturas = [],
		timer,
		forms = document.getElementById("form_datos"),
        currency = document.getElementById('currency'),
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
		filter = document.getElementById('myFilter'),
		formbill = $('#form_bill'),
		titulobill = $('#titulobill'),
		numerobill = $('#numerobill'),
		fechabill = $('#fechabill'),
		concepto = $('#concepto'),
		cantidad = $('#cantidad'),
		precio = $('#precio'),
		status = $('#status'),
		rotulo = $('#rotulo'),
		principal = $('#principal'),
		txconcept = document.getElementById('texto_concepto'),
		txnew = document.getElementById('texto_new'),
		titulo = $('#titulo_nuevo');

	function texto(msg) {
		if (msg) {
            $('#msg').text(msg);
			status.animate({ opacity: "1" });
			setTimeout(function () { status.animate({ opacity: '0' }); }, 3000);
			window.console.log(msg);
		}
	}

    function getSetup() {
		var z, mydata = {};

		for (z in empresa) {
			if (empresa.hasOwnProperty(z)) {
				mydata[empresa[z]] = localStorage.getItem(empresa[z]);
			}
		}
        mydata.domicilio = localStorage.getItem("domicilio");
        mydata.cp = localStorage.getItem("cp");
        mydata.poblacion = localStorage.getItem("poblacion");
        mydata.pais = localStorage.getItem("pais");

		return mydata;
	}

	function loadSetup() {
		var nombresetup = getSetup();
		if (!nombresetup[1]) {
			rotulo.text("Please, enter the data of the invoice issuer.");
		} else {
			rotulo.text("Button menu for details: " + nombresetup[1]);
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
        var x;
		if (objeto) {
			for (x = 0; x < objeto.elements.length; x++) {
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

	function edit(data, titu) {
		var z;

		if (data) {
			panel.panel('close');
			clear(forms);
			titulo.text(titu);
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

    function cleaner() {
        if (timer) {
            clearTimeout(timer);
        }

        lista.empty();
		lista.removeClass('datos');
		$('#textologo').empty();
	}

	function carga(data) {
		var logo = $('#textologo');
        panel.panel('close');

		cleaner();
		if (data.name) {
			if (paneltitulo.text() === "Thoomic") {
				$("<a href='#' class='ui-btn ui-btn-inline ui-icon-grid ui-btn-icon-left ui-mini ui-corner-all color' id='bill'>").append("toBill").appendTo(logo);
				$('#bill').click(function () {
					bills(data.name);
				});
			} else {
				data.domicilio = localStorage.getItem('domicilio');
				data.cp = localStorage.getItem('cp');
				data.poblacion = localStorage.getItem('poblacion');
				data.pais = localStorage.getItem('pais');
			}

			$("<a href='#' class='ui-btn ui-btn-inline ui-icon-gear ui-btn-icon-left ui-mini ui-corner-all' id='up'>").append((data.name || 'Your company')).appendTo(logo);
			$("<div>").append("<span>&nbsp;&nbsp;&nbsp;" + (data.cif || '') + "</span><span>&nbsp;&nbsp;&nbsp;" + (data.telefono || '') + "</span><span>&nbsp;&nbsp;&nbsp;" + (data.email || '') + "</span><p>").appendTo(logo);
			$("<div class='margen'>").append("<a href='#' id='loc' data-mini='true' class='ui-btn ui-mini ui-icon-home ui-btn-icon-left ui-btn-inline ui-corner-all'>Location</a>").appendTo(logo);
			$("<div>").append("</span><span>&nbsp;&nbsp;&nbsp;" + (data.domicilio || '')).appendTo(logo);
			$("<div>").append("</span><span>&nbsp;&nbsp;&nbsp;" + (data.cp || '') + "</span><span>&nbsp;&nbsp;&nbsp;" + (data.poblacion || '') + "</span><span>&nbsp;&nbsp;&nbsp;" + (data.pais || '') + "</span><p>").appendTo(logo);

			$('#update').text(data.name);
			$('#up').click(function () {
				edit(data);
			});

			$('#loc').click(function () {
				domicilio.val(data.domicilio);
				cp.val(data.cp);
				poblacion.val(data.poblacion);
				pais.val(data.pais);

				popup_address.popup('open', {positionTo: "window", transition: 'pop'});
			});

			$('#logo').show();
		} else {
			rotulo.text("Add details of your company.");
		}
	}

    var reclients = function (datos) {
		var z, id, token;

		$('#logo').hide();
		lista.addClass('datos');

		if (typeof datos === 'string' && clientDB.length < 1) {
			$('#textologo').empty();
			rotulo.text("Please add new client.");
			$('<div>').append("<p class='margen' style='color: red;'>There are no clients in the database, please write them.</p>").appendTo('#textologo');
			$('#logo').show();
			lista.removeClass('datos');
		} else {
			if (typeof datos !== 'string') {
				clientDB.push(datos);
				token = datos[empresa[1]].split('.', 1).toString();

				$("<li>").append("<a href='#' id=" + token + "><h3><span>" + datos[empresa[1]] + "</span></h3><p><span>" + datos[empresa[0]] + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[2]] + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;" + datos[empresa[3]] + "</span></p></a>").appendTo(lista);

				id = "#" + token;
				$(id).click(function (event) {
					event.stopPropagation();
                    listapanel.empty();
                    $('#currency option:selected').text((localStorage.getItem('currency') || '€')).change();

					for (z in datos) {
						if (datos.hasOwnProperty(z)) {
							if (z === "cif") {
								$("<li>").append("<a href='#' class='color ui-mini' id=" + z + ">" + (datos[z] || '----') + "</a>").appendTo(listapanel);
							} else {
								if (z === "name") {
									$("<li>").append("<a href='#' class='color ui-mini' id=" + z + ">" + (datos[z] || '----') + "</a>").appendTo(listapanel);
								} else {
									$("<li class='color ui-mini'>").append("<span>" + (datos[z] || '----') + "</span>").appendTo(listapanel);
								}
							}
						}
					}

					$('#cif').click(function (event) {
						bills(datos[empresa[1]]);
					});

					$('#name').click(function (event) {
						titulo.text(datos.name);
						carga(datos);
					});
                    $('#clave').text(datos.name);
					listapanel.listview('refresh');
					panel.panel('open');
				});
				lista.listview('refresh');
			}
		}
	};

    function loadDB() {
        if (timer) {
            clearTimeout(timer);
        }

		paneltitulo.text("Thoomic");
        btn_delete.text("Delete");
		titulo.text("New Client");
        lista.empty();
        $('#money').show();
		filter.focus();
		rotulo.text("Add new clients.");
		clientDB = [];
		openDB.odb.open(cons, "", reclients, 'read');
	}

	function newcli() {
		clear(forms);

		if (paneltitulo.text() === "Thoomic") {
			loadDB();
			titulo.text("New Client");
			rotulo.text("Add customer data.");
			popup_nuevo_cliente.popup('open', { positionTo: "window", transition: "pop" });
		} else {
			bill();
		}
	}

	function mysetup() {
		var datos;
		lista.removeClass('datos');
		clearTimeout(timer);
		clear(forms);
		rotulo.text("Complete your company details.");
		titulo.text("Invoice Issuer");

		datos = getSetup();
		paneltitulo.text(datos.name);
        if (datos.name) {
            carga(datos);
        } else {
            popup_nuevo_cliente.popup('open', {positionTo: "window", transition: "pop"});
        }
	}

    function exportall(data) {
        if (typeof data === 'string') {
            exportdata();
        } else {
            clientDB.push(data);
        }
    }

	function exportdata() {
        var filename = "ThoomicDB.json", blob;

		if (clientDB.length > 0) {
            rotulo.text("Exporting " + clientDB.length + " clients from your database.");
            try {
                blob = new Blob([JSON.stringify(clientDB)], {type: "application/json"});
                saveAs(blob, filename);
                texto("ThoomicDB.json file is saved.");
            } catch (event) {
                texto("Error: ThoomicDB.json is not saved. " + event.message);
            }
		} else {
            texto("No customer data... to export.");
		}
	}

	function deleteID() {
        panel.panel('close');
		popup_delete.popup('open', { positionTo: "window", transition: "pop" });
	}

	function reBill(datos) {
		var id, consbill, mytax = (localStorage.getItem('tax')|| 21), res = {}, tax = $('#tax');

        if ( typeof datos !== 'string') {
            $("<li>").append("<a href='#' id=" + datos.name + "><h3>" + datos.titulo + "</h3><p>Date: " + datos.fecha + "&nbsp;&nbsp;&nbsp;&nbsp;Bill Nº: " + datos.name + "&nbsp;&nbsp;&nbsp;&nbsp; " + datos.concepto0.concepto + "</p></a>").appendTo(lista);

            facturas.push(datos);
            titulobill.text(datos.titulo);
            $('#clave').text(datos.name);
            id = "#" + datos.name;

            $(id).click(function (event) {
                var z;
                event.stopPropagation();
                listapanel.empty();

                MYPDF.init();
                for(z in datos) {
                    if (datos.hasOwnProperty(z)) {
                        switch (z) {
                            case 'titulo':
                                openDB.odb.open(cons, datos[z], MYPDF.client, 'get');
                                titulobill.text(datos[z]);
                                break;
                            case 'name':
                                $("<li>").append("<a href='#' class='color ui-mini' id='name'>No. " + datos[z] + "</a>").appendTo(listapanel);
                                $('#clave').text(datos[z]);
                                break;
                            case 'fecha':
                                $("<li class='color ui-mini'>").append("<span>" + datos[z] + "</span>").appendTo(listapanel);
                                break;
                            default:
                            if ( datos[z].cantidad) {
                                $("<li class='color ui-mini'>").append("<span>" + datos[z].cantidad + "</span><span><b>&nbsp;" + datos[z].concepto + "</b></span>").appendTo(listapanel);
                                $("<li class='color ui-mini'>").append("<span>Unit: " + datos[z].precio + " " + datos.currency + "</span><span>&nbsp;&nbsp;&nbsp;Subtotal: " + (datos[z].cantidad * datos[z].precio) + " " + datos.currency + "</span>").appendTo(listapanel);
                                MYPDF.bill(datos[z].concepto, datos[z].cantidad, datos[z].precio);
                            }
                        }
                    }
                }

                $('#btn_generating').click(function (event) {
                    if (tax.val() < 0) {
                        mytax = 21;
                    } else {
                        mytax = tax.val();
                    }
                    localStorage.setItem('tax', mytax);
                    MYPDF.invoice(datos);
                    MYPDF.tax(mytax);
                    MYPDF.save($('#comments').val());
                    consbill = {NAME: datos.name, VERSION: 1};
                    openDB.odb.open(consbill, datos, texto, 'update');
                    $('#genpdf').popup('close');
                });

                $('#name').click(function (event) {
                    panel.panel('close');
                    tax.val(mytax);

                    res = getSetup();
                    if (res.name) {
                        MYPDF.setup(res);
                        $('#comments').val('');
                        $('#genpdf').popup('open', { positionTo: "window", transition: "pop" });
                    } else {
                        texto("The data of the invoice issuer is empty, write it!!");
                    }
                });
                listapanel.listview('refresh');
                btn_delete.text(datos.name);
                panel.panel('open');
            });
            lista.listview('refresh');
        } else {
            if (facturas.length === 0) {
                lista.removeClass('datos');
    			$('#textologo').empty();
    			$('<div>').append("<p class='margen' style='color: red;'>There are no invoices in the database, please write them.</p>").appendTo('#textologo');
    			$('#logo').show();
                newcli();
            }
        }
	}

	function bills(data) {
		panel.panel('close');
		lista.empty();
		lista.addClass('datos');

		if (data) {
			rotulo.text("Invoice to: " + data);
			var consbill = {NAME: data, VERSION: 1};
			openDB.odb.open(consbill, null, reBill, 'read');
			paneltitulo.text(data);
            facturas = [];
		}
        $('#logo').hide();
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
		fac.name = numerobill.text() + fac.titulo.substring(0, 1);
		fac.fecha = fechabill.text();
        fac.currency = localStorage.getItem("currency");

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


	function reqText(data) {
		var lines, z;

        if (data) {
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
			$('#selectfile').val('');
		}
	}

	function saveCli() {
		var z, objeto = {}, cif = $('#id_cif'), nombre = $('#id_nombre'), telefono = $('#id_telefono'), email = $('#id_email');

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

		if  (/^(([ a-zA-Z0-9_\.\- ])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4}))*$/.test(email.val())) {
			objeto.email = email.val();
		} else {
			checkInput(email, txnew);
			objeto.telefono = '';
		}

		if (objeto.name && objeto.cif && objeto.telefono) {
			switch (titulo.text()) {
				case 'Invoice Issuer':
					for (z in objeto) {
						if (objeto.hasOwnProperty(z)) {
							localStorage.setItem(z, objeto[z]);
						}
					}
					carga(objeto);
					texto("Data saved from the invoice issuer!!");
				break;
				case 'New Client':
                    openDB.odb.open(cons, objeto, texto, 'add');
                    loadDB();
				break;
				default:
                    openDB.odb.open(cons, objeto, texto, 'update');
                    loadDB();
			}
			popup_nuevo_cliente.popup('close');
		}
	}

	function saveLocation() {
		var objeto = {};

		objeto.name = $('#update').text();
		if (/\w*/.test(domicilio.val())) {
			objeto.domicilio = domicilio.val();
		} else {
			checkInput(domicilio);
		}

		if (/\w*/.test(cp.val())) {
			objeto.cp = cp.val();
		} else {
			checkInput(cp);
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
		if (paneltitulo.text() === 'Thoomic') {
			openDB.odb.open(cons, objeto, texto, 'update');
			loadDB();
		} else {
			localStorage.setItem('domicilio', objeto.domicilio);
			localStorage.setItem('cp', objeto.cp);
			localStorage.setItem('poblacion', objeto.poblacion);
			localStorage.setItem('pais', objeto.pais);
			mysetup();
		}
	}

	function delDB() {
		var mynb, ref, name = $('#name'), consbill = {};

        if (paneltitulo.text() === "Thoomic") {
            mynb = name.text();
			openDB.odb.open(cons, mynb, texto, 'delete');
			consbill = {NAME: mynb, VERSION: 1};
			openDB.odb.open(consbill, null, texto, 'deleteDB');
            loadDB();
        } else {
			ref = $('#clave').text();
			mynb = paneltitulo.text();
            consbill = {NAME: mynb, VERSION: 1};
			openDB.odb.open(consbill, ref, texto, 'delete');
            bills(mynb);
        }
	}

    function saveCurrency(event) {
        localStorage.setItem("currency", $('#currency option:selected').text());
    }
	function changed(event) {
		switch (event.keyCode) {
			case 17:
				mysetup();
				break;
			case 220:
				mysetup();
				break;
			case 13:
				loadDB();
				break;
			case 107:
				newcli();
				break;
			default:
		}
		filter.value = "";
	}

	function loadEvents() {
		var btn_reload = $('#reload'),
			btn_nuevo = $('#id_nuevo_cliente'),
			btn_export = $('#export'),
			btn_menu = $('#menu'),
			btn_popup_delete = $('#btn_popup_delete'),
			btn_domi = $('#bsave'),
            btn_save = $('#btn_save'),
			btn_save_bill = $('#btn_save_bill'),
			btn_next_bill = $('#btn_next_bill');

		btn_domi.click(function (){
			saveLocation();
		});
		btn_reload.click(function () {
			loadDB();
		});
        btn_reload.hover(function () {
			rotulo.text("Reload customer database.");
		});
        btn_reload.focus(function () {
			rotulo.text("Reload customer database.");
		});
		btn_export.click(function () {
            openDB.odb.open(cons, "", exportall, 'read');
		});
        btn_export.hover(function () {
            rotulo.text("Export your customer database to json file.");
        });
        btn_export.focus(function () {
            rotulo.text("Export your customer database to json file.");
        });
		btn_nuevo.click(function () {
			newcli();
		});

		btn_save.click(function () {
			saveCli();
		});

		btn_delete.click(function () {
			deleteID();
		});
        $('#imfile').hover(function () {
			rotulo.text("Import customer database.")
		});
        $('#imfile').focus(function () {
			rotulo.text("Import customer database.")
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
			mysetup();
		});
        btn_menu.focus(function() {
			rotulo.text("Write your data.")
		});
        btn_menu.hover(function() {
			rotulo.text("Write your data.")
		});
        filter.addEventListener('keyup', changed, true);

        currency.addEventListener('change', saveCurrency, false);
		document.getElementById('selectfile').addEventListener('change', importData, false);
		document.getElementById('nuevo_cliente').addEventListener('keyup', function(event) {
            switch (event.keyCode) {
                case 13:
                    saveCli();
                    break;
                case 27:
                    popup_nuevo_cliente.popup('close');
                    break;
                default:
            }
		});
        document.getElementById('nuevobill').addEventListener('keyup', function(event) {
            switch (event.keyCode) {
                case 13:
                    saveallbill();
                    break;
                case 27:
                    nuevobill.popup('close');
                    break;
                default:
            }
		});
		document.getElementById('address').addEventListener('keyup', function(event) {
            switch (event.keyCode) {
                case 13:
                    saveLocation();
                    break;
                case 27:
                    popup_address.popup('close');
                    break;
                default:
            }
		});
	}
    timer = setTimeout(loadDB, 4000);
    loadEvents();
    loadSetup();
    $('#app').height(screen.availHeight - 100);
};
