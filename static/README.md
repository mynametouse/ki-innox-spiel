# Statische Ein-Datei-Version

`index.html` ist das komplette Spiel in einer Datei (CSS, JS, Schrift, QR-Erzeugung inline, keine externen Abrufe).
Gedacht für `https://apps.lab.reallabore.berlin/falko/` (Veröffentlichen-Aktion in Open WebUI).

- Runden werden **im Browser des Geräts** gespeichert (`localStorage`, Schlüssel `bsw-plays-v3`).
  Am Stand-Laptop sammeln sich alle Runden; Export über `#statistik` → „Daten (JSON)“ / „Tabelle (CSV)“.
  Bitte täglich exportieren und nicht im privaten Fenster spielen.
- Kontakt läuft per E-Mail (mailto-Link bzw. QR auf dem Laptop), getrennt von den Spieldaten.
- Gebaut mit `build.js` aus den Quellen in `public/` (Stand 06.11.2026).

## Stand-Bildschirm
`…/#bildschirm` zeigt statt des Spiels ein animiertes Plakat mit großem QR-Code (zeigt auf die Adresse ohne `#bildschirm`),
Mini-Chat mit Kais Originalvorschlägen und Projektrahmen. Klick = Vollbild, Mauszeiger verschwindet, Bildschirm bleibt wach (Wake Lock).
Quelle: `poster.js` (läuft in einem Shadow DOM, unabhängig vom Spiel-CSS).

## Variante mit zentraler Speicherung
`index_server.html` = gleiche Datei, aber anonyme Runden gehen per `PUT https://science.reallabore.berlin/api/plays/:id`
an den Projektserver (CORS für apps.lab.reallabore.berlin in `server.js`). Statistik (`#statistik`) zeigt dann alle Runden.
Erst veröffentlichen, wenn https://science.reallabore.berlin/api/plays antwortet.
Bauen: `BSW_API=https://science.reallabore.berlin/api BSW_OUT=index_server.html node build.js`
