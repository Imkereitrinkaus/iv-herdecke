/**
 * terms.js – Imkerverein Herdecke-Ende e.V.
 * Lädt Termine aus data/termine.json per fetch().
 * – Erster Ladevorgang beim Seitenaufruf
 * – Automatische Aktualisierung, wenn der Tab wieder aktiv wird
 * – Manuelles Neu-Laden per Button
 * – No-Cache-Strategie beim Fetch
 * – Idempotentes Rendering, Filterzustand bleibt erhalten
 * – Ablauflogik: Termin sichtbar am Veranstaltungstag + 2 weitere Tage
 */

(function () {
  'use strict';

  var FETCH_URL        = 'data/termine.json';

  var allTermine   = [];
  var activeFilter = 'alle';
  var lastRawJSON  = '';

  var listContainer = document.getElementById('termine-container');
  var noResultsEl   = document.getElementById('termine-no-results');
  var errorEl       = document.getElementById('termine-error');
  var filterButtons = document.querySelectorAll('.termine-filter .filter-btn');
  var refreshBtn    = document.getElementById('termine-refresh-btn');
  var lastUpdatedEl = document.getElementById('termine-last-updated');

  /* ----------------------------------------------------------------
     Ablaufprüfung
     Sichtbar: Veranstaltungstag + 2 weitere Kalendertage.
     Beispiel: 10.05. → sichtbar 10., 11., 12.05. Ab 13.05. hidden.
  ---------------------------------------------------------------- */
  /* "YYYY-MM-DD" als lokales Datum lesen (new Date("YYYY-MM-DD") wäre UTC) */
  function parseDatum(datum) {
    var p = String(datum).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function isVisible(datum) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var termDate = parseDatum(datum);
    var cutoff = new Date(termDate);
    cutoff.setDate(cutoff.getDate() + 2);
    return cutoff >= today;
  }

  function badgeClass(kategorie) {
    var map = {
      treff:    'termin-badge--regulaer',
      saison:   'termin-badge--praxis',
      vortrag:  'termin-badge--vortrag',
      neuimker: 'termin-badge--vortrag',
      aktion:   'termin-badge--oeffentlich'
    };
    return map[kategorie] || 'termin-badge--regulaer';
  }

  function badgeLabel(kategorie) {
    var map = {
      treff:    'Vereinstreff',
      saison:   'Praxis',
      vortrag:  'Fachvortrag',
      neuimker: 'Neuimker',
      aktion:   'Öffentlich'
    };
    return map[kategorie] || kategorie;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildTerminEl(t) {
    var item = document.createElement('div');
    item.className      = 'termin-item revealed';
    item.dataset.kategorie = t.kategorie;
    item.dataset.id        = t.id;
    item.setAttribute('role', 'listitem');
    if (t.hervorgehoben) { item.style.borderLeftWidth = '5px'; }

    var dateBlock = document.createElement('div');
    dateBlock.className = 'termin-date';
    dateBlock.setAttribute('aria-label', t.tag + '. ' + t.monat + ' ' + t.jahr);

    var dayEl   = document.createElement('span');
    dayEl.className   = 'termin-date__day';
    dayEl.textContent = t.tag;
    var monthEl = document.createElement('span');
    monthEl.className   = 'termin-date__month';
    monthEl.textContent = t.monat;
    var yearEl  = document.createElement('span');
    yearEl.className   = 'termin-date__year';
    yearEl.textContent = t.jahr;
    dateBlock.appendChild(dayEl);
    dateBlock.appendChild(monthEl);
    dateBlock.appendChild(yearEl);

    var info    = document.createElement('div');
    info.className = 'termin-info';

    var titleEl = document.createElement('h3');
    titleEl.className   = 'termin-info__title';
    titleEl.textContent = t.titel;

    var meta    = document.createElement('div');
    meta.className = 'termin-info__meta';

    var zeitSpan      = document.createElement('span');
    zeitSpan.className   = 'termin-meta';
    zeitSpan.innerHTML   = '<span aria-hidden="true">🕖</span> ' + escapeHTML(t.zeit);
    var ortSpan       = document.createElement('span');
    ortSpan.className    = 'termin-meta';
    ortSpan.innerHTML    = '<span aria-hidden="true">📍</span> ' + escapeHTML(t.ort);
    meta.appendChild(zeitSpan);
    meta.appendChild(ortSpan);

    var descEl  = document.createElement('p');
    descEl.className   = 'termin-info__desc';
    descEl.textContent = t.text;

    info.appendChild(titleEl);
    info.appendChild(meta);
    info.appendChild(descEl);

    var badge   = document.createElement('span');
    badge.className   = 'termin-badge ' + badgeClass(t.kategorie);
    badge.textContent = badgeLabel(t.kategorie);

    item.appendChild(dateBlock);
    item.appendChild(info);
    item.appendChild(badge);
    return item;
  }

  /* ----------------------------------------------------------------
     Rendering
  ---------------------------------------------------------------- */
  function render(data) {
    var sichtbar = data.filter(function (t) { return isVisible(t.datum); });
    sichtbar.sort(function (a, b) { return parseDatum(a.datum) - parseDatum(b.datum); });

    listContainer.innerHTML = '';

    if (sichtbar.length === 0) {
      showNoResults(true);
      return;
    }
    showNoResults(false);

    var frag = document.createDocumentFragment();
    sichtbar.forEach(function (t) { frag.appendChild(buildTerminEl(t)); });
    listContainer.appendChild(frag);

    applyFilter(activeFilter);
    setLastUpdated();
  }

  function applyFilter(filter) {
    activeFilter = filter;
    var items   = listContainer.querySelectorAll('.termin-item');
    var visible = 0;
    items.forEach(function (item) {
      var show = filter === 'alle' || item.dataset.kategorie === filter;
      item.style.display = show ? '' : 'none';
      if (show) { visible++; }
    });
    showNoResults(visible === 0 && listContainer.children.length > 0);
  }

  /* ----------------------------------------------------------------
     UI-Zustand
  ---------------------------------------------------------------- */
  function showError(on) {
    if (errorEl)     { errorEl.style.display     = on ? 'block' : 'none'; }
  }

  function showNoResults(on) {
    if (noResultsEl) { noResultsEl.style.display = on ? 'block' : 'none'; }
  }

  function setLastUpdated() {
    if (!lastUpdatedEl) { return; }
    var now = new Date();
    var h   = String(now.getHours()).padStart(2, '0');
    var m   = String(now.getMinutes()).padStart(2, '0');
    lastUpdatedEl.textContent = 'Zuletzt aktualisiert: ' + h + ':' + m + ' Uhr';
  }

  function setRefreshBtnState(loading) {
    if (!refreshBtn) { return; }
    refreshBtn.disabled     = loading;
    refreshBtn.textContent  = loading ? 'Wird geladen \u2026' : '\u21BB Termine aktualisieren';
  }

  /* ----------------------------------------------------------------
     Fetch mit No-Cache-Strategie
  ---------------------------------------------------------------- */
  function fetchTermine(force) {
    showError(false);
    setRefreshBtnState(true);

    fetch(FETCH_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        return res.json();
      })
      .then(function (data) {
        var raw = JSON.stringify(data);
        if (raw !== lastRawJSON || force) {
          lastRawJSON = raw;
          allTermine  = data;
          render(data);
        } else {
          setLastUpdated();
        }
      })
      .catch(function () {
        showError(true);
      })
      .finally(function () {
        setRefreshBtnState(false);
      });
  }

  /* ----------------------------------------------------------------
     Auto-Refresh: neu laden, wenn der Tab wieder sichtbar wird
     (statt ständigem Abfragen im Hintergrund)
  ---------------------------------------------------------------- */
  function startAutoRefresh() {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { fetchTermine(false); }
    });
  }

  /* ----------------------------------------------------------------
     Event-Listener
  ---------------------------------------------------------------- */
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter || 'alle');
    });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () { fetchTermine(true); });
  }

  /* ----------------------------------------------------------------
     Init
  ---------------------------------------------------------------- */
  fetchTermine(true);
  startAutoRefresh();

}());
