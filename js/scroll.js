/**
 * scroll.js – Imkerverein Herdecke-Ende e.V.
 * Scroll-Reveal-Animationen mit IntersectionObserver
 */

(function () {
  'use strict';

  /* IntersectionObserver für .reveal-Elemente */
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  /* Unterstützungsprüfung */
  if (!('IntersectionObserver' in window)) {
    /* Fallback: alle Elemente sofort sichtbar */
    revealElements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observerOptions = {
    root: null,          // Viewport
    rootMargin: '0px 0px -60px 0px', // Etwas vor dem unteren Rand
    threshold: 0.1       // 10 % des Elements müssen sichtbar sein
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Einmalig
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));

  /* ----------------------------------------------------------------
     Hero-Parallax: leichter Ken-Burns-Effekt
  ---------------------------------------------------------------- */
  const heroBg = document.querySelector('.hero__bg');

  if (heroBg) {
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.add('in-view');
    }

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroHeight = hero ? hero.offsetHeight : 600;

      if (scrolled < heroHeight) {
        /* Leichter Parallax-Versatz */
        const offset = scrolled * 0.3;
        heroBg.style.transform = `translateY(${offset}px)`;
      }
    }, { passive: true });
  }

})();
