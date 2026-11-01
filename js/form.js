/**
 * form.js – Imkerverein Herdecke-Ende e.V.
 * Kontaktformular: Prüfung der Eingaben und Übergabe an das E-Mail-Programm.
 *
 * SICHERHEIT / SPAM:
 * Die Website verschickt selbst KEINE E-Mails – es gibt kein Server-Skript.
 * Beim Absenden öffnet sich das E-Mail-Programm der Besucherin bzw. des
 * Besuchers mit vorausgefüllter Nachricht. Dadurch kann das Formular nicht
 * von Spam-Bots missbraucht werden. Die Adresse steht nicht im HTML,
 * sondern wird erst hier zusammengesetzt (erschwert automatisches Auslesen).
 *
 * EINRICHTEN: Vereins-Adresse hier eintragen, z. B.
 *   name: 'vorstand', domain: 'imkerverein-herdecke.de'
 */
const KONTAKT_ADRESSE = { name: '', domain: '' };

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
      const val = input.value;
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

  /* ----- Versand und Rückmeldungen ----- */
  const errorBox = document.getElementById('form-error');

  const getAdresse = () =>
    KONTAKT_ADRESSE.name && KONTAKT_ADRESSE.domain
      ? KONTAKT_ADRESSE.name + '@' + KONTAKT_ADRESSE.domain
      : '';

  const showFormError = (message) => {
    if (successMsg) successMsg.classList.remove('visible');
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.hidden = false;
    errorBox.focus();
  };

  const showSuccess = (message) => {
    if (errorBox) errorBox.hidden = true;
    if (!successMsg) return;
    const text = successMsg.querySelector('[data-success-text]');
    if (text && message) text.textContent = message;
    successMsg.classList.add('visible');
    successMsg.focus();
  };

  const sendViaMailto = (address) => {
    const get = (sel) => (form.querySelector(sel)?.value || '').trim();
    const betreff = get('#contact-betreff') || 'Anfrage über die Website';
    const body =
      get('#contact-message') + '\n\n' +
      '— ' + get('#contact-name') + ' (' + get('#contact-email') + ')';
    window.location.href =
      'mailto:' + address +
      '?subject=' + encodeURIComponent(betreff) +
      '&body=' + encodeURIComponent(body);
    showSuccess(
      'Ihr E-Mail-Programm wurde mit der vorbereiteten Nachricht geöffnet – ' +
      'bitte senden Sie die E-Mail dort ab. Falls sich nichts öffnet, ' +
      'schreiben Sie uns direkt an ' + address + '.'
    );
  };

  /* ----- Formular absenden ----- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    Object.values(fields).forEach(({ input, error, validate }) => {
      if (!input || !error) return;
      const val = input.value;
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

    /* ---- Formular gilt als gültig → E-Mail-Programm öffnen ---- */
    const adresse = getAdresse();
    if (adresse) {
      sendViaMailto(adresse);
    } else {
      showFormError(
        'Das Kontaktformular ist derzeit noch nicht freigeschaltet. ' +
        'Bitte sprechen Sie uns beim nächsten Imkertreff an.'
      );
    }
  });

})();
