# Statische Ein-Datei-Version

`index.html` ist das komplette Spiel in einer Datei (CSS, JS, Schrift, QR-Erzeugung inline, keine externen Abrufe).
Gedacht für `https://apps.lab.reallabore.berlin/falko/` (Veröffentlichen-Aktion in Open WebUI).

- Runden werden **im Browser des Geräts** gespeichert (`localStorage`, Schlüssel `bsw-plays-v3`).
  Am Stand-Laptop sammeln sich alle Runden; Export über `#statistik` → „Daten (JSON)“ / „Tabelle (CSV)“.
  Bitte täglich exportieren und nicht im privaten Fenster spielen.
- Kontakt läuft per E-Mail (mailto-Link bzw. QR auf dem Laptop), getrennt von den Spieldaten.
- Gebaut mit `build.js` aus den Quellen in `public/` (Stand 06.11.2026).
