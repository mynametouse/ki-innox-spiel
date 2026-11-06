/* Löscht alle Einträge einer E-Mail-Adresse aus der Kontaktliste (Widerruf).
   Aufruf: node tools/delete-contact.js name@example.org */
"use strict";
const fs = require("fs"), path = require("path");
const file = path.join(process.env.DATA_DIR || path.join(__dirname, "..", "data"), "contacts.jsonl");
const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) { console.error("Bitte E-Mail-Adresse angeben."); process.exit(1); }
if (!fs.existsSync(file)) { console.log("Keine Kontaktliste vorhanden."); process.exit(0); }
const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
const keep = lines.filter(l => { try { return JSON.parse(l).email !== email; } catch (e) { return true; } });
fs.writeFileSync(file + ".tmp", keep.map(l => l + "\n").join(""), { mode: 0o600 });
fs.renameSync(file + ".tmp", file);
console.log(`${lines.length - keep.length} Eintrag/Einträge gelöscht.`);
