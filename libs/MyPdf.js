/*jshint -W055 */
var MYPDF = (function () {
    'use strict';
    var doc, mypdf = {}, x, y, total = 0, iva = 0, mytax = 0, subtotal = 0, nombre = "client", nfac = "00001", a, moneda = "€";

    function check(data) {
        if (typeof data === "string" && data.length > 0) {
            return data;
        } else {
            return "----";
        }
    }

    function totales(data) {
        var totalbill = 0, espacios = 0;

        iva = (subtotal * (mytax / 100));
        totalbill = subtotal + iva;
        doc.setFontSize(11);

        espacios = (180 - (subtotal.toFixed(2).toString().length));
        doc.text(122, 259, "Subtotal ");
        doc.text(espacios, 259, (subtotal.toFixed(2).toString() + moneda));

        doc.text(122, 264, "Tax: " + (mytax) + "%");
        espacios = ((181 - (iva.toFixed(2).toString().length)));
        doc.text(espacios, 264, (iva.toFixed(2).toString()) + moneda);
        doc.line(168, 268, 190, 268);
        doc.text(122, 276, "TOTAL");

        espacios = (180 - (totalbill.toFixed(2).toString().length));
        doc.text(espacios, 276, (totalbill.toFixed(2).toString()) + moneda);

        doc.setFontSize(10);
        doc.rect(20, 120, 170, 130); // empty square
        if (data) {
            doc.text(20, 260, data.substring(0, 50));
        }
        doc.setFontSize(7);
        doc.line(20, 288, 190, 288);
        doc.text("@2016 Thoomic.com", 40, 293);

        iva = 0;
        subtotal = 0;
    }

    mypdf.tax = function (data) {
        if (data > 0) {
            mytax = data;
        } else {
            mytax = 0;
        }
    };

    mypdf.init = function () {
        doc = new jsPDF();

        x = 20;
        y = 24;
        total = 0;
        iva = 0;
        subtotal = 0;
        a = 132;
        doc.setTextColor(100);
        doc.setFontType("bold");
    };

    mypdf.client = function (data) {
        if (data.name) {
            doc.setFillColor(220, 220, 220);
            doc.rect(120, 52, 64, 17, 'F');
            doc.setFontSize(22);
            doc.text(122, 63, data.name);
            doc.setFontSize(9);
            doc.text(122, 51, "Invoice to: ");
            doc.text(166, 68, check(data.cif));
            doc.text(122, 75, "Tel: " + check(data.telefono));
            doc.text(122, 80, check(data.email));
            doc.text(122, 85, check(data.url));
            doc.text(122, 90, check(data.domicilio));
            doc.text(122, 95, check(data.poblacion));
            doc.text(160, 95, check(data.cp));
            doc.text(122, 100, check(data.pais));
        }
    };

    mypdf.setup = function (data) {
        var n, largo;

        if (data.name) {
            largo = 80;
            doc.rect(x, y, largo, (y + 20), 'F');
            doc.setTextColor(222, 222, 222);
            doc.setFontSize(32);
            doc.text(x, 21, check(data.name));
            x = x + 2;
            y = y + 3;
            doc.setFontSize(9);

            for (n in data) {
                if (data.hasOwnProperty(n)) {
                    if (n !== "name") {
                        y = y + 5;
                        doc.text(x, y, check(data[n]));
                    }
                }
            }
            doc.setTextColor(100);
        }
    };

    mypdf.invoice = function (data) {
        if (data.name) {
            nombre = data.titulo;

            doc.setFontSize(12);
            doc.setFontType("bold");
            doc.text(25, 119, "Invoice ID: " + data.name);
            nfac = data.name;

            doc.setFontSize(12);
            doc.setFontType("bold");
            doc.text(168, 119, data.fecha);
            moneda = data.currency;
        }
    };

    mypdf.bill = function (concepto, cantidad, precio) {
        var total = 0;

        doc.setFontSize(10);
        if (concepto && cantidad && precio) {
            doc.line(20, 126, 190, 126);
            doc.text(22, 125, "Description");
            doc.text(100, 125, "Qty.");
            doc.text(136, 125, "Unit Price");
            doc.text(168, 125, "Total");

            doc.text(22, a, concepto);
            doc.text(100, a, cantidad.toString());

            total = (precio * cantidad);
            subtotal = total + subtotal;

            doc.text(136, a, precio.toString());
            doc.text(168, a, total.toString());
            a = a + 5;
        }
    };

    mypdf.save = function (data) {
        totales(data);
        doc.save(nombre + nfac + '.pdf');
    };

    return mypdf;
}());
