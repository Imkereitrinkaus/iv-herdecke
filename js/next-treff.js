/**
 * next-treff.js – Imkerverein Herdecke-Ende e.V.
 * Berechnet den nächsten Imkertreff (jeden 2. Dienstag im Monat, 19:00 Uhr)
 * und zeigt ihn in allen Elementen mit [data-next-treff] an.
 * Gibt es in data/termine.json einen Eintrag an diesem Tag, wird dessen
 * Titel (z. B. ein Fachvortrag) zusätzlich angezeigt.
 */

(function () {
  'use strict';

  var targets = document.querySelectorAll('[data-next-treff]');
  if (!targets.length) return;

  var WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                'August', 'September', 'Oktober', 'November', 'Dezember'];

  /* Zweiter Dienstag eines Monats (Dienstag = 2) */
  function zweiterDienstag(jahr, monat) {
    var d = new Date(jahr, monat, 1);
    var offset = (2 - d.getDay() + 7) % 7;
    return new Date(jahr, monat, 1 + offset + 7);
  }

  function naechsterTreff(jetzt) {
    var heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
    var kandidat = zweiterDienstag(heute.getFullYear(), heute.getMonth());
    /* Am Treff-Tag selbst bis Mitternacht als „heute“ anzeigen */
    if (kandidat < heute) {
      kandidat = zweiterDienstag(heute.getFullYear(), heute.getMonth() + 1);
    }
    return kandidat;
  }

  function isoDatum(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  var jetzt = new Date();
  var treff = naechsterTreff(jetzt);
  var istHeute = isoDatum(treff) === isoDatum(jetzt);

  var text = istHeute
    ? 'Heute, ' + treff.getDate() + '. ' + MONATE[treff.getMonth()] + ', 19:00 Uhr'
    : WOCHENTAGE[treff.getDay()] + ', ' + treff.getDate() + '. ' +
      MONATE[treff.getMonth()] + ' ' + treff.getFullYear() + ', 19:00 Uhr';

  function anzeigen(thema) {
    targets.forEach(function (el) {
      var out = el.querySelector('[data-next-treff-text]') || el;
      out.textContent = text + (thema ? ' – ' + thema : '');
      el.hidden = false;
    });
  }

  anzeigen('');

  /* Optional: Thema aus termine.json ergänzen (z. B. Fachvortrag) */
  if (!window.fetch) return;
  fetch('data/termine.json', { cache: 'no-cache' })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(function (data) {
      var iso = isoDatum(treff);
      var eintrag = (data || []).filter(function (t) { return t.datum === iso; })[0];
      if (eintrag && eintrag.titel) anzeigen(eintrag.titel);
    })
    .catch(function () { /* Basisanzeige bleibt bestehen */ });
})();
