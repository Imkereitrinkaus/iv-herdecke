/**
 * nav.js – Imkerverein Herdecke-Ende e.V.
 * Sticky Header, Hamburger-Menü, aktiver Navigationszustand
 */

(function () {
  'use strict';

  /* ----- Elemente ermitteln ----- */
  const header      = document.querySelector('.site-header');
  const hamburger   = document.querySelector('.hamburger');
  const mobileNav   = document.querySelector('.mobile-nav');
  const navLinks    = document.querySelectorAll('.nav-list__link');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  /* ----------------------------------------------------------------
     1. STICKY HEADER – Scroll-Shadow
  ---------------------------------------------------------------- */
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initialer Check
  }

  /* ----------------------------------------------------------------
     2. HAMBURGER – Mobile Navigation öffnen / schließen
  ---------------------------------------------------------------- */
  if (hamburger && mobileNav) {

    const openMenu = () => {
      hamburger.classList.add('is-active');
      mobileNav.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Menü schließen');
      document.body.style.overflow = 'hidden'; // Scroll-Lock
    };

    const closeMenu = () => {
      hamburger.classList.remove('is-active');
      mobileNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Menü öffnen');
      document.body.style.overflow = '';
    };

    const toggleMenu = () => {
      if (hamburger.classList.contains('is-active')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    hamburger.addEventListener('click', toggleMenu);

    /* Tastatur: ESC schließt das Menü */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    /* Klick außerhalb des Menüs (auf Header-Bereich) schließt es */
    document.addEventListener('click', (e) => {
      if (
        mobileNav.classList.contains('is-open') &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    /* Menü bei Fenstergrößenänderung schließen (falls Wechsel zu Desktop) */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && mobileNav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    /* Mobile-Links schließen Menü nach Klick */
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ----------------------------------------------------------------
     3. AKTIVER NAVIGATIONSZUSTAND
     Vergleicht den aktuellen Pfad mit dem href der Links
  ---------------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const markActive = (links) => {
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();

      /* Startseite */
      if (linkFile === '' || linkFile === 'index.html') {
        if (currentPath === '' || currentPath === 'index.html') {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      } else if (linkFile === currentPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  markActive(navLinks);
  markActive(mobileLinks);

})();
