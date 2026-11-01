/**
 * termine.js – Imkerverein Herdecke-Ende e.V.
 * Zeigt die Termine aus data/termine.txt an (siehe termine-daten.js):
 *  – [data-termine]      Terminliste, optional begrenzt mit data-limit="3"
 *  – [data-next-treff]   „Nächster Treff: …“
 */

(function () {
  'use strict';

  if (!window.IVTermine) return;

  var MONATE_KURZ = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                'August', 'September', 'Oktober', 'November', 'Dezember'];
  var WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  var ARTEN = {
    treff:       { label: 'Imkertreff', badge: 'termin-badge--regulaer' },
    vortrag:     { label: 'Vortrag',    badge: 'termin-badge--vortrag' },
    praxis:      { label: 'Praxis',     badge: 'termin-badge--praxis' },
    neuimker:    { label: 'Neuimker',   badge: 'termin-badge--vortrag' },
    oeffentlich: { label: 'Öffentlich', badge: 'termin-badge--oeffentlich' },
    entfaellt:   { label: 'Entfällt',   badge: 'termin-badge--entfaellt' }
  };

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function langesDatum(d) {
    return WOCHENTAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()] + ' ' + d.getFullYear();
  }

  function kurzerOrt(ort) {
    return ort === window.IVTermine.STANDARD_ORT ? 'Sportlertreff Herdecke-Ende' : ort;
  }

  function terminElement(t) {
    var art = ARTEN[t.art] || ARTEN.treff;
    var item = el('article', 'termin-item termin-item--' + t.art);
    item.setAttribute('role', 'listitem');

    var datum = el('div', 'termin-date');
    datum.setAttribute('aria-label', langesDatum(t.datum));
    datum.appendChild(el('span', 'termin-date__day', String(t.datum.getDate())));
    datum.appendChild(el('span', 'termin-date__month', MONATE_KURZ[t.datum.getMonth()]));
    datum.appendChild(el('span', 'termin-date__year', String(t.datum.getFullYear())));

    var info = el('div', 'termin-info');
    info.appendChild(el('h3', 'termin-info__title', t.titel));
    var meta = el('div', 'termin-info__meta');
    meta.appendChild(el('span', 'termin-meta', WOCHENTAGE[t.datum.getDay()] + ', ' + t.zeit));
    meta.appendChild(el('span', 'termin-meta', kurzerOrt(t.ort)));
    info.appendChild(meta);
    if (t.text) info.appendChild(el('p', 'termin-info__desc', t.text));

    item.appendChild(datum);
    item.appendChild(info);
    item.appendChild(el('span', 'termin-badge ' + art.badge, art.label));
    return item;
  }

  function listenAnzeigen(termine) {
    document.querySelectorAll('[data-termine]').forEach(function (container) {
      var limit = Number(container.dataset.limit) || termine.length;
      container.textContent = '';
      termine.slice(0, limit).forEach(function (t) {
        container.appendChild(terminElement(t));
      });
      container.setAttribute('aria-busy', 'false');
    });
  }

  function naechsterTreffAnzeigen(termine) {
    var treff = termine.filter(function (t) {
      var zd = window.IVTermine.zweiterDienstag(t.datum.getFullYear(), t.datum.getMonth());
      return t.datum.getTime() === zd.getTime() && t.art !== 'entfaellt';
    })[0];
    if (!treff) return;

    var text = langesDatum(treff.datum) + ', ' + treff.zeit +
      (treff.titel !== 'Imkertreff' ? ' – ' + treff.titel : '');

    document.querySelectorAll('[data-next-treff]').forEach(function (box) {
      var out = box.querySelector('[data-next-treff-text]') || box;
      out.textContent = text;
      box.hidden = false;
    });
  }

  window.IVTermine.laden().then(function (termine) {
    listenAnzeigen(termine);
    naechsterTreffAnzeigen(termine);
  });
})();
