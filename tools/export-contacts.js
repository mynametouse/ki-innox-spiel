/* Kontaktliste als CSV (Semikolon) auf die Standardausgabe. Aufruf: node tools/export-contacts.js > kontakte.csv */
"use strict";
const fs = require("fs"), path = require("path");
const file = path.join(process.env.DATA_DIR || path.join(__dirname, "..", "data"), "contacts.jsonl");
const cols = ["datum", "email", "vorname", "nachname", "organisation", "zwecke", "einwilligung", "sprache"];
const esc = v => '"' + String(Array.isArray(v) ? v.join(",") : v == null ? "" : v).replace(/"/g, '""') + '"';
const rows = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
process.stdout.write("﻿" + cols.join(";") + "\n" + rows.map(r => cols.map(c => esc(r[c])).join(";")).join("\n") + "\n");
