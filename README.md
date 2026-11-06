# KI-InnoX · „Wer drückt auf Senden?“

Forschungsspiel des Projekts KI-InnoX (IFAF Berlin mit HWR, HTW und ASH Berlin) für die Berlin Science Week 2026.

- Spiel: https://science.reallabore.berlin/
- Live-Statistik: https://science.reallabore.berlin/#statistik
- Kontaktformular: https://science.reallabore.berlin/kontakt

## Aufbau

- `public/`: Spiel (`index.html`, `app.js`, `data.js`, `logo.js`) und Kontaktformular (`kontakt.html`)
- `server.js`: kleiner Node-Server ohne Fremdbibliotheken, Port 8000
- `tools/`: Kontakt löschen (Widerruf), Kontakte und Spieldaten als CSV exportieren
- `deploy/bootstrap.sh`: einmalige Einrichtung auf dem Server (holt dieses Repo alle 2 Minuten ab)

## Daten

Im Volume `science-data`, nicht im Repo:
- `plays/<id>.json`: anonyme Spielrunden
- `contacts.jsonl`: freiwillige Kontaktliste, getrennt vom Spiel, nur mit Datum (keine Uhrzeit, keine IP, keine Spiel-ID)

Der Server protokolliert keine Zugriffe. Der Caddy-Block für die Domain schreibt keine Zugriffsprotokolle.

## Befehle auf dem Server

```sh
cd /opt/science
docker compose exec science node tools/delete-contact.js name@example.org   # Widerruf
docker compose exec science node tools/export-plays.js > /root/spieldaten.csv
docker compose exec science node tools/export-contacts.js > /root/kontakte.csv
```

Kontakte nach Projektende (31.12.2027) löschen.
