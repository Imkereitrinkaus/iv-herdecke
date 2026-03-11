/**
 * gallery.js – Imkerverein Herdecke-Ende e.V.
 * Galerie-Filter und Lightbox-Funktion
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. GALERIE-FILTER (nach Kategorie)
  ---------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.gallery-filter .filter-btn');
  const galleryItems  = document.querySelectorAll('.gallery-item');

  if (filterButtons.length && galleryItems.length) {

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        /* Aktive Klasse wechseln */
        filterButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const selectedCategory = btn.dataset.filter;

        galleryItems.forEach((item) => {
          if (selectedCategory === 'alle' || item.dataset.kategorie === selectedCategory) {
            item.style.display = '';
            /* Kurze Animation für gefiltertes Einblenden */
            item.style.animation = 'none';
            item.offsetHeight; // Reflow erzwingen
            item.style.animation = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------------
     2. LIGHTBOX
  ---------------------------------------------------------------- */
  const lightbox       = document.getElementById('lightbox');
  const lightboxImg    = document.getElementById('lightbox-img');
  const lightboxPh     = document.getElementById('lightbox-placeholder');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose  = document.getElementById('lightbox-close');
  const lightboxPrev   = document.getElementById('lightbox-prev');
  const lightboxNext   = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');

  if (!lightbox) return;

  let currentIndex = 0;
  /* Nur aktuell sichtbare Items */
  const getVisibleItems = () =>
    Array.from(galleryItems).filter((el) => el.style.display !== 'none');

  const openLightbox = (index) => {
    const visible = getVisibleItems();
    if (!visible.length) return;

    currentIndex = Math.max(0, Math.min(index, visible.length - 1));
    const item = visible[currentIndex];

    const imgSrc  = item.dataset.src || '';
    const caption = item.dataset.caption || item.querySelector('img')?.alt || '';
    const emoji   = item.dataset.emoji || '🐝';

    if (imgSrc) {
      if (lightboxImg)  { lightboxImg.src = imgSrc; lightboxImg.style.display = 'block'; }
      if (lightboxPh)   { lightboxPh.style.display = 'none'; }
    } else {
      /* Kein echtes Bild: Platzhalter anzeigen */
      if (lightboxImg)  { lightboxImg.style.display = 'none'; }
      if (lightboxPh)   {
        lightboxPh.textContent = emoji;
        lightboxPh.style.display = 'flex';
      }
    }

    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${visible.length}`;
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Fokus auf Schließen-Button */
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showPrev = () => {
    const visible = getVisibleItems();
    openLightbox((currentIndex - 1 + visible.length) % visible.length);
  };

  const showNext = () => {
    const visible = getVisibleItems();
    openLightbox((currentIndex + 1) % visible.length);
  };

  /* Galerie-Items: Klick öffnet Lightbox */
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const visibleIndex = visible.indexOf(item);
      openLightbox(visibleIndex >= 0 ? visibleIndex : index);
    });

    /* Tastatur: Enter / Leertaste */
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  /* Schließen */
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  /* Navigation */
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
  if (lightboxNext) lightboxNext.addEventListener('click', showNext);

  /* Klick auf Hintergrund schließt Lightbox */
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* Tastatur-Navigation */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });

  /* Touch-Swipe für Mobile */
  let touchStartX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showNext();
      } else {
        showPrev();
      }
    }
  }, { passive: true });

})();
