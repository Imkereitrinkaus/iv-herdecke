/**
 * form.js – Imkerverein Herdecke-Ende e.V.
 * Clientseitige Formularvalidierung und Feedback
 */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  /* ----- Hilfsfunktionen ----- */

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const showError = (input, errorEl, message) => {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  };

  const clearError = (input, errorEl) => {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    errorEl.classList.remove('visible');
  };

  /* ----- Felder und zugehörige Fehlermeldungen ----- */
  const fields = {
    name: {
      input: form.querySelector('#contact-name'),
      error: form.querySelector('#error-name'),
      validate: (val) => {
        if (!val.trim()) return 'Bitte geben Sie Ihren Namen ein.';
        if (val.trim().length < 2) return 'Der Name muss mindestens 2 Zeichen lang sein.';
        return null;
      }
    },
    email: {
      input: form.querySelector('#contact-email'),
      error: form.querySelector('#error-email'),
      validate: (val) => {
        if (!val.trim()) return 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
        if (!isValidEmail(val)) return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        return null;
      }
    },
    message: {
      input: form.querySelector('#contact-message'),
      error: form.querySelector('#error-message'),
      validate: (val) => {
        if (!val.trim()) return 'Bitte geben Sie eine Nachricht ein.';
        if (val.trim().length < 10) return 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
        return null;
      }
    },
    datenschutz: {
      input: form.querySelector('#contact-datenschutz'),
      error: form.querySelector('#error-datenschutz'),
      validate: (val, input) => {
        if (input && !input.checked) {
          return 'Bitte bestätigen Sie die Datenschutzhinweise.';
        }
        return null;
      }
    }
  };

  /* ----- Live-Validierung beim Verlassen eines Feldes ----- */
  Object.values(fields).forEach(({ input, error, validate }) => {
    if (!input || !error) return;

    const isCheckbox = input.type === 'checkbox';

    input.addEventListener(isCheckbox ? 'change' : 'blur', () => {
      const val = isCheckbox ? input.value : input.value;
      const errorMsg = validate(val, input);
      if (errorMsg) {
        showError(input, error, errorMsg);
      } else {
        clearError(input, error);
      }
    });

    /* Fehler bei Eingabe entfernen */
    if (!isCheckbox) {
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          const errorMsg = validate(input.value, input);
          if (!errorMsg) clearError(input, error);
        }
      });
    }
  });

  /* ----- Formular absenden ----- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    Object.values(fields).forEach(({ input, error, validate }) => {
      if (!input || !error) return;
      const val = input.type === 'checkbox' ? input.value : input.value;
      const errorMsg = validate(val, input);
      if (errorMsg) {
        showError(input, error, errorMsg);
        isValid = false;
      } else {
        clearError(input, error);
      }
    });

    if (!isValid) {
      /* Fokus auf erstes fehlerhaftes Feld */
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    /* ---- Formular gilt als gültig ----
       Da dies eine statische Website ohne Backend ist,
       wird lediglich eine Erfolgsmeldung angezeigt.
       In der Praxis würde hier ein fetch() / fetch-API-Aufruf stattfinden. */

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';
    }

    /* Simuliertes Senden mit kurzem Delay */
    setTimeout(() => {
      form.reset();

      if (successMsg) {
        successMsg.classList.add('visible');
        successMsg.focus();
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht senden';
      }

      /* Erfolgsmeldung nach 8 Sekunden automatisch ausblenden */
      setTimeout(() => {
        if (successMsg) successMsg.classList.remove('visible');
      }, 8000);

    }, 800);
  });

})();
