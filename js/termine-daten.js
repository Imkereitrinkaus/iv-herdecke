/**
 * termine-daten.js – Imkerverein Herdecke-Ende e.V.
 * Liest data/termine.txt und ergänzt automatisch den monatlichen
 * Imkertreff (jeden 2. Dienstag, 19:00 Uhr).
 *
 * Ergebnis: window.IVTermine.laden() → Promise mit einer sortierten Liste
 * kommender Termine ({ datum: Date, titel, zeit, ort, text, art, auto }).
 */

(function () {
  'use strict';

  var DATEI          = 'data/termine.txt';
  var STANDARD_ORT   = 'Sportlertreff Herdecke-Ende, Kirchender Dorfweg 12, 58313 Herdecke';
  var STANDARD_ZEIT  = '19:00 Uhr';
  var TREFF_MONATE   = 6;   // so viele Monate im Voraus werden Treffs angezeigt
  var NACHLAUF_TAGE  = 1;   // Termin bleibt noch so viele Tage nach dem Datum sichtbar

  /* Erlaubte Schreibweisen für "Art" → interner Schlüssel */
  var ARTEN = {
    treff: 'treff', imkertreff: 'treff', vereinstreff: 'treff',
    vortrag: 'vortrag', fachvortrag: 'vortrag',
    praxis: 'praxis', saison: 'praxis',
    neuimker: 'neuimker', einsteiger: 'neuimker',
    'öffentlich': 'oeffentlich', oeffentlich: 'oeffentlich', aktion: 'oeffentlich',
    'entfällt': 'entfaellt', entfaellt: 'entfaellt', 'fällt aus': 'entfaellt', ausfall: 'entfaellt'
  };

  /* Erlaubte Feldnamen → interner Schlüssel */
  var FELDER = {
    datum: 'datum', titel: 'titel', zeit: 'zeit', uhrzeit: 'zeit',
    art: 'art', kategorie: 'art', ort: 'ort', text: 'text', beschreibung: 'text'
  };

  function parseDatum(wert) {
    var m = String(wert).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
    if (m) {
      var jahr = Number(m[3]);
      if (jahr < 100) jahr += 2000;
      var d = new Date(jahr, Number(m[2]) - 1, Number(m[1]));
      return d.getDate() === Number(m[1]) ? d : null; // z. B. 31.02. ablehnen
    }
    m = String(wert).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return null;
  }

  function schluessel(d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  /* Text-Datei in Blöcke zerlegen */
  function parseText(text) {
    var termine = [];
    var aktuell = null;
    var letztesFeld = null;

    function abschliessen() {
      if (!aktuell) return;
      var datum = parseDatum(aktuell.datum || '');
      if (datum && aktuell.titel) {
        termine.push({
          datum: datum,
          titel: aktuell.titel,
          zeit:  aktuell.zeit || STANDARD_ZEIT,
          ort:   aktuell.ort || STANDARD_ORT,
          text:  aktuell.text || '',
          art:   ARTEN[(aktuell.art || 'treff').toLowerCase()] || 'treff',
          auto:  false
        });
      } else if (window.console) {
        console.warn('termine.txt: Eintrag ohne gültiges Datum oder Titel übersprungen', aktuell);
      }
      aktuell = null;
      letztesFeld = null;
    }

    String(text).replace(/\r/g, '').split('\n').forEach(function (zeile) {
      var t = zeile.trim();
      if (t.charAt(0) === '#') return;            // Notiz
      if (t === '') { abschliessen(); return; }    // Blockende

      var m = t.match(/^([A-Za-zÄÖÜäöü]+)\s*:\s*(.*)$/);
      var feld = m && FELDER[m[1].toLowerCase()];
      if (feld) {
        if (feld === 'datum' && aktuell && aktuell.datum) abschliessen(); // fehlende Leerzeile
        aktuell = aktuell || {};
        aktuell[feld] = m[2].trim();
        letztesFeld = feld;
      } else if (aktuell && letztesFeld) {
        aktuell[letztesFeld] += ' ' + t;            // Fortsetzungszeile
      }
    });
    abschliessen();
    return termine;
  }

  /* Zweiter Dienstag eines Monats */
  function zweiterDienstag(jahr, monat) {
    var d = new Date(jahr, monat, 1);
    return new Date(jahr, monat, 1 + ((2 - d.getDay() + 7) % 7) + 7);
  }

  function automatischeTreffs(heute) {
    var liste = [];
    for (var i = 0; i <= TREFF_MONATE; i++) {
      liste.push({
        datum: zweiterDienstag(heute.getFullYear(), heute.getMonth() + i),
        titel: 'Imkertreff',
        zeit:  STANDARD_ZEIT,
        ort:   STANDARD_ORT,
        text:  '',
        art:   'treff',
        auto:  true
      });
    }
    return liste;
  }

  function zusammenfuehren(eigene, heute) {
    var belegt = {};
    eigene.forEach(function (t) { belegt[schluessel(t.datum)] = true; });

    /* Eingetragener Termin am Treff-Tag ersetzt den automatischen Treff */
    var alle = eigene.concat(automatischeTreffs(heute).filter(function (t) {
      return !belegt[schluessel(t.datum)];
    }));

    var grenze = new Date(heute);
    grenze.setDate(grenze.getDate() - NACHLAUF_TAGE);

    return alle
      .filter(function (t) { return t.datum >= grenze; })
      .sort(function (a, b) { return a.datum - b.datum; });
  }

  var cache = null;

  window.IVTermine = {
    STANDARD_ORT: STANDARD_ORT,
    zweiterDienstag: zweiterDienstag,
    parseText: parseText,
    laden: function () {
      if (cache) return cache;
      var heute = new Date();
      heute.setHours(0, 0, 0, 0);
      cache = fetch(DATEI, { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (text) { return zusammenfuehren(parseText(text), heute); })
        .catch(function (err) {
          /* Datei fehlt oder ist kaputt: wenigstens die Treffs anzeigen */
          if (window.console) console.warn('termine.txt konnte nicht geladen werden', err);
          return zusammenfuehren([], heute);
        });
      return cache;
    }
  };
})();
