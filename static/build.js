// Baut eine einzige, eigenständige index.html (statisch, ohne Server, ohne externe Abrufe)
// für apps.lab.reallabore.berlin/falko/ (Open-WebUI-Aktion „Veröffentlichen“).
const fs = require("fs");
const path = require("path");
const SRC = "/home/claude/bsw2";
const NM = "/home/claude/npmtmp/node_modules";
const OUT = path.join(__dirname, "index.html");

const rd = f => fs.readFileSync(f, "utf8");
function rep(s, a, b, label) {
  if (!s.includes(a)) throw new Error("Patch nicht gefunden: " + label);
  return s.replace(a, b);
}

let html = rd(path.join(SRC, "index.html"));
let app = rd(path.join(SRC, "app.js"));
const data = rd(path.join(SRC, "data.js"));
const logo = rd(path.join(SRC, "logo.js"));
const poster = rd(path.join(SRC, "poster.js"));
const qr = rd(path.join(NM, "qrcode-generator/dist/qrcode.js"));

/* ---------- Schrift inline (Nunito, latin, SIL OFL) ---------- */
const fontCss = [400, 700, 800, 900].map(w => {
  const b64 = fs.readFileSync(path.join(NM, `@fontsource/nunito/files/nunito-latin-${w}-normal.woff2`)).toString("base64");
  return `@font-face{font-family:"Nunito";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
}).join("\n");

/* ---------- Kopf: externe Abrufe raus, Konfiguration rein ---------- */
html = rep(html, `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">\n<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script>\n`, "", "externe Links");
html = rep(html, `window.BSW_CONFIG = window.BSW_CONFIG || { contactUrl: "" };`,
  `window.BSW_CONFIG = window.BSW_CONFIG || {
    local: true,                                   /* Runden werden im Browser dieses Geräts gespeichert (kein Server) */
    contactMail: "falko.carl@hwr-berlin.de",       /* Kontakt per E-Mail statt Formular */
    playUrl: "./"                                   /* QR zeigt immer auf die Adresse, unter der die Datei liegt */
  };`, "Konfiguration");
html = rep(html, `<style>`, `<style>\n${fontCss}\n`, "Schrift");
html = rep(html, `<script src="logo.js"></script>\n<script src="data.js"></script>\n<script src="app.js"></script>`,
  "__SCRIPTS__", "Skript-Tags");

/* ---------- app.js: lokaler Speicher ---------- */
app = rep(app, `    const api = (window.BSW_CONFIG || {}).api;
    if (api) {`, `    const api = (window.BSW_CONFIG || {}).api;
    if ((window.BSW_CONFIG || {}).local) {
      /* Statisch: alle Runden in localStorage dieses Geräts (Stand-Laptop sammelt, Export über die Statistik) */
      const LKEY = "bsw-plays-v3";
      const readAll = () => { try { const a = JSON.parse(localStorage.getItem(LKEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
      docs = readAll(); status = "live";
      sendOne = async doc => {
        try { const all = readAll().filter(d => d.id !== doc.id); all.push(doc); localStorage.setItem(LKEY, JSON.stringify(all)); docs = all; notify(); return true; }
        catch (e) { return false; }
      };
      window.addEventListener("storage", e => { if (e.key === LKEY) { docs = readAll(); notify(); } });
      setTimeout(() => { notify(); flush(); }, 0);
    } else if (api) {`, "Store lokal");

/* ---------- app.js: Kontakt per E-Mail ---------- */
app = rep(app, `  function contactHtml() {
    const url = (window.BSW_CONFIG || {}).contactUrl ? absUrl(window.BSW_CONFIG.contactUrl) : "";`,
  `  function mailtoUrl() {
    const m = (window.BSW_CONFIG || {}).contactMail; if (!m) return "";
    const de = lang !== "en";
    const sub = de ? "KI-InnoX: Kontakt (Science Week)" : "KI-InnoX: contact (Science Week)";
    const body = de
      ? "Hallo KI-InnoX-Team,\\nbitte informiert mich über: Workshops/Hackathon, Befragung/Interview, Projekt-Neuigkeiten (Unpassendes löschen).\\n\\nIch bin mind. 16 und willige ein, dass die HWR Berlin meine Angaben nur hierfür nutzt (Löschung bis 31.12.2027, Widerruf jederzeit per Mail)."
      : "Hello KI-InnoX team,\\nplease keep me informed about: workshops/hackathon, survey/interview, project news (delete what does not apply).\\n\\nI am 16+ and agree that HWR Berlin uses my details only for this (deleted by 31 Dec 2027, withdraw any time by email).";
    return "mailto:" + m + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(body);
  }
  function contactHtml() {
    const mail = mailtoUrl();
    if (mail) return \`<div class="contact">
      <h3>\${T(UI.cTitle)}</h3>
      <p>\${T(UI.cText)}</p>
      <a class="primary y" href="\${esc(mail)}">\${T(UI.cMail)}</a>
      \${KIOSK ? \`<div class="sep">\${T(UI.cScanMail)}</div><div class="qr" data-qr="\${esc(mail)}"></div>\` : ""}
      <p class="sep">🔒 \${T(UI.cSepMail)}</p>
      <div class="sender">\${window.IFAF_LOGO || ""}<span>KI-InnoX</span></div>
    </div>\`;
    const url = (window.BSW_CONFIG || {}).contactUrl ? absUrl(window.BSW_CONFIG.contactUrl) : "";`, "Kontakt mailto");

app = rep(app, `    cOpen: {`, `    cMail: { de: "✉️ Kontakt per E-Mail", en: "✉️ Contact by email" },
    cScanMail: { de: "Oder mit dem Handy scannen – öffnet eine fertige E-Mail", en: "Or scan with your phone – opens a ready-made email" },
    cSepMail: { de: "Deine Spielantworten bleiben anonym. Die E-Mail ist davon getrennt und keinem Spiel zuzuordnen. Verantwortlich: HWR Berlin, Projekt KI-InnoX · Nutzung nur für die angekreuzten Zwecke · Löschung spätestens 31.12.2027 · Widerruf jederzeit an falko.carl@hwr-berlin.de · Datenschutz: datenschutz@hwr-berlin.de", en: "Your game answers stay anonymous. The email is separate and cannot be linked to any game. Controller: HWR Berlin, KI-InnoX project · used only for the purposes you keep · deleted by 31 Dec 2027 · withdraw any time via falko.carl@hwr-berlin.de · data protection: datenschutz@hwr-berlin.de" },
    exportJson: { de: "⬇ Daten (JSON)", en: "⬇ Data (JSON)" },
    exportCsv: { de: "⬇ Tabelle (CSV)", en: "⬇ Table (CSV)" },
    localNote: { de: "Die Runden sind nur in diesem Browser gespeichert. Bitte am Ende jedes Tages exportieren (JSON) und nicht im privaten Fenster spielen.", en: "Rounds are stored only in this browser. Please export (JSON) at the end of each day and don't play in a private window." },
    cOpen: {`, "UI-Texte");

/* Datenschutzsatz im Intro: ehrlich für den statischen Betrieb */
app = rep(app, `privacy: { de: "Gespeichert werden nur deine Klicks, ohne Namen oder Kontaktdaten, für die Forschung im Projekt KI-InnoX (HWR Berlin).", en: "Only your clicks are stored, without names or contact details, for research in the KI-InnoX project (HW`,
  `privacy: { de: "Gespeichert werden nur deine Klicks, ohne Namen oder Kontaktdaten, nur im Browser dieses Geräts, für die Forschung im Projekt KI-InnoX (HWR Berlin).", en: "Only your clicks are stored, without names or contact details, only in this device's browser, for research in the KI-InnoX project (HW`, "Datenschutz Intro");

/* ---------- app.js: QR ohne externe Bibliothek ---------- */
app = rep(app, `  function drawQr() {
    if (!window.QRCode) {`, `  function drawQr() {
    if (!window.QRCode && window.qrcode) {
      window.QRCode = function (el, o) {
        const q = window.qrcode(0, o.text.length > 300 ? "L" : "M"); q.addData(o.text); q.make();
        el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        const px = Math.max(o.width || 140, (q.getModuleCount() + 4) * 3);
        const s = el.querySelector("svg"); if (s) { s.style.width = px + "px"; s.style.height = px + "px"; s.style.display = "block"; s.style.margin = "0 auto"; }
      };
    }
    if (!window.QRCode) {`, "QR-Shim");

/* ---------- app.js: Export in der Statistik ---------- */
app = rep(app, `          <a class="pill" href="#spiel" style="text-decoration:none;color:inherit">\${T(UI.backGame)}</a>
        </div>
      </div>`, `          <a class="pill" href="#spiel" style="text-decoration:none;color:inherit">\${T(UI.backGame)}</a>
          \${(window.BSW_CONFIG || {}).local ? \`<button class="pill" id="expJson">\${T(UI.exportJson)}</button><button class="pill" id="expCsv">\${T(UI.exportCsv)}</button>\` : ""}
        </div>
      </div>
      \${(window.BSW_CONFIG || {}).local ? \`<p class="note">\${T(UI.localNote)}</p>\` : ""}`, "Export-Knöpfe");

app = rep(app, `  function bindStats() {`, `  function dl(name, text, type) {
    const b = new Blob([text], { type }); const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function toCsv(list) {
    const pk = ["alter", "haltung", "gruppe", "rolle", "betrieb", "kinutzung", "haltung2"];
    const head = ["id", "ts", "day", "rn", "sc", "lang", "dev", "end", "dur", "m_z", "m_v", "m_r", "m_a", "sw_d", "sw_cond", "sw_ans"].concat(pk.map(k => "prof_" + k), ["n_choices", "choices_json"]);
    const q = v => { const s = v === undefined || v === null ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v)); return /[",;\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const rows = list.map(p => [p.id, p.ts, p.day, p.rn, p.sc, p.lang, p.dev, p.end, p.dur, (p.m || {}).z, (p.m || {}).v, (p.m || {}).r, (p.m || {}).a, (p.sw || {}).d, (p.sw || {}).cond, (p.sw || {}).ans]
      .concat(pk.map(k => (p.prof || {})[k]), [(p.ch || []).length, p.ch || []]).map(q).join(";"));
    return "\\ufeff" + head.join(";") + "\\n" + rows.join("\\n");
  }
  function bindStats() {
    const ej = document.getElementById("expJson"), ec = document.getElementById("expCsv");
    const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    if (ej) ej.onclick = () => dl("bsw-runden-" + stamp() + ".json", JSON.stringify(Store.all(), null, 1), "application/json");
    if (ec) ec.onclick = () => dl("bsw-runden-" + stamp() + ".csv", toCsv(Store.all()), "text/csv;charset=utf-8");`, "Export-Funktionen");

/* ---------- Zusammenbauen ---------- */
const guard = s => s.replace(/<\/script/gi, "<\\/script");
const scripts = [
  `<script>/* qrcode-generator 2.0.4 · (c) Kazuhiko Arase · MIT */\n${guard(qr)}\n</script>`,
  `<script>\n${guard(logo)}\n</script>`,
  `<script>\n${guard(data)}\n</script>`,
  `<script>\n${guard(poster)}\n</script>`,
  `<script>\n${guard(app)}\n</script>`
].join("\n");
html = html.replace("__SCRIPTS__", () => scripts);

if (html.includes("```")) throw new Error("Dreifach-Backticks im Ergebnis");
if (/https?:\/\/(fonts\.|cdnjs|cdn\.)/.test(html)) throw new Error("externe Quelle übrig");
fs.writeFileSync(OUT, html);
console.log("OK", OUT, (Buffer.byteLength(html) / 1024).toFixed(1) + " KB");
