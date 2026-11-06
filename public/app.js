/* „Deine KI will loslegen. Lässt du sie?“ V2 – Chat mit Kai. Mobil zuerst, Laptop im Telefonrahmen. */
(function () {
  "use strict";
  if (window.__POSTER) return; /* Stand-Bildschirm (#bildschirm) statt Spiel */
  const G = window.GAME;
  const root = document.getElementById("root");
  const KIOSK = window.matchMedia && matchMedia("(pointer: fine)").matches;
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ABORT = { abort: true };

  const LANG0 = (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
  let lang = LANG0;
  try { const l = localStorage.getItem("bsw-lang"); if (l === "de" || l === "en") lang = l; } catch (e) {}

  const UI = {
    title: { de: "Deine KI will loslegen. Lässt du sie?", en: "Your AI wants to act. Will you let it?" },
    heroA: { de: "Deine KI will loslegen. ", en: "Your AI wants to act. " }, heroB: { de: "Lässt du sie?", en: "Will you let it?" },
    poster: { de: "Spiel mit Kai, deiner neuen KI, und entscheide, was sie allein darf.", en: "Play with Kai, your new AI, and decide what it may do on its own." },
    posterSmall: { de: "Ein Forschungsspiel von KI-InnoX · IFAF Berlin · HWR · HTW · ASH", en: "A research game by KI-InnoX · IFAF Berlin · HWR · HTW · ASH" },
    stats: { de: "Live-Statistik", en: "Live statistics" },
    online: { de: "deine neue KI · online", en: "your new AI · online" },
    introText: { de: "Ein Spiel über KI in Berliner Unternehmen: Du entscheidest, was die KI allein darf.", en: "A game about AI in Berlin businesses: you decide what the AI may do on its own." },
    introFrame: { de: "Aus dem Forschungsprojekt <b>KI-InnoX</b> des IFAF Berlin mit HWR Berlin, HTW Berlin und ASH Berlin. Die Fälle beruhen auf Interviews mit Berliner Betrieben.", en: "From the research project <b>KI-InnoX</b> of IFAF Berlin with HWR Berlin, HTW Berlin and ASH Berlin. The cases are based on interviews with Berlin businesses." },
    introMeta: { de: "⏱ ca. 5 Minuten · anonym: keine Namen, nur deine Klicks", en: "⏱ about 5 minutes · anonymous: no names, just your clicks" },
    start: { de: "Start ➜", en: "Start ➜" },
    bsw: { de: "Berlin Science Week 2026", en: "Berlin Science Week 2026" },
    thanksKai: { de: "Danke fürs Mitspielen! 🙌", en: "Thanks for playing! 🙌" },
    cTitle: { de: "📬 In Kontakt bleiben?", en: "📬 Stay in touch?" },
    cText: { de: "Wir suchen Menschen und Betriebe für Workshops, Befragungen und Neuigkeiten aus KI-InnoX. Ganz freiwillig.", en: "We're looking for people and businesses for workshops, surveys and news from KI-InnoX. Entirely voluntary." },
    cSep: { de: "Deine Spielantworten bleiben anonym. Kontaktdaten speichern wir getrennt und können sie keinem Spiel zuordnen.", en: "Your game answers stay anonymous. We store contact details separately and cannot link them to any game." },
    cOpen: { de: "Kontaktformular öffnen ↗", en: "Open contact form ↗" },
    cScan: { de: "Oder mit dem Handy scannen", en: "Or scan with your phone" },
    cStand: { de: "Sprich uns gern direkt hier am Stand an. 👋", en: "Just talk to us here at the stand. 👋" },
    playPhone: { de: "📱 Auf dem eigenen Handy spielen", en: "📱 Play on your own phone" },
    typing: { de: "tippt …", en: "typing …" },
    restart: { de: "Neu", en: "New" },
    hi1: { de: "Hi! Ich bin Kai, deine neue KI. 🤖", en: "Hi! I'm Kai, your new AI. 🤖" },
    hi2: { de: "Ich kann alles. Wirklich alles. 😏", en: "I can do anything. Really, anything. 😏" },
    hi3: { de: "Lass mich in einem Betrieb ran. Welcher soll's sein?", en: "Let me loose on a business. Which one?" },
    meta: { de: "⏱ 4–6 Minuten · anonym · keine Anmeldung", en: "⏱ 4–6 minutes · anonymous · no sign-up" },
    privacy: { de: "Gespeichert werden nur deine Klicks, ohne Namen oder Kontaktdaten, für die Forschung im Projekt KI-InnoX (HWR Berlin).", en: "Only your clicks are stored, without names or contact details, for research in the KI-InnoX project (HWR Berlin)." },
    prof1: { de: "Bevor's losgeht: 2 schnelle Fragen. Anonym, versprochen. 🤞", en: "Before we start: 2 quick questions. Anonymous, promise. 🤞" },
    prof2: { de: "Fast geschafft! Noch {n} kurze Fragen, dann kommt dein Ergebnis. 🎁", en: "Almost done! {n} more quick questions, then you get your result. 🎁" },
    by: { de: "Ein Forschungsspiel von KI-InnoX · IFAF Berlin", en: "A research game by KI-InnoX · IFAF Berlin" },
    profDone: { de: "Danke! 🙌", en: "Thanks! 🙌" },
    skip: { de: "Überspringen", en: "Skip" },
    why: { de: "Und warum? 🤔", en: "And why? 🤔" },
    next: { de: "Weiter", en: "Next" },
    fact: { de: "💡 Wusstest du?", en: "💡 Did you know?" },
    psst: { de: "Psst: Das war gerade ein kleines Experiment. 🔬", en: "Psst: that was a little experiment. 🔬" },
    end1: { de: "Das war deine Woche! 🎉", en: "That was your week! 🎉" },
    end2: { de: "Hier ist dein Ergebnis:", en: "Here's your result:" },
    youAre: { de: "Dein Typ", en: "Your type" },
    sameToday: { de: "Heute landen {p} % der Spielenden hier.", en: "{p} % of today's players end up here." },
    firstToday: { de: "Du bist heute die erste Person mit diesem Ergebnis.", en: "You're the first person with this result today." },
    thesis: { de: "KI kann handeln, aber nicht bürgen.", en: "AI can act, but it can't vouch." },
    thesisSub: { de: "Wer etwas zusagt, steht mit Geld und Ruf dafür ein. Das kann eine Maschine nicht. Deshalb bleibt die Zusage in allen 10 befragten Betrieben bei einem Menschen.", en: "Whoever commits stands behind it with money and reputation. A machine can't. That's why in all 10 businesses we interviewed, a person makes the commitment." },
    again: { de: "🔁 Anderen Betrieb spielen", en: "🔁 Play another business" },
    againSame: { de: "🔁 Ich spiel noch einen Betrieb", en: "🔁 I'll play another business" },
    nextPerson: { de: "👋 Fertig, nächste Person", en: "👋 Done, next person" },
    seeStats: { de: "📊 So entscheidet Berlin heute", en: "📊 How Berlin decides today" },
    /* Artefakte */
    inbox: { de: "Posteingang", en: "Inbox" }, newN: { de: "{n} neu", en: "{n} new" }, more: { de: "+ {n} weitere", en: "+ {n} more" },
    offer: { de: "Angebot", en: "Quote" }, to: { de: "An", en: "To" }, total: { de: "Gesamt", en: "Total" },
    pages: { de: "40 Seiten · geprüft von Kai", en: "40 pages · checked by Kai" },
    mail: { de: "Neue Mail", en: "New e-mail" }, draft: { de: "Entwurf von Kai", en: "Draft by Kai" }, from: { de: "Von", en: "From" }, subj: { de: "Betreff", en: "Subject" },
    invoices: { de: "Offene Rechnungen · 23", en: "Open invoices · 23" },
    invite: { de: "Einladung", en: "Invitation" }, accept: { de: "Zusagen", en: "Accept" }, decline: { de: "Ablehnen", en: "Decline" },
    agentOf: { de: "🤖 KI-Agent von {c}", en: "🤖 AI agent of {c}" },
    autoSent: { de: "Automatisch von einer KI verschickt", en: "Sent automatically by an AI" },
    aiWritten: { de: "✍️ Text mit KI erstellt", en: "✍️ Text written with AI" },
    group: { de: "Gruppe", en: "Group" },
    /* Statistik */
    statsTitle: { de: "So entscheidet Berlin heute", en: "How Berlin decides today" },
    today: { de: "Heute", en: "Today" }, allDays: { de: "Alle Tage", en: "All days" },
    rounds: { de: "Runden gespielt", en: "Rounds played" },
    aloneAny: { de: "ließen Kai mindestens einmal allein verbindlich zusagen", en: "let Kai make a binding commitment alone at least once" },
    aloneInt: { de: "In unseren 10 Interviews: 0 von 10", en: "In our 10 interviews: 0 out of 10" },
    expTitle: { de: "Experiment: Verlässt man sich auf die Zusage?", en: "Experiment: do people rely on the commitment?" },
    expKi: { de: "KI-Agent schickt", en: "AI agent sends" }, expMensch: { de: "Mensch unterschreibt", en: "Person signs" },
    expCap: { de: "Anteil „Ja, das steht“", en: "Share “Yes, it's settled”" },
    endsTitle: { de: "Ergebnisse", en: "Results" },
    whyTitle: { de: "Warum?", en: "Why?" },
    whyKeep: { de: "Selbst entschieden, weil …", en: "Decided myself because …" },
    whyGive: { de: "Kai machen lassen, weil …", en: "Let Kai do it because …" },
    aloneTitle: { de: "Wo darf Kai allein zusagen?", en: "Where may Kai commit alone?" },
    useTitle: { de: "KI-Nutzung und Vertrauen in Kai", en: "AI use and trust in Kai" },
    useNote: { de: "Anteil der Runden mit mindestens einer Zusage durch Kai allein", en: "Share of rounds with at least one commitment by Kai alone" },
    ageTitle: { de: "Wer spielt? Alter", en: "Who plays? Age" },
    prePostTitle: { de: "KI für mich bestellen lassen? Vorher und nachher", en: "Let AI order for me? Before and after" },
    before: { de: "vorher", en: "before" }, after: { de: "nachher", en: "after" },
    expNote: { de: "Nur die erste Runde je Person", en: "First round per person only" },
    roleTitle: { de: "Wer spielt? Tätigkeit", en: "Who plays? Occupation" },
    noData: { de: "Noch keine Runden. Kai wartet auf die erste Person. 🤖", en: "No rounds yet. Kai is waiting for the first person. 🤖" },
    loading: { de: "Daten werden geladen …", en: "Loading data …" },
    slow: { de: "Live-Daten noch nicht erreichbar. Die Anzeige aktualisiert sich von selbst.", en: "Live data not reachable yet. The view updates by itself." },
    offline: { de: "Live-Daten in dieser Ansicht nicht verfügbar. Angezeigt werden nur Runden auf diesem Gerät.", en: "Live data not available in this view. Showing only rounds on this device." },
    backGame: { de: "Zum Spiel", en: "To the game" },
    n: { de: "n", en: "n" }
  };
  const LVLC = { 1: "#b3b3b3", 2: "#4ea2b3", 3: "#3f9b6e", 4: "#f58220", 5: "#fe6748", p: "#8076a0" };

  function t(o, vars) {
    let s = (o && typeof o === "object") ? (o[lang] != null ? o[lang] : o.de) : (o == null ? "" : String(o));
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function T(o, v) { return esc(t(o, v)); }
  function dayStr(d) { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(d || new Date()); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function rid() { return Math.random().toString(36).slice(2, 10); }
  const sleep = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));

  /* ---------- Kai ---------- */
  function kaiSvg(mood, cls) {
    const W = 'stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"';
    const eyes = {
      happy: `<path d="M21 30 q4.5 -6 9 0 M34 30 q4.5 -6 9 0" ${W}/>`,
      smug: `<path d="M21 29 h9 M34 29 h9" ${W}/><circle cx="27" cy="31" r="2.2" fill="#fff"/><circle cx="40" cy="31" r="2.2" fill="#fff"/>`,
      oops: `<circle cx="25.5" cy="29" r="4" fill="#fff"/><circle cx="38.5" cy="29" r="4" fill="#fff"/><circle cx="25.5" cy="29" r="1.6" fill="#212121"/><circle cx="38.5" cy="29" r="1.6" fill="#212121"/>`,
      think: `<circle cx="26" cy="29" r="3" fill="#fff"/><path d="M34 29 h9" ${W}/>`,
      wink: `<path d="M21 30 q4.5 -6 9 0" ${W}/><circle cx="38.5" cy="29" r="3.2" fill="#fff"/>`
    };
    const mouth = {
      happy: `<path d="M25 37 q7 7 14 0" ${W}/>`,
      smug: `<path d="M26 39 q8 2 13 -4" ${W}/>`,
      oops: `<path d="M26 40 q3 -3 6 0 t6 0" ${W}/>`,
      think: `<path d="M27 39 h10" ${W}/>`,
      wink: `<path d="M25 37 q7 7 14 0" ${W}/>`
    };
    const m = eyes[mood] ? mood : "happy";
    return `<svg class="${cls || ""}" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="5" x2="32" y2="13" stroke="#212121" stroke-width="3"/>
      <circle cx="32" cy="5" r="4" fill="#f58220" stroke="#212121" stroke-width="2.5"/>
      <rect x="4" y="27" width="6" height="12" rx="2" fill="#212121"/><rect x="54" y="27" width="6" height="12" rx="2" fill="#212121"/>
      <rect x="8" y="13" width="48" height="44" rx="14" fill="#f58220" stroke="#212121" stroke-width="3"/>
      <rect x="14" y="19" width="36" height="31" rx="9" fill="#212121"/>
      ${eyes[m]}${mouth[m]}
    </svg>`;
  }
  const ICONS = {
    stone: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#f1f1f1"/><rect x="8" y="38" width="48" height="16" rx="3" fill="#b3b3b3" stroke="#212121" stroke-width="3"/><rect x="16" y="22" width="32" height="16" rx="3" fill="#e2e2e2" stroke="#212121" stroke-width="3"/><path d="M25 22 L30 12 L39 12 L43 22" fill="#f58220" stroke="#212121" stroke-width="3" stroke-linejoin="round"/></svg>`,
    truck: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#e4f2f5"/><rect x="6" y="20" width="32" height="24" rx="3" fill="#fff" stroke="#212121" stroke-width="3"/><path d="M38 27 H49 L57 36 V44 H38 Z" fill="#f58220" stroke="#212121" stroke-width="3" stroke-linejoin="round"/><circle cx="17" cy="47" r="5" fill="#212121"/><circle cx="48" cy="47" r="5" fill="#212121"/><path d="M22 25 V39 M15 32 H29 M17 27 L27 37 M27 27 L17 37" stroke="#4ea2b3" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    app: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#fff1e6"/><rect x="18" y="7" width="28" height="50" rx="6" fill="#fff" stroke="#212121" stroke-width="3"/><path d="M26 37 L36 25 M34 22 a4 4 0 1 0 5 5" stroke="#212121" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="32" cy="51" r="2.2" fill="#212121"/><circle cx="47" cy="12" r="7" fill="#f58220" stroke="#212121" stroke-width="3"/></svg>`
  };

  /* ---------- Speicher: claude.ai jetzt, eigener Server später ----------
     Jede Runde hat eine feste ID (sid-ts). Nicht gespeicherte Runden liegen in localStorage
     und werden alle 20 s erneut gesendet; doppelte Sendungen überschreiben sich nur. */
  const Store = (function () {
    const listeners = [];
    let status = "loading", docs = [], local = [];
    const notify = () => listeners.forEach(f => { try { f(); } catch (e) {} });
    const PKEY = "bsw-pending";
    const readPending = () => { try { return JSON.parse(localStorage.getItem(PKEY) || "[]"); } catch (e) { return []; } };
    const writePending = list => { try { localStorage.setItem(PKEY, JSON.stringify(list)); } catch (e) {} };
    let pendingMem = readPending();
    const pending = () => pendingMem;
    const setPending = list => { pendingMem = list; writePending(list); };
    const merged = () => {
      if (status !== "live") return local.concat(pending().filter(p => !local.some(l => l.id === p.id)));
      const ids = new Set(docs.map(d => d.id));
      return docs.concat(pending().filter(p => !ids.has(p.id)));
    };
    let sendOne = null;
    async function flush() {
      if (!sendOne) return;
      for (const doc of pending().slice()) {
        const ok = await sendOne(doc);
        if (ok) setPending(pending().filter(p => p.id !== doc.id));
      }
    }
    setInterval(() => { flush(); }, 20000);
    const api = (window.BSW_CONFIG || {}).api;
    if (api) {
      /* REST auf eigenem Server: PUT /plays/:id (idempotent), GET /plays → [docs] */
      const poll = async () => {
        try { const r = await fetch(api + "/plays"); if (r.ok) { docs = await r.json(); status = "live"; notify(); } } catch (e) { if (status !== "live") { status = "slow"; notify(); } }
      };
      sendOne = async doc => {
        try { const r = await fetch(api + "/plays/" + encodeURIComponent(doc.id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc) }); return r.ok; } catch (e) { return false; }
      };
      poll(); setInterval(poll, 15000); flush();
    } else {
      (async () => {
        let db = null;
        try { db = (typeof claude !== "undefined" && claude.use) ? await claude.use("db") : null; } catch (e) { db = null; }
        if (!db) { status = "offline"; notify(); return; }
        sendOne = async doc => { try { await db.collection("plays").doc(doc.id).set(doc); return true; } catch (e) { return false; } };
        const slowTimer = setTimeout(() => { if (status === "loading") { status = "slow"; notify(); } }, 10000);
        try {
          db.collection("plays").onSnapshot(snap => {
            docs = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
            clearTimeout(slowTimer); status = "live"; notify();
          }, () => { clearTimeout(slowTimer); status = "offline"; notify(); });
        } catch (e) { status = "offline"; notify(); }
        flush();
      })();
    }
    return {
      status: () => status, all: merged, onChange: f => listeners.push(f), pendingCount: () => pending().length,
      add(doc) {
        local.push(doc);
        setPending(pending().filter(p => p.id !== doc.id).concat([doc]));
        notify();
        return flush();
      }
    };
  })();

  /* ---------- Sitzung ---------- */
  let RUN = 0;
  let S = null;
  function newSession(keep) {
    RUN++;
    S = { run: RUN, started: !!keep, sid: keep ? keep.sid : rid(), prof: keep ? keep.prof : null, rn: keep ? keep.rn + 1 : 1, log: [], dock: null, mood: "happy", typing: false,
      sc: null, m: Object.assign({}, G.START), ch: [], sw: null, t0: Date.now() };
  }
  function alive(run) { if (!S || S.run !== run) throw ABORT; }
  function scen() { return G.SCENARIOS.find(s => s.id === S.sc); }

  /* ---------- Rendern ---------- */
  function route() { return location.hash === "#statistik" ? "statistik" : "spiel"; }
  function render() {
    document.documentElement.lang = lang;
    document.title = t(UI.title);
    if (route() === "statistik") { root.innerHTML = viewStats(); bindStats(); return; }
    root.innerHTML = `<div class="stage">
      <aside class="poster">
        <div class="logo">${window.IFAF_LOGO || ""}</div>
        <div class="kaibig">${kaiSvg("smug")}</div>
        <h1><span class="ha">${T(UI.heroA)}</span><mark>${T(UI.heroB)}</mark></h1>
        <p>${T(UI.poster)}</p>
        <small>${T(UI.posterSmall)}</small>
        <a href="#statistik">${T(UI.stats)} →</a>
      </aside>
      <div class="phone">${S.started ? `
        <header class="ph-head" id="head"></header>
        <div class="chat" id="chat" aria-live="polite"></div>
        <div class="dock" id="dock"></div>` : introHtml()}
      </div>
      <div class="side-r">${(window.BSW_CONFIG || {}).playUrl ? `<div class="playqr"><b>${T(UI.playPhone)}</b><div class="qr" data-qr="${esc(absUrl(window.BSW_CONFIG.playUrl))}"></div><small>${esc(absUrl(window.BSW_CONFIG.playUrl).replace(/^https?:\/\//, "").replace(/\/$/, ""))}</small></div>` : ""}</div>
    </div>`;
    setTimeout(drawQr, 50);
    if (!S.started) { bindIntro(); return; }
    renderHead(); renderChat(); renderDock();
  }
  function introHtml() {
    return `<section class="intro">
      <div class="logo">${window.IFAF_LOGO || "IFAF Berlin"}</div>
      <div class="kaibig">${kaiSvg("smug")}</div>
      <h1><span class="ha">${T(UI.heroA)}</span><mark>${T(UI.heroB)}</mark></h1>
      <p>${T(UI.introText)}</p>
      <div class="frame">${t(UI.introFrame)}</div>
      <p>${T(UI.introMeta)}</p>
      <button class="start" id="btnStart">${T(UI.start)}</button>
      <div class="langrow"><button class="pill" data-lang="de" aria-pressed="${lang === "de"}">DE</button><button class="pill" data-lang="en" aria-pressed="${lang === "en"}">EN</button></div>
      <small>${T(UI.bsw)} · KI-InnoX · IFAF Berlin</small>
    </section>`;
  }
  function bindIntro() {
    document.getElementById("btnStart").onclick = beginGame;
    root.querySelectorAll(".intro [data-lang]").forEach(b => b.onclick = () => { lang = b.dataset.lang; try { localStorage.setItem("bsw-lang", lang); } catch (e) {} render(); });
  }
  function beginGame() {
    if (S.started) return;
    S.started = true; render(); runFlow(intro);
  }
  function renderHead() {
    const el = document.getElementById("head"); if (!el) return;
    const sc = S.sc ? scen() : null;
    const status = S.typing ? t(UI.typing) : (sc ? `${t(sc.name)} · ${t(sc.tag)}` : t(UI.online));
    el.innerHTML = `<div class="ph-row">${kaiSvg(S.mood, "kai")}
        <div class="who"><b>Kai</b><small>${esc(status)}</small></div>
        <button class="hbtn" id="btnLang" aria-label="${lang === "de" ? "Sprache: Englisch" : "Language: German"}">${lang === "de" ? "EN" : "DE"}</button>
        <button class="hbtn" id="btnNew" title="${T(UI.restart)}">⟲ ${T(UI.restart)}</button>
      </div>
      ${sc ? `<div class="meters">${["z", "v", "r", "a"].map(k => meterHtml(k)).join("")}</div>` : ""}`;
    document.getElementById("btnLang").onclick = () => { lang = lang === "de" ? "en" : "de"; try { localStorage.setItem("bsw-lang", lang); } catch (e) {} render(); };
    document.getElementById("btnNew").onclick = () => startNew();
  }
  const MLAB = { z: { i: "⏱", de: "Zeit", en: "Time" }, v: { i: "🤝", de: "Vertrauen", en: "Trust" }, r: { i: "⚠️", de: "Risiko", en: "Risk" }, a: { i: "🔗", de: "Abhängig", en: "Lock-in" } };
  function meterHtml(k) {
    const v = Math.round(S.m[k]);
    return `<div class="mm" id="mm-${k}"><div class="t"><span>${MLAB[k].i} <span class="w">${T(MLAB[k])}</span></span><b>${v}</b></div><div class="bar"><i style="width:${v}%;background:var(--m-${k})"></i></div></div>`;
  }
  function flashMeters(before, after) {
    renderHead();
    ["z", "v", "r", "a"].forEach(k => {
      const d = after[k] - before[k]; if (!d) return;
      const good = (k === "z" || k === "v") ? d > 0 : d < 0;
      const el = document.getElementById("mm-" + k); if (!el) return;
      el.classList.add(good ? "pulse-good" : "pulse-bad");
      setTimeout(() => el.classList.remove("pulse-good", "pulse-bad"), 1600);
    });
  }

  function msgHtml(m, i) {
    switch (m.t) {
      case "kai": return `<div class="msg"><div class="av">${kaiSvg(m.mood)}</div><div class="bubble">${T(m.text)}</div></div>`;
      case "me": return `<div class="msg me"><div class="bubble">${m.icon ? esc(m.icon) + " " : ""}${T(m.text)}</div></div>`;
      case "other": return `<div class="msg other"><div class="ini">${esc(initials(m.from))}</div><div class="bubble"><span class="from">${esc(m.from)}</span>${T(m.text)}</div></div>`;
      case "art": return artHtml(m.art, m.cond);
      case "sys": return `<div class="sys">${m.d.map(x => `<span class="${x.good ? "good" : "bad"}">${MLAB[x.k].i} ${T(MLAB[x.k])} ${x.v > 0 ? "+" : "−"}${Math.abs(x.v)}</span>`).join("")}</div>`;
      case "fact": return `<div class="factline">💡 ${T(m.text)}</div>`;
      case "result": return resultHtml(m);
      case "contact": return contactHtml();
      case "typing": return `<div class="msg"><div class="av">${kaiSvg("think")}</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>`;
    }
    return "";
  }
  function initials(n) { return String(n).split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
  function renderChat() {
    const el = document.getElementById("chat"); if (!el) return;
    el.innerHTML = S.log.map(msgHtml).join("") + (S.typing ? msgHtml({ t: "typing" }) : "");
    setTimeout(drawQr, 50);
    const r = el.querySelectorAll(".result");
    if (r.length && S.dock && S.dock.spec.kind === "end") { const last = r[r.length - 1]; requestAnimationFrame(() => { el.scrollTop = last.offsetTop - 12; }); return; }
    el.onclick = ev => {
      const b = ev.target.closest("[data-fact]"); if (!b) return;
      const m = S.log[+b.dataset.fact]; m.open = !m.open; b.outerHTML = msgHtml(m, +b.dataset.fact);
    };
    scrollDown();
  }
  function scrollDown() {
    const el = document.getElementById("chat"); if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }
  function push(m) {
    S.log.push(m);
    const el = document.getElementById("chat"); if (!el) return;
    const ty = el.querySelector(".typing"); if (ty) ty.closest(".msg").remove();
    el.insertAdjacentHTML("beforeend", msgHtml(m, S.log.length - 1));
    if (S.typing) el.insertAdjacentHTML("beforeend", msgHtml({ t: "typing" }));
    if (m.t === "result") { const r = el.querySelectorAll(".result"); const last = r[r.length - 1]; requestAnimationFrame(() => { el.scrollTop = last.offsetTop - 12; }); }
    else if (m.t !== "contact") scrollDown();
    if (m.t === "contact") setTimeout(drawQr, 50);
  }
  function setTyping(on) {
    S.typing = on; renderHead();
    const el = document.getElementById("chat"); if (!el) return;
    const ty = el.querySelector(".typing");
    if (on && !ty) el.insertAdjacentHTML("beforeend", msgHtml({ t: "typing" }));
    if (!on && ty) ty.closest(".msg").remove();
    scrollDown();
  }
  async function kai(text, mood, run) {
    alive(run);
    setTyping(true);
    const len = t(text).length;
    await sleep(320 + Math.min(750, len * 11));
    alive(run);
    S.mood = mood || "happy";
    setTyping(false);
    push({ t: "kai", text, mood: S.mood });
    renderHead();
  }

  /* Artefakte */
  function artHtml(a, cond) {
    const scName = S.sc ? t(scen().name) : "";
    switch (a.kind) {
      case "inbox": return `<div class="art"><div class="ah">📥 ${T(UI.inbox)} · ${T(UI.newN, { n: 43 })}</div><div class="ab">
        ${a.rows.map(r => `<div class="unread"><i></i><div><b>${esc(r[0])}</b><div class="sub">${T(r[1])}</div></div></div>`).join("")}
        <div class="sub">${T(UI.more, { n: a.more })}</div></div></div>`;
      case "offer": return `<div class="art"><div class="ah">📄 ${T(UI.offer)} · ${esc(scName)}</div><div class="ab">
        <div class="sub">${T(UI.to)}: ${esc(a.to)}</div>
        ${a.items.map(r => `<div class="row"><span>${T(r[0])}</span><span>${esc(r[1])}</span></div>`).join("")}
        <div class="row total"><span>${T(UI.total)}</span><span>${esc(a.total)}</span></div>
        ${a.stamp ? `<span class="stamp">${T(a.stamp)}</span>` : ""}</div></div>`;
      case "call": return `<div class="art call ${a.out ? "out" : ""}"><div class="ab"><div class="sub" style="color:#cfcfcf">${T(a.status)}</div><div class="ring">📞</div><b>${T(a.name)}</b><div style="color:#cfcfcf">${esc(a.number)}</div></div></div>`;
      case "contract": return `<div class="art"><div class="ah">📑 ${T(a.title)}</div><div class="ab"><div class="sub">${T(UI.pages)}</div>
        <div class="lights"><span style="background:#e4f2f5">🟢 ${a.g}</span><span style="background:#ffe7d1">🟡 ${a.y}</span><span style="background:#ffe5df">🔴 ${a.r}</span></div></div></div>`;
      case "broadcast": return `<div class="art"><div class="ah">💬 ${T(UI.group)}: ${T(a.group)}</div><div class="ab"><div class="chipsrow">${a.langs.map(l => `<span>${esc(l)}</span>`).join("")}</div><div>${T(a.text)}</div></div></div>`;
      case "mail": return `<div class="art"><div class="ah">✉️ ${a.to ? T(UI.draft) : T(UI.mail)}</div><div class="ab">
        <div class="mailrow"><span class="sub">${T(UI.from)}</span><b>${esc(a.from)}</b>${a.to ? `<span class="sub">${T(UI.to)}</span><span>${T(a.to)}</span>` : ""}<span class="sub">${T(UI.subj)}</span><span>${T(a.subj)}</span></div>
        <div>${T(a.body)}</div></div></div>`;
      case "invoices": return `<div class="art"><div class="ah">🧾 ${T(UI.invoices)}</div><div class="ab">
        ${a.rows.map(r => `<div class="row"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join("")}<div class="sub">${T(UI.more, { n: a.more })}</div></div></div>`;
      case "calendar": return `<div class="art"><div class="ah">📅 ${T(UI.invite)} · ${esc(a.from)}</div><div class="ab">
        <b style="font-size:1.15em">${T(a.title)}</b><div>${T(a.when)}</div>
        <div class="row"><span class="chip" style="min-height:0;padding:3px 12px;border-color:#3f9b6e;color:#3f9b6e">${T(UI.accept)}</span><span class="chip" style="min-height:0;padding:3px 12px;border-color:var(--line);color:var(--muted)">${T(UI.decline)}</span></div></div></div>`;
      case "doc": return `<div class="art"><div class="ah">📜 ${T(a.title)}</div><div class="ab"><span class="chipsrow"><span style="background:var(--signal);color:var(--ink)">${T(a.badge)}</span></span>
        ${a.lines.map(l => `<div class="sub">${esc(l)} …</div>`).join("")}</div></div>`;
      case "app": return `<div class="art"><div class="ah">📱 ${esc(scName)} · ${T(a.title)}</div><div class="ab">
        ${a.rows.map(r => `<div class="row"><span>${T(r[0])}</span><span>${esc(r[1])}?</span></div>`).join("")}</div></div>`;
      case "ad": return `<div class="art ad"><div class="ab"><div class="brand">${esc(a.brand)}</div><div class="chipsrow">${a.features.map(f => `<span>${T(f)}</span>`).join("")}</div>
        <div style="font-size:1.25em;font-weight:700">${T(a.price)}</div><div class="fine">${T(a.fine)}</div></div></div>`;
      case "notice": return `<div class="art notice"><div class="ah">💬 ${esc(a.company)}</div><div class="ab">
        <div class="sender">${cond === "mensch" ? "👤 " + esc(a.person) + ", " + esc(a.company) : T(UI.agentOf, { c: a.company })}</div>
        <div style="font-size:1.08em">${T(a.body)}</div>
        <div class="aiflag">${cond === "mensch" ? T(UI.aiWritten) : "🤖 " + T(UI.autoSent)}</div></div></div>`;
    }
    return "";
  }

  function resultHtml(m) {
    const e = G.ENDINGS.find(x => x.id === m.end);
    const others = Store.all().filter(p => p.v === 3 && p.day === dayStr() && !(p.sid === m.sid && p.ts === m.ts));
    const n = others.length + 1, same = others.filter(p => p.end === m.end).length + 1;
    const line = n > 1 ? T(UI.sameToday, { p: pct(same, n) }) : T(UI.firstToday);
    return `<div class="result">
      <div class="k">${T(UI.youAre)}</div>
      <div class="badge" style="background:${e.color}">${e.emoji}</div>
      <h2>${T(e.name)}</h2>
      <p>${T(e.text)}</p>
      <div class="prof">${m.ch.map(c => `<span style="background:${LVLC[typeof c.l === "number" ? c.l : "p"]}">${esc(c.icon || "")}</span>`).join("")}</div>
      <p class="res-note">💡 ${T(e.res)}</p>
      <p class="res-note">${line}</p>
      <div class="thesis">${T(UI.thesis)}<div style="font-family:var(--font-body);font-weight:400;font-size:.78em;margin-top:6px">${T(UI.thesisSub)}</div></div>
      <div class="sender">${window.IFAF_LOGO || ""}<span>KI-InnoX</span></div>
    </div>`;
  }

  function absUrl(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } }
  function contactHtml() {
    const url = (window.BSW_CONFIG || {}).contactUrl ? absUrl(window.BSW_CONFIG.contactUrl) : "";
    return `<div class="contact">
      <h3>${T(UI.cTitle)}</h3>
      <p>${T(UI.cText)}</p>
      ${url ? `<a class="primary y" href="${esc(url)}" target="_blank" rel="noopener">${T(UI.cOpen)}</a>${KIOSK ? `<div class="sep">${T(UI.cScan)}</div><div class="qr" data-qr="${esc(url)}"></div>` : ""}` : `<p><b>${T(UI.cStand)}</b></p>`}
      <p class="sep">🔒 ${T(UI.cSep)}</p>
      <div class="sender">${window.IFAF_LOGO || ""}<span>KI-InnoX</span></div>
    </div>`;
  }
  function drawQr() {
    if (!window.QRCode) { drawQr.n = (drawQr.n || 0) + 1; if (drawQr.n < 40) setTimeout(drawQr, 250); return; }
    document.querySelectorAll("[data-qr]").forEach(el => {
      if (el.dataset.done || !window.QRCode) return;
      try { new window.QRCode(el, { text: el.dataset.qr, width: 140, height: 140, colorDark: "#212121", colorLight: "#ffffff" }); el.dataset.done = "1"; } catch (e) {}
    });
  }

  /* Antwortleiste */
  function ask(spec) {
    return new Promise(resolve => { S.dock = { spec, resolve }; renderDock(); });
  }
  function resolveDock(val) {
    if (!S.dock) return;
    const r = S.dock.resolve; S.dock = null; renderDock(); r(val);
  }
  function renderDock() {
    const el = document.getElementById("dock"); if (!el) return;
    if (!S.dock) { el.innerHTML = ""; return; }
    const sp = S.dock.spec;
    let h = "";
    if (sp.kind === "scen") {
      h = G.SCENARIOS.map((s, i) => `<button class="scen" data-v="${s.id}">${ICONS[s.icon]}<span><b>${T(s.name)}</b><small>${T(s.tag)}</small></span><span class="kb">${i + 1}</span></button>`).join("")
        + `<div class="meta">${T(UI.privacy)}</div>`;
    } else if (sp.kind === "answers") {
      h = sp.items.map((o, i) => `<button class="ans" data-v="${i}"><span class="ic">${esc(o.icon || "")}</span><span>${T(o.label)}</span><span class="kb">${i + 1}</span></button>`).join("");
    } else if (sp.kind === "chips") {
      h = `<div class="chips">${sp.items.map((o, i) => `<button class="chip" data-v="${i}">${esc(t(o))} <span class="kb">${i + 1}</span></button>`).join("")}</div>` + (sp.skip ? `<button class="skip" data-v="-1">${T(UI.skip)} <span class="kb">0</span></button>` : "");
    } else if (sp.kind === "next") {
      h = `<button class="primary" data-v="next">${T(UI.next)} ➜</button>`;
    } else if (sp.kind === "end") {
      h = KIOSK
        ? `<button class="primary y" data-v="person">${T(UI.nextPerson)}</button><button class="primary" data-v="again">${T(UI.againSame)}</button>`
        : `<button class="primary y" data-v="again">${T(UI.again)}</button><a class="skip" href="#statistik">${T(UI.seeStats)}</a>`;
    }
    el.innerHTML = h;
    const atResult = S.log.length && S.log[S.log.length - 1].t === "result";
    el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      resolveDock(sp.kind === "answers" || sp.kind === "chips" ? +v : v);
    });
    if (!atResult) scrollDown();
  }

  /* ---------- Ablauf ---------- */
  async function intro(run) {
    await kai(UI.hi1, "happy", run);
    await kai(UI.hi2, "smug", run);
    await kai(UI.hi3, "happy", run);
    const id = await ask({ kind: "scen" }); alive(run);
    await play(id, run);
  }
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  async function askProfile(list, run) {
    for (const q of list) {
      if (q.skipIfMinor && S.prof.alter === "u18") { S.prof[q.id] = null; continue; }
      await kai(q.q, "happy", run);
      const k = await ask({ kind: "chips", items: q.opts, skip: true }); alive(run);
      if (k >= 0) { S.prof[q.id] = q.opts[k].id; push({ t: "me", text: { de: q.opts[k].de, en: q.opts[k].en } }); }
      else S.prof[q.id] = null;
    }
  }
  async function profilePre(run) {
    S.prof = {};
    await kai(UI.prof1, "happy", run);
    await askProfile(G.PROFILE_PRE, run);
    await kai(UI.profDone, "happy", run);
  }
  async function profilePost(run) {
    const n = G.PROFILE_POST.filter(q => !(q.skipIfMinor && S.prof.alter === "u18")).length;
    await kai(t(UI.prof2, { n }), "happy", run);
    await askProfile(G.PROFILE_POST, run);
    await kai(UI.profDone, "happy", run);
  }
  async function play(id, run) {
    S.sc = id; S.m = Object.assign({}, G.START); S.ch = []; S.sw = null; S.t0 = Date.now();
    const sc = scen();
    push({ t: "me", icon: "", text: sc.name });
    renderHead();
    if (!S.prof) await profilePre(run);
    for (const line of sc.hello) await kai(line, "happy", run);
    for (const st of sc.steps) {
      if (st.type === "seite") await side(st, run); else await decision(st, run);
    }
    await finish(run);
  }
  function deltas(before, after) {
    return ["z", "v", "r", "a"].map(k => ({ k, v: Math.round(after[k] - before[k]) })).filter(x => x.v)
      .map(x => Object.assign(x, { good: (x.k === "z" || x.k === "v") ? x.v > 0 : x.v < 0 }));
  }
  async function decision(st, run) {
    for (const line of st.kai) await kai(line, "happy", run);
    if (st.art) { await sleep(250); alive(run); push({ t: "art", art: st.art }); await sleep(450); alive(run); }
    await kai(st.ask, "smug", run);
    const order = shuffled(st.options.length);
    const k = await ask({ kind: "answers", items: order.map(i => st.options[i]) }); alive(run);
    const o = st.options[order[k]];
    push({ t: "me", icon: o.icon, text: o.label });
    const b0 = S.m, m1 = G.applyFx(b0, o.fx); S.m = m1;
    await kai(o.re, "happy", run);
    flashMeters(b0, m1);
    const d1 = deltas(b0, m1); if (d1.length) push({ t: "sys", d: d1 });
    const rec = { d: st.id, o: o.id, l: typeof o.lvl === "number" ? o.lvl : null, s: !!o.safe, inc: false, disc: o.disc || null, why: null, icon: o.icon,
      pos: k, ord: order.map(i => st.options[i].id).join("") };
    if (o.inc && Math.random() < o.inc.p) {
      rec.inc = true;
      await sleep(600); alive(run);
      if (o.inc.from) { push({ t: "other", from: o.inc.from, text: o.inc.text }); await sleep(500); alive(run); }
      if (o.inc.kai) await kai(o.inc.kai, "oops", run);
      const b1 = S.m; S.m = G.applyFx(b1, o.inc.fx);
      flashMeters(b1, S.m);
      const d2 = deltas(b1, S.m); if (d2.length) push({ t: "sys", d: d2 });
    }
    S.ch.push(rec);
    if (st.why && typeof o.lvl === "number") {
      const dir = o.lvl >= 4 ? "give" : "keep";
      await kai(UI.why, "think", run);
      const wo = shuffled(G.WHY[dir].length), items = wo.map(i => G.WHY[dir][i]);
      const w = await ask({ kind: "chips", items, skip: true }); alive(run);
      if (w >= 0) { rec.why = items[w].id; push({ t: "me", text: { de: items[w].de, en: items[w].en } }); }
    }
    push({ t: "fact", text: st.fact });
    await ask({ kind: "next" }); alive(run);
  }
  async function side(st, run) {
    for (const line of st.kai) await kai(line, "wink", run);
    const cond = Math.random() < 0.5 ? "ki" : "mensch";
    await sleep(250); alive(run);
    push({ t: "art", art: st.art, cond });
    await sleep(500); alive(run);
    await kai(st.ask, "happy", run);
    const k = await ask({ kind: "answers", items: G.SIDE_OPTS }); alive(run);
    const o = G.SIDE_OPTS[k];
    push({ t: "me", icon: o.icon, text: o.label });
    S.sw = { d: st.id, cond, ans: o.id };
    await kai(o.re, "happy", run);
    await kai(UI.psst, "wink", run);
    push({ t: "fact", text: G.SIDE_FACT });
    await ask({ kind: "next" }); alive(run);
  }
  async function finish(run) {
    if (S.rn === 1) await profilePost(run);
    const e = G.endingOf(S.m, S.ch);
    const m = {}; for (const k in S.m) m[k] = Math.round(S.m[k]);
    const ts = Date.now();
    const doc = { id: S.sid + "-" + ts, v: 3, ts, day: dayStr(), sid: S.sid, rn: S.rn, sc: S.sc, lang, dev: KIOSK ? "maus" : "touch",
      prof: Object.assign({}, S.prof || {}), ch: S.ch.map(c => ({ d: c.d, o: c.o, l: c.l, s: c.s, inc: c.inc, disc: c.disc, why: c.why, pos: c.pos, ord: c.ord })),
      sw: S.sw, end: e.id, m, dur: Math.round((Date.now() - S.t0) / 1000) };
    Store.add(doc);
    await kai(UI.end1, "happy", run);
    await kai(UI.end2, "wink", run);
    push({ t: "result", end: e.id, sid: S.sid, ts: doc.ts, ch: S.ch.map(c => ({ l: c.l, icon: c.icon })) });
    if (KIOSK) armResultTimer();
    await sleep(1800); alive(run);
    await kai(UI.thanksKai, "happy", run);
    if (!(S.prof && S.prof.alter === "u18")) push({ t: "contact" });
    const v = await ask({ kind: "end" }); alive(run);
    clearTimeout(resultTimer);
    if (v === "person") return startNew();
    /* gleiche Person, anderer Betrieb: Profil bleibt */
    const keep = { sid: S.sid, prof: S.prof, rn: S.rn };
    newSession(keep); render(); runFlow(async r => {
      await kai(UI.hi3, "happy", r);
      const id = await ask({ kind: "scen" }); alive(r);
      await play(id, r);
    });
  }
  function runFlow(fn) {
    const run = S.run;
    fn(run).catch(err => { if (err !== ABORT) console.error(err); });
  }
  function startNew() {
    clearTimeout(resultTimer);
    if (KIOSK) { lang = LANG0; try { localStorage.removeItem("bsw-lang"); } catch (e) {} }
    newSession(null); render();
  }

  /* Kiosk: am Laptop nach Inaktivität neu starten */
  let idleTimer = null, resultTimer = null;
  function armResultTimer() { clearTimeout(resultTimer); resultTimer = setTimeout(() => { if (route() === "spiel") startNew(); }, 90000); }
  function resetIdle() {
    if (!KIOSK) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (route() === "spiel" && S && S.started) startNew(); }, 120000);
    if (S && S.dock && S.dock.spec.kind === "end") armResultTimer();
  }
  ["pointerdown", "keydown"].forEach(e => document.addEventListener(e, resetIdle, { passive: true }));

  document.addEventListener("keydown", ev => {
    if (route() === "spiel" && S && !S.started && ev.key === "Enter" && !(ev.target && ev.target.tagName === "BUTTON")) { ev.preventDefault(); beginGame(); return; }
    if (route() !== "spiel" || !S || !S.dock || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const sp = S.dock.spec, num = parseInt(ev.key, 10);
    if (sp.kind === "scen" && num >= 1 && num <= G.SCENARIOS.length) { ev.preventDefault(); resolveDock(G.SCENARIOS[num - 1].id); }
    else if ((sp.kind === "answers" || sp.kind === "chips") && num >= 1 && num <= sp.items.length) { ev.preventDefault(); resolveDock(num - 1); }
    else if (sp.kind === "chips" && sp.skip && num === 0) { ev.preventDefault(); resolveDock(-1); }
    else if (sp.kind === "end" && (num === 1 || num === 2 || ev.key === "Enter")) {
      if (ev.target && ev.target.tagName === "BUTTON" && ev.key === "Enter") return;
      ev.preventDefault(); const vals = KIOSK ? ["person", "again"] : ["again"]; const v = vals[(num || 1) - 1]; if (v) resolveDock(v);
    }
    else if (sp.kind === "next" && (ev.key === "Enter" || ev.key === " " || ev.key === "ArrowRight")) { ev.preventDefault(); resolveDock("next"); }
  });

  /* ---------- Statistik ---------- */
  let statsDay = "today";
  function hrow(label, p, sub) {
    return `<div class="hrow"><span>${label}${sub ? `<small>${sub}</small>` : ""}</span><span class="hbar"><i style="width:${p}%"></i></span><span class="num">${p} %</span></div>`;
  }
  function aggregate(list) {
    const binding = {};
    G.SCENARIOS.forEach(s => s.steps.forEach(st => { if (st.type === "verbindlich") binding[st.id] = { sc: s, st, n: 0, alone: 0 }; }));
    const A = { n: list.length, aloneAny: 0, ends: {}, why: { keep: {}, give: {} }, exp: { ki: [0, 0], mensch: [0, 0] }, use: {}, alter: {}, rolle: {}, pre: {}, post: {}, binding };
    list.forEach(p => {
      A.ends[p.end] = (A.ends[p.end] || 0) + 1;
      let any = false;
      (p.ch || []).forEach(c => {
        const b = binding[c.d]; if (b) { b.n++; if (c.l === 5) { b.alone++; any = true; } }
        if (c.why) { const dir = c.l >= 4 ? "give" : "keep"; A.why[dir][c.why] = (A.why[dir][c.why] || 0) + 1; }
      });
      if (any) A.aloneAny++;
      const first = !p.rn || p.rn === 1;
      if (first && p.sw && A.exp[p.sw.cond]) { A.exp[p.sw.cond][1]++; if (p.sw.ans === "fest") A.exp[p.sw.cond][0]++; }
      const pr = p.prof || {};
      if (first && pr.haltung && pr.haltung2) { A.pre[pr.haltung] = (A.pre[pr.haltung] || 0) + 1; A.post[pr.haltung2] = (A.post[pr.haltung2] || 0) + 1; }
      const u = pr.kinutzung || "keine"; A.use[u] = A.use[u] || [0, 0]; A.use[u][1]++; if (any) A.use[u][0]++;
      if (first && pr.alter) A.alter[pr.alter] = (A.alter[pr.alter] || 0) + 1;
      if (first && pr.rolle) A.rolle[pr.rolle] = (A.rolle[pr.rolle] || 0) + 1;
    });
    return A;
  }
  function viewStats() {
    const list = Store.all().filter(p => p.v === 3 && (statsDay === "all" || p.day === dayStr()));
    const A = aggregate(list);
    const st = Store.status();
    const status = st === "loading" ? T(UI.loading) : st === "slow" ? T(UI.slow) : st === "offline" ? T(UI.offline) : "";
    const prof = id => G.PROFILE_PRE.concat(G.PROFILE_POST).find(q => q.id === id);
    const distRows = (id, counts) => { const tot = Object.values(counts).reduce((a, b) => a + b, 0); return tot ? prof(id).opts.map(o => hrow(esc(t(o)), pct(counts[o.id] || 0, tot))).join("") + `<p class="note">${T(UI.n)} = ${tot}</p>` : `<p class="note">–</p>`; };
    const whyRows = dir => { const tot = Object.values(A.why[dir]).reduce((a, b) => a + b, 0); return tot ? G.WHY[dir].map(o => hrow(esc(t(o)), pct(A.why[dir][o.id] || 0, tot))).join("") : `<p class="note">–</p>`; };
    const bRows = Object.values(A.binding).filter(b => b.n).sort((x, y) => y.alone / y.n - x.alone / x.n)
      .map(b => hrow(T(b.st.short), pct(b.alone, b.n), `${T(b.sc.name)} · ${T(UI.n)} = ${b.n}`)).join("");
    const useRows = prof("kinutzung").opts.map(o => { const u = A.use[o.id]; return u ? hrow(esc(t(o)), pct(u[0], u[1]), `${T(UI.n)} = ${u[1]}`) : ""; }).join("");
    return `<section class="stats">
      <div class="stats-head">
        <h1>${T(UI.statsTitle)}</h1>
        <div class="tools">
          <button class="pill" data-day="today" aria-pressed="${statsDay === "today"}">${T(UI.today)}</button>
          <button class="pill" data-day="all" aria-pressed="${statsDay === "all"}">${T(UI.allDays)}</button>
          <button class="pill" id="sLang">${lang === "de" ? "EN" : "DE"}</button>
          <a class="pill" href="#spiel" style="text-decoration:none;color:inherit">${T(UI.backGame)}</a>
        </div>
      </div>
      ${status ? `<p class="note">${status}</p>` : ""}
      ${A.n === 0 ? `<div class="panel"><p>${T(UI.noData)}</p></div>` : `
      <div class="tiles">
        <div class="tile"><span class="big">${A.n}</span><span class="cap">${T(UI.rounds)}</span></div>
        <div class="tile"><span class="big">${pct(A.aloneAny, A.n)} %</span><span class="cap">${T(UI.aloneAny)}</span><span class="cap"><b>${T(UI.aloneInt)}</b></span></div>
        <div class="tile"><span class="cap"><b>${T(UI.expTitle)}</b></span>
          <div class="vs"><div><b>${pct(A.exp.ki[0], A.exp.ki[1])} %</b>🤖 ${T(UI.expKi)}<br><span class="note">${T(UI.n)} = ${A.exp.ki[1]}</span></div>
          <div><b>${pct(A.exp.mensch[0], A.exp.mensch[1])} %</b>👤 ${T(UI.expMensch)}<br><span class="note">${T(UI.n)} = ${A.exp.mensch[1]}</span></div></div>
          <span class="note">${T(UI.expCap)} · ${T(UI.expNote)}</span></div>
      </div>
      <div class="panels">
        <div class="panel"><h2>${T(UI.aloneTitle)}</h2>${bRows}</div>
        <div class="panel"><h2>${T(UI.whyTitle)}</h2><p class="note"><b>${T(UI.whyKeep)}</b></p>${whyRows("keep")}<p class="note"><b>${T(UI.whyGive)}</b></p>${whyRows("give")}</div>
        <div class="panel"><h2>${T(UI.endsTitle)}</h2>${G.ENDINGS.map(e => hrow(e.emoji + " " + T(e.name), pct(A.ends[e.id] || 0, A.n))).join("")}</div>
        <div class="panel"><h2>${T(UI.useTitle)}</h2><p class="note">${T(UI.useNote)}</p>${useRows || `<p class="note">–</p>`}</div>
        <div class="panel"><h2>${T(UI.prePostTitle)}</h2>${prePost(A)}</div>
        <div class="panel"><h2>${T(UI.ageTitle)}</h2>${distRows("alter", A.alter)}</div>
        <div class="panel"><h2>${T(UI.roleTitle)}</h2>${distRows("rolle", A.rolle)}</div>
      </div>`}
    </section>`;
  }
  function prePost(A) {
    const n = Object.values(A.pre).reduce((a, b) => a + b, 0);
    if (!n) return `<p class="note">–</p>`;
    return G.PROFILE_PRE[1].opts.map(o => `<div class="hrow"><span>${esc(t(o))}</span><span style="display:grid;gap:3px"><span class="hbar"><i style="width:${pct(A.pre[o.id] || 0, n)}%;background:#b3b3b3"></i></span><span class="hbar"><i style="width:${pct(A.post[o.id] || 0, n)}%"></i></span></span><span class="num" style="white-space:nowrap">${pct(A.pre[o.id] || 0, n)} → ${pct(A.post[o.id] || 0, n)}</span></div>`).join("")
      + `<p class="note">% ${T(UI.before)} (grau) → ${T(UI.after)} (dunkel) · ${T(UI.n)} = ${n}</p>`;
  }
  function bindStats() {
    root.querySelectorAll("[data-day]").forEach(b => b.onclick = () => { statsDay = b.dataset.day; render(); });
    const l = document.getElementById("sLang"); if (l) l.onclick = () => { lang = lang === "de" ? "en" : "de"; try { localStorage.setItem("bsw-lang", lang); } catch (e) {} render(); };
  }
  Store.onChange(() => { if (route() === "statistik") render(); });

  window.addEventListener("hashchange", () => { render(); });
  window.__bsw = { getState: () => S, aggregate, resolveDock, Store };

  newSession(null);
  render();
})();
