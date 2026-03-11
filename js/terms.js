/**
 * terms.js – Imkerverein Herdecke-Ende e.V.
 * Terminfilter nach Kategorie und Monat
 */

(function () {
  'use strict';

  const filterButtons = document.querySelectorAll('.termine-filter .filter-btn');
  const terminItems   = document.querySelectorAll('.termin-item');
  const noResults     = document.getElementById('termine-no-results');

  if (!filterButtons.length || !terminItems.length) return;

  /* ----- Filter-Logik ----- */
  const applyFilter = (activeFilter) => {
    let visibleCount = 0;

    terminItems.forEach((item) => {
      const kategorie = item.dataset.kategorie || '';
      const monat     = item.dataset.monat || '';

      const matches =
        activeFilter === 'alle' ||
        kategorie === activeFilter ||
        monat === activeFilter;

      if (matches) {
        item.style.display = '';
        /* Smooth Einblend-Effekt */
        item.style.opacity = '0';
        item.style.transform = 'translateX(-8px)';
        requestAnimationFrame(() => {
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        });
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    /* „Keine Termine"-Meldung */
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  /* ----- Button-Klick ----- */
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter || 'alle';
      applyFilter(filter);
    });
  });

  /* Initial: alle anzeigen */
  applyFilter('alle');

})();
