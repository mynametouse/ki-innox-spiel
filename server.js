/* KI-InnoX · „Wer drückt auf Senden?“ – kleiner Server für Spiel, anonyme Spieldaten und getrennte Kontaktliste.
   Keine Fremdbibliotheken. Node 18+.
   - Spieldaten:   PUT /api/plays/:id  → data/plays/<id>.json   (anonym; CORS für ALLOW_ORIGINS)
                   GET /api/plays      → alle Runden als Liste (für die Live-Statistik)
   - Kontakte:     POST /api/contacts  → data/contacts.jsonl    (nur Datum, keine Uhrzeit, keine IP, keine Spiel-ID)
   - Seiten:       /  (Spiel), /kontakt (Kontaktformular), /#statistik (Live-Statistik)
   Es werden keine Zugriffe protokolliert. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8000);
const DATA = process.env.DATA_DIR || path.join(__dirname, "data");
const PUB = path.join(__dirname, "public");
const PLAYS = path.join(DATA, "plays");
const CONTACTS = path.join(DATA, "contacts.jsonl");
const CONSENT_VERSION = "v1-2026-11-06";
const ZWECKE = ["workshops", "befragung", "news"];

fs.mkdirSync(PLAYS, { recursive: true });

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json; charset=utf-8" };
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

function headers(extra) {
  return Object.assign({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Content-Security-Policy": CSP, "Cache-Control": "no-store" }, extra || {});
}
function sendJson(res, code, obj) {
  res.writeHead(code, headers({ "Content-Type": MIME[".json"] }));
  res.end(JSON.stringify(obj));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > limit) { reject(new Error("too_large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function berlinDate() { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date()); }

/* ---------- Spieldaten ---------- */
let playsCache = null;
function allPlays() {
  if (playsCache) return playsCache;
  playsCache = fs.readdirSync(PLAYS).filter(f => f.endsWith(".json")).map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(PLAYS, f), "utf8")); } catch (e) { return null; }
  }).filter(Boolean);
  return playsCache;
}
async function putPlay(req, res, id) {
  if (!/^[a-z0-9]{4,20}-\d{10,16}$/.test(id)) return sendJson(res, 400, { error: "bad_id" });
  let doc;
  try { doc = JSON.parse(await readBody(req, 32 * 1024)); } catch (e) { return sendJson(res, 400, { error: "bad_body" }); }
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.id !== id || doc.v !== 3) return sendJson(res, 400, { error: "bad_doc" });
  const file = path.join(PLAYS, id + ".json"), tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(doc));
  fs.renameSync(tmp, file);
  playsCache = null;
  sendJson(res, 200, { ok: true, id });
}

/* ---------- Kontakte (getrennt, ohne Verbindung zum Spiel) ---------- */
let windowStart = Date.now(), windowCount = 0;
function str(v, max) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }
async function postContact(req, res) {
  if (Date.now() - windowStart > 60000) { windowStart = Date.now(); windowCount = 0; }
  if (++windowCount > 30) return sendJson(res, 429, { error: "busy" });
  let b;
  try { b = JSON.parse(await readBody(req, 4 * 1024)); } catch (e) { return sendJson(res, 400, { error: "bad_body" }); }
  if (!b || typeof b !== "object") return sendJson(res, 400, { error: "bad_body" });
  if (b.website) return sendJson(res, 200, { ok: true }); /* Honigtopf für Bots: stillschweigend verwerfen */
  const email = str(b.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return sendJson(res, 400, { error: "email" });
  const zwecke = Array.isArray(b.zwecke) ? b.zwecke.filter(z => ZWECKE.includes(z)) : [];
  if (!zwecke.length) return sendJson(res, 400, { error: "zwecke" });
  if (b.consent !== true || b.age16 !== true) return sendJson(res, 400, { error: "consent" });
  const entry = { datum: berlinDate(), email, vorname: str(b.vorname, 80), nachname: str(b.nachname, 80), organisation: str(b.organisation, 120),
    zwecke, einwilligung: CONSENT_VERSION, sprache: b.lang === "en" ? "en" : "de" };
  fs.appendFileSync(CONTACTS, JSON.stringify(entry) + "\n", { mode: 0o600 });
  sendJson(res, 200, { ok: true });
}

/* ---------- Statische Seiten ---------- */
function serveStatic(req, res, pathname) {
  let rel = pathname === "/" ? "index.html" : pathname === "/kontakt" || pathname === "/kontakt/" ? "kontakt.html" : pathname.slice(1);
  const file = path.normalize(path.join(PUB, rel));
  if (!file.startsWith(PUB + path.sep)) { res.writeHead(400); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, headers({ "Content-Type": "text/plain; charset=utf-8" })); return res.end("Nicht gefunden"); }
    res.writeHead(200, headers({ "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" }));
    res.end(buf);
  });
}

/* Spiel-Seiten auf anderen Adressen (z. B. apps.lab.reallabore.berlin) dürfen anonyme Runden senden und lesen */
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || "https://apps.lab.reallabore.berlin").split(",").map(s => s.trim()).filter(Boolean);
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ALLOW_ORIGINS.includes(o)) {
    res.setHeader("Access-Control-Allow-Origin", o);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
  }
}

http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://localhost");
    if (pathname === "/api/plays" || pathname.startsWith("/api/plays/")) {
      cors(req, res);
      if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    }
    const m = pathname.match(/^\/api\/plays\/([^/]+)$/);
    if (m && req.method === "PUT") return await putPlay(req, res, decodeURIComponent(m[1]));
    if (pathname === "/api/plays" && req.method === "GET") return sendJson(res, 200, allPlays());
    if (pathname === "/api/contacts" && req.method === "POST") return await postContact(req, res);
    if (pathname.startsWith("/api/")) return sendJson(res, 404, { error: "not_found" });
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res, pathname);
    res.writeHead(405); res.end();
  } catch (e) {
    console.error("Fehler:", e.message);
    if (!res.headersSent) sendJson(res, 500, { error: "server" });
  }
}).listen(PORT, () => console.log(`KI-InnoX-Spiel läuft auf Port ${PORT}`));
