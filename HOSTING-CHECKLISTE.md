# Checkliste für den Admin: neue Website auf dem bisherigen Webspace

Die Domain muss **nicht** offline gehen. Die Nextcloud läuft weiter;
ausgetauscht werden nur die Dateien der alten Website.

> Diese Datei wird vom Webserver nicht ausgeliefert (`.htaccess` sperrt `*.md`).

## 1. Zugänge absichern (zuerst!)
- [ ] Passwörter ändern: Hoster-Kundenkonto, FTP/SFTP, Datenbank(en), E-Mail-Postfächer
- [ ] Zwei-Faktor-Anmeldung (2FA) beim Hoster einschalten
- [ ] Unbekannte FTP-Benutzer, Cronjobs, E-Mail-Weiterleitungen und SSH-Schlüssel löschen
- [ ] Künftig nur noch SFTP statt FTP verwenden

## 2. Nextcloud prüfen
Die alte Website lag auf demselben Webspace – ein Angreifer könnte also
auch die Nextcloud-Dateien gesehen oder verändert haben.
- [ ] Nextcloud auf die aktuelle Version bringen (inkl. Apps)
- [ ] Verwaltung → Übersicht: Sicherheits- und Integritätsprüfung ohne Warnungen?
      (oder `occ integrity:check-core`)
- [ ] Unbekannte Benutzer, Admins, Apps oder App-Passwörter entfernen
- [ ] Passwort des Datenbank-Benutzers ändern und in `config/config.php` nachtragen
- [ ] Alle Nextcloud-Admins: neues Passwort + 2FA
- [ ] Externer Check: https://scan.nextcloud.com
- [ ] Falls Mitgliederdaten betroffen sein könnten: prüfen, ob eine Meldung an die
      LDI NRW nötig ist (Art. 33 DSGVO, innerhalb von 72 Stunden ab Kenntnis)

## 3. Alte Website entfernen
- [ ] Vorher Backup der alten Website ziehen (für eine spätere Analyse), aber nicht wieder einspielen
- [ ] **Alle** Dateien und Ordner der alten Website löschen – nicht die Nextcloud!
- [ ] Datenbank der alten Website löschen, falls es eine gab (z. B. WordPress)
- [ ] Ideal: Website und Nextcloud in getrennten Ordnern **nebeneinander** anlegen,
      Domain → Website-Ordner, Subdomain (z. B. `cloud.…`) → Nextcloud-Ordner

## 4. Neue Website hochladen
- [ ] **Vorschau-Sperre entfernen:** in `index.html`, `ueber-uns.html`, `termine.html`,
      `mitglied-werden.html` und `kontakt.html` die zwei Zeilen
      `<!-- VORSCHAU-SPERRE … -->` und `<meta name="robots" content="noindex, nofollow">` löschen
      (sonst erscheint die Seite nicht bei Google)
- [ ] SSL-Zertifikat beim Hoster aktiv (sonst funktioniert die HTTPS-Weiterleitung nicht)
- [ ] Alle Dateien aus diesem Repository hochladen, **inklusive `.htaccess`**
      (ohne `.git`, `HOSTING-CHECKLISTE.md` kann weggelassen werden)
- [ ] Nextcloud-Ordner oder -Subdomain heißt nicht `cloud`, `nextcloud` oder `owncloud`?
      → Namen in `.htaccess` an den zwei Stellen mit `[NEXTCLOUD]` ergänzen
- [ ] Testen: Website lädt, Nextcloud (Web + Sync-Client + Handy-App) funktioniert
- [ ] Optional: https://securityheaders.com mit der Website-Adresse prüfen
