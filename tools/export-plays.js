/* Anonyme Spieldaten als CSV, eine Zeile je Entscheidung (Semikolon). Aufruf: node tools/export-plays.js > spieldaten.csv */
"use strict";
const fs = require("fs"), path = require("path");
const dir = path.join(process.env.DATA_DIR || path.join(__dirname, "..", "data"), "plays");
const plays = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) : [];
const cols = ["id", "day", "sid", "rn", "sc", "lang", "dev", "dur", "alter", "haltung", "gruppe", "rolle", "betrieb", "kinutzung", "haltung2",
  "schritt", "nr", "option", "stufe", "absicherung", "zwischenfall", "offenlegung", "grund", "position", "reihenfolge", "sw_schritt", "sw_bedingung", "sw_antwort", "ergebnis", "zeit", "vertrauen", "risiko", "abhaengigkeit"];
const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
const out = [cols.join(";")];
for (const p of plays) {
  const pr = p.prof || {}, sw = p.sw || {}, m = p.m || {};
  (p.ch || []).forEach((c, i) => {
    out.push([p.id, p.day, p.sid, p.rn, p.sc, p.lang, p.dev, p.dur, pr.alter, pr.haltung, pr.gruppe, pr.rolle, pr.betrieb, pr.kinutzung, pr.haltung2,
      c.d, i + 1, c.o, c.l, c.s ? 1 : 0, c.inc ? 1 : 0, c.disc, c.why, c.pos, c.ord, sw.d, sw.cond, sw.ans, p.end, m.z, m.v, m.r, m.a].map(esc).join(";"));
  });
}
process.stdout.write("﻿" + out.join("\n") + "\n");
