/**
 * news.js – Imkerverein Herdecke-Ende e.V.
 * „Weitere Beiträge anzeigen“ auf der Seite Aktuelles
 */

/* Mehr laden – klappt die zweite Kachelreihe auf */
(function () {
  const btn = document.getElementById('load-more-btn');
  const grid = document.getElementById('news-grid-secondary');
  if (!btn || !grid) return;
  btn.addEventListener('click', function () {
    grid.classList.remove('news-hidden');
    grid.style.display = 'grid';
    btn.style.display = 'none';
    btn.setAttribute('aria-expanded', 'true');
    /* Scroll-Reveal für nachgeladene Karten */
    grid.querySelectorAll('.news-card').forEach(function (card) {
      card.classList.add('reveal', 'revealed');
    });
  });
})();
