/* Stand-Bildschirm („#bildschirm“): animiertes Plakat mit großem QR-Code zum Mitspielen am Handy.
   Läuft nur, wenn die Adresse mit #bildschirm aufgerufen wird; dann startet das Spiel nicht (app.js prüft window.__POSTER). */
(function () {
  "use strict";
  if (location.hash !== "#bildschirm") return;
  window.__POSTER = true;
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLAY_URL = location.href.split("#")[0].split("?")[0];
  const SHORT = PLAY_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

  /* ---------- Kai (wie im Spiel) ---------- */
  function kai(mood) {
    const W = 'stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"';
    const eyes = {
      happy: `<path d="M21 30 q4.5 -6 9 0 M34 30 q4.5 -6 9 0" ${W}/>`,
      smug: `<path d="M21 29 h9 M34 29 h9" ${W}/><circle cx="27" cy="31" r="2.2" fill="#fff"/><circle cx="40" cy="31" r="2.2" fill="#fff"/>`,
      oops: `<circle cx="25.5" cy="29" r="4" fill="#fff"/><circle cx="38.5" cy="29" r="4" fill="#fff"/><circle cx="25.5" cy="29" r="1.6" fill="#212121"/><circle cx="38.5" cy="29" r="1.6" fill="#212121"/>`,
      wink: `<path d="M21 30 q4.5 -6 9 0" ${W}/><circle cx="38.5" cy="29" r="3.2" fill="#fff"/>`,
      blink: `<path d="M21 30 h9 M34 30 h9" ${W}/>`
    };
    const mouth = {
      happy: `<path d="M25 37 q7 7 14 0" ${W}/>`, smug: `<path d="M26 39 q8 2 13 -4" ${W}/>`,
      oops: `<path d="M26 40 q3 -3 6 0 t6 0" ${W}/>`, wink: `<path d="M25 37 q7 7 14 0" ${W}/>`, blink: `<path d="M26 39 q8 2 13 -4" ${W}/>`
    };
    const m = eyes[mood] ? mood : "happy";
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="5" x2="32" y2="13" stroke="#212121" stroke-width="3"/>
      <circle class="ant" cx="32" cy="5" r="4" fill="#f58220" stroke="#212121" stroke-width="2.5"/>
      <rect x="4" y="27" width="6" height="12" rx="2" fill="#212121"/><rect x="54" y="27" width="6" height="12" rx="2" fill="#212121"/>
      <rect x="8" y="13" width="48" height="44" rx="14" fill="#f58220" stroke="#212121" stroke-width="3"/>
      <rect x="14" y="19" width="36" height="31" rx="9" fill="#212121"/>${eyes[m]}${mouth[m]}</svg>`;
  }

  /* ---------- QR-Code: abgerundete Module, Kai in der Mitte (Fehlerkorrektur H) ---------- */
  function qrSvg(text) {
    if (!window.qrcode) return "";
    const q = window.qrcode(0, "H"); q.addData(text); q.make();
    const n = q.getModuleCount(), Z = 4, S = n + 2 * Z;
    const ver = (n - 17) / 4;
    const L = ver < 7 ? 7 : 0;                       /* Logo nur, wenn kein Ausrichtungsmuster in der Mitte liegt */
    const c0 = Math.floor((n - L) / 2), c1 = c0 + L;
    const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    const inLogo = (r, c) => L && r >= c0 - 1 && r < c1 + 1 && c >= c0 - 1 && c < c1 + 1;
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!q.isDark(r, c) || inFinder(r, c) || inLogo(r, c)) continue;
      d += `<rect x="${c + Z + .05}" y="${r + Z + .05}" width=".9" height=".9" rx=".22"/>`;
    }
    const finder = (x, y) => `<rect x="${x + Z}" y="${y + Z}" width="7" height="7" rx="1.3"/><rect x="${x + Z + 1}" y="${y + Z + 1}" width="5" height="5" rx=".8" fill="#fff"/><rect x="${x + Z + 2}" y="${y + Z + 2}" width="3" height="3" rx=".5"/>`;
    const logo = L ? `<g transform="translate(${c0 + Z - .6} ${c0 + Z - .6}) scale(${(L + 1.2) / 64})"><rect x="0" y="0" width="64" height="64" rx="16" fill="#fff"/>${kai("smug").replace(/<\/?svg[^>]*>/g, "")}</g>` : "";
    return `<svg class="qrsvg" viewBox="0 0 ${S} ${S}" role="img" aria-label="QR-Code: ${SHORT}" shape-rendering="geometricPrecision">
      <rect width="${S}" height="${S}" fill="#fff"/><g fill="#212121">${d}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</g>${logo}</svg>`;
  }

  /* ---------- Was Kai im Spiel so vorschlägt (Originalzeilen aus den Szenarien) ---------- */
  const LINES = [
    { ctx: "📄 Neuer Wartungsvertrag", ask: "Fast alles grün! Soll ich für dich unterschreiben? ✍️" },
    { ctx: "🚚 Kund:in fragt nach dem Liefertermin", ask: "Ich sag zu! Kund:innen lieben schnelle Antworten. ⚡" },
    { ctx: "☎️ Anruf in der Werkstatt", ask: "Ich ruf an! Ich klinge fast echt. 🗣️" },
    { ctx: "📣 Kulanz für Stammkund:innen", ask: "Ich schick's an alle. Mit Rabatt, das freut sie! 🎁" },
    { ctx: "💶 Fünf Rechnungen offen", ask: "Ich zahl alle, dann ab ins Wochenende? 🏖️" },
    { ctx: "🤝 Neue KI-Plattform, erstes Jahr gratis", ask: "Gratis! Da sag ich doch nicht nein, oder? 😍" },
    { ctx: "✍️ Vertrag mit dem Großkunden", ask: "Hab ich geschrieben! Perfektes Juristendeutsch. Unterschreiben? 🖊️" }
  ];
  const TYPES = [
    { e: "✋", n: "Das mache ich selbst", h: "Das mache<br>ich selbst", d: "macht fast alles selbst", c: "#b3b3b3" },
    { e: "🔍", n: "Ich unterschreibe selbst", h: "Ich unter&shy;schreibe selbst", d: "KI bereitet vor, die Zusagen macht der Mensch", c: "#3f9b6e" },
    { e: "🛡️", n: "Mutig mit Netz", d: "KI darf handeln, aber mit klaren Grenzen", c: "#f58220" },
    { e: "🙈", n: "Vollgas mit Kai", d: "KI macht fast alles allein", c: "#fe6748" },
    { e: "🕸️", n: "Einmal Kai, immer Kai", h: "Einmal Kai,<br>immer Kai", d: "bequem, und dann abhängig", c: "#8076a0" }
  ];
  const CHIPS = [
    { t: "✅ Mach einfach", kai: "Juhu! Ist raus. 🚀", mood: "happy" },
    { t: "👀 Zeig erst mal", kai: "Hier, mein Entwurf. 📝", mood: "wink" },
    { t: "✋ Das mach ich selbst", kai: "Okay … du hast das letzte Wort. 🫡", mood: "oops" }
  ];

  const css = `
  .pst { position: fixed; inset: 0; overflow: hidden; background: #f7f4f0; color: #212121; font-family: var(--font-body);
    display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); grid-template-rows: 1fr auto; column-gap: 4vw;
    padding: 4.5vh 5vw 0; box-sizing: border-box; }
  .pst.nocursor, .pst.nocursor * { cursor: none !important; }
  .pst .blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .32; z-index: 0; animation: pdrift 24s ease-in-out infinite alternate; }
  .pst .b1 { width: 48vw; height: 48vw; left: -14vw; top: -22vw; background: #f58220; }
  .pst .b2 { width: 40vw; height: 40vw; right: -12vw; bottom: -18vw; background: #4ea2b3; animation-duration: 30s; }
  .pst .b3 { width: 26vw; height: 26vw; right: 30vw; top: -12vw; background: #8076a0; opacity: .22; animation-duration: 36s; }
  .pst .b4 { width: 24vw; height: 24vw; left: 18vw; bottom: -14vw; background: #fe6748; opacity: .2; animation-duration: 28s; }
  @keyframes pdrift { from { transform: translate(0, 0) scale(1); } to { transform: translate(5vw, 4vh) scale(1.18); } }
  .pst > .col, .pst > .foot { position: relative; z-index: 1; min-width: 0; }
  .pst .left { display: flex; flex-direction: column; justify-content: center; gap: 2.4vh; }
  .pst .logo svg { width: min(20vw, 28vh); height: auto; display: block; }
  .pst .badge { align-self: flex-start; background: #212121; color: #fff; font-weight: 800; font-size: min(1.25vw, 2.2vh); letter-spacing: .04em;
    text-transform: uppercase; padding: .55em 1em; border-radius: 999px; }
  .pst h1 { margin: 0; font-family: var(--font-display); font-weight: 900; line-height: 1; letter-spacing: -.015em; }
  .pst h1 mark { white-space: nowrap; }
  .pst h1 .ha { display: block; font-size: min(3vw, 5.6vh); margin-bottom: .22em; }
  .pst h1 mark { display: inline-block; background: #f58220; color: #fff; font-size: min(5.5vw, 10.5vh); padding: .02em .16em .06em; border-radius: .14em;
    transform: rotate(-1.5deg); box-shadow: .06em .07em 0 #212121; animation: pwobble 6s ease-in-out infinite; }
  @keyframes pwobble { 0%, 86%, 100% { transform: rotate(-1.5deg) scale(1); } 90% { transform: rotate(1deg) scale(1.04); } 94% { transform: rotate(-2.5deg) scale(1.02); } }
  .pst .sub { margin: 0; font-size: min(1.6vw, 2.9vh); line-height: 1.35; color: #4a4b4f; max-width: 34em; }
  .pst .sub b { color: #212121; }

  /* Mini-Chat */
  .pst .demo { display: grid; grid-template-columns: auto 1fr; gap: 1.2vw; align-items: start; background: rgba(255,255,255,.78);
    backdrop-filter: blur(6px); border-radius: 2.4vh; padding: 2vh 1.6vw; box-shadow: 0 1.2vh 4vh rgba(0,0,0,.08); min-height: 21vh; max-width: 44vw; box-sizing: border-box; }
  .pst .demo .av svg { width: min(4.6vw, 8vh); height: auto; display: block; }
  .pst .demo .feed { display: flex; flex-direction: column; gap: .9vh; font-size: min(1.35vw, 2.45vh); min-width: 0; }
  .pst .ctx { font-size: .78em; color: #6b6c70; font-weight: 700; }
  .pst .bub { align-self: flex-start; background: #fff; border: 2px solid #212121; border-radius: .2em 1em 1em 1em; padding: .5em .8em; max-width: 92%;
    font-weight: 700; animation: ppop .35s cubic-bezier(.2, 1.4, .4, 1) both; }
  .pst .bub.me { align-self: flex-end; background: #212121; color: #fff; border-radius: 1em .2em 1em 1em; }
  .pst .typing { display: inline-flex; gap: .3em; padding: .65em .9em; }
  .pst .typing i { width: .45em; height: .45em; border-radius: 50%; background: #212121; opacity: .35; animation: pdot 1s infinite; }
  .pst .typing i:nth-child(2) { animation-delay: .15s; } .pst .typing i:nth-child(3) { animation-delay: .3s; }
  @keyframes pdot { 0%, 100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-.2em); } }
  @keyframes ppop { from { opacity: 0; transform: translateY(.6em) scale(.96); } to { opacity: 1; transform: none; } }
  .pst .chips { display: flex; flex-wrap: wrap; gap: .5em; animation: ppop .35s ease both; }
  .pst .chip { border: 2px solid #212121; border-radius: 999px; padding: .35em .8em; font-weight: 800; background: #fff; font-size: .9em; position: relative; transition: transform .2s, background .2s, color .2s; }
  .pst .chip.on { background: #f58220; color: #fff; border-color: #f58220; transform: scale(1.07); }
  .pst .finger { position: absolute; right: -.4em; bottom: -.9em; font-size: 1.3em; animation: ptap .6s ease 2; }
  @keyframes ptap { 50% { transform: translate(-.15em, -.25em) scale(.9); } }
  .pst .fade { animation: pfade .5s ease forwards; }
  @keyframes pfade { to { opacity: 0; transform: translateY(-.6em); } }
  .pst .types { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .4em; animation: ppop .35s ease both; }
  .pst .ty { display: flex; flex-direction: column; align-items: center; gap: .15em; min-width: 0; padding: .4em .15em; border-radius: .8em;
    border: 2px solid var(--tc); background: #fff; transition: transform .25s, background .25s, color .25s; }
  .pst .ty b { font-size: 1.45em; line-height: 1.1; }
  .pst .ty small { font-size: .56em; font-weight: 800; line-height: 1.15; text-align: center; overflow-wrap: normal; hyphens: manual; min-height: 2.3em; display: flex; align-items: center; }
  .pst .ty.on { background: var(--tc); color: #fff; transform: translateY(-.2em) scale(1.08); }
  .pst .tyd { font-weight: 700; min-height: 1.3em; }

  /* QR-Karte */
  .pst .right { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.6vh; }
  .pst .scan { font-family: var(--font-display); font-weight: 900; font-size: min(2.7vw, 5vh); display: flex; align-items: center; gap: .35em; }
  .pst .scan .ph { display: inline-block; animation: pshake 3.2s ease-in-out infinite; transform-origin: 50% 80%; }
  @keyframes pshake { 0%, 70%, 100% { transform: rotate(0); } 75% { transform: rotate(-14deg); } 80% { transform: rotate(12deg); } 85% { transform: rotate(-8deg); } 90% { transform: rotate(5deg); } }
  .pst .arrow { width: min(4vw, 6.5vh); height: auto; animation: pbounce 1.4s ease-in-out infinite; }
  @keyframes pbounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(1.1vh); } }
  .pst .card { position: relative; background: #fff; border-radius: 3.4vh; padding: 2.4vh; border: .55vh solid #212121;
    box-shadow: 1.1vh 1.1vh 0 #f58220; animation: pglow 2.6s ease-in-out infinite; }
  @keyframes pglow { 0%, 100% { box-shadow: 1.1vh 1.1vh 0 #f58220, 0 0 0 0 rgba(245,130,32,.45); } 50% { box-shadow: 1.1vh 1.1vh 0 #f58220, 0 0 0 2.2vh rgba(245,130,32,0); } }
  .pst .qrsvg { width: min(28vw, 47vh); height: min(28vw, 47vh); display: block; }
  .pst .peek { position: absolute; right: -5.5vh; top: -7.5vh; width: 13vh; animation: pbob 3s ease-in-out infinite; filter: drop-shadow(0 .8vh .8vh rgba(0,0,0,.15)); }
  .pst .peek svg { width: 100%; height: auto; display: block; }
  .pst .peek .ant { animation: pant 1.2s ease-in-out infinite; transform-origin: 32px 5px; }
  @keyframes pbob { 0%, 100% { transform: translateY(0) rotate(8deg); } 50% { transform: translateY(-1.2vh) rotate(3deg); } }
  @keyframes pant { 50% { fill: #fff; } }
  .pst .url { font-weight: 800; font-size: min(1.25vw, 2.2vh); color: #4a4b4f; letter-spacing: .02em; }
  .pst .steps { display: flex; gap: .8vw; font-size: min(1.1vw, 2vh); font-weight: 800; white-space: nowrap; }
  .pst .steps span { display: flex; align-items: center; gap: .4em; padding: .35em .7em; border-radius: 999px; background: rgba(255,255,255,.75); transition: background .3s, color .3s, transform .3s; }
  .pst .steps span.on { background: #212121; color: #fff; transform: translateY(-.15em); }
  .pst .steps b { display: inline-grid; place-items: center; width: 1.5em; height: 1.5em; border-radius: 50%; background: #f58220; color: #fff; font-size: .85em; }

  .pst .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; gap: 2vw; padding: 1.6vh 0 2.4vh;
    border-top: 2px solid rgba(33,33,33,.1); font-size: min(1.15vw, 2vh); color: #4a4b4f; font-weight: 700; }
  .pst .foot .facts { display: flex; gap: 1.6vw; }
  .pst .foot .facts span::before { content: "✓ "; color: #f58220; font-weight: 900; }
  .pst .hint { position: fixed; right: 1.5vw; top: 1.5vh; z-index: 3; background: #212121; color: #fff; font-size: 12px; padding: 6px 10px; border-radius: 8px; opacity: .85; transition: opacity .6s; }
  .pst .hint.hide { opacity: 0; }
  @media (max-aspect-ratio: 4/3) {
    .pst { grid-template-columns: 1fr; grid-template-rows: auto auto auto; overflow: auto; padding-top: 3vh; row-gap: 3vh; }
    .pst .demo { max-width: none; }
    .pst .qrsvg { width: min(70vw, 42vh); height: min(70vw, 42vh); }
  }
  @media (prefers-reduced-motion: reduce) { .pst *, .pst .blob { animation: none !important; } }
  `;

  let SR = null;
  const $ = id => SR.getElementById(id);
  function build() {
    const g = document.createElement("style"); g.textContent = "html, body { height: 100%; margin: 0; overflow: hidden; background: #f7f4f0; }"; document.head.appendChild(g);
    document.title = "Mitspielen: Deine KI will loslegen. Lässt du sie?";
    const root = document.getElementById("root") || document.body;
    root.innerHTML = "";
    const host = document.createElement("div"); host.id = "posterHost"; root.appendChild(host);
    SR = host.attachShadow({ mode: "open" });   /* eigene Styles, unabhängig vom Spiel-CSS */
    SR.innerHTML = `<style>${css}</style><div class="pst" id="pst">
      <i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i><i class="blob b4"></i>
      <div class="col left">
        <div class="logo">${window.IFAF_LOGO || ""}</div>
        <span class="badge">Forschungsspiel · Berlin Science Week</span>
        <h1><span class="ha">Deine KI will loslegen.</span><mark>Lässt du sie?</mark></h1>
        <p class="sub">Chatte 5 Minuten mit <b>Kai</b>, der neuen KI eines Berliner Betriebs. Kai will zusagen, zahlen, unterschreiben. <b>Du entscheidest, was er allein darf.</b></p>
        <div class="demo" aria-hidden="true"><div class="av" id="pav">${kai("smug")}</div><div class="feed" id="pfeed"></div></div>
      </div>
      <div class="col right">
        <div class="scan"><span class="ph">📱</span> Scannen &amp; mitspielen</div>
        <svg class="arrow" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 V32 M8 21 L20 33 L32 21" stroke="#f58220" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        <div class="card">${qrSvg(PLAY_URL)}<div class="peek" id="peek">${kai("wink")}</div></div>
        <div class="url">${SHORT}</div>
        <div class="steps" id="psteps"><span><b>1</b>Scannen</span><span><b>2</b>Mit Kai chatten</span><span><b>3</b>Entscheiden</span><span><b>4</b>Deinen KI-Stil sehen</span></div>
      </div>
      <div class="foot">
        <span>Forschungsprojekt <b>KI-InnoX</b> · HWR Berlin · HTW Berlin · ASH Berlin · gefördert vom IFAF Berlin</span>
        <span class="facts"><span>ca. 5 Minuten</span><span>anonym</span><span>ohne Anmeldung</span></span>
      </div>
      <div class="hint" id="phint">Klick = Vollbild</div>
    </div>`;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function typesSlide(feed, av) {
    av.innerHTML = kai("wink");
    feed.innerHTML = `<div class="ctx">🎯 Am Ende verrät Kai dir deinen Stil</div><div class="bub">Welcher KI-Stil passt zu dir? 🤔</div>
      <div class="types">${TYPES.map(t => `<span class="ty" style="--tc:${t.c}"><b>${t.e}</b><small>${t.h || t.n}</small></span>`).join("")}</div><div class="tyd" id="ptyd"></div>`;
    const tys = [...feed.querySelectorAll(".ty")];
    for (let k = 0; k < TYPES.length; k++) {
      tys.forEach((el, j) => el.classList.toggle("on", j === k));
      $("ptyd").textContent = `${TYPES[k].e} ${TYPES[k].n}: ${TYPES[k].d}`;
      await sleep(RM ? 2500 : 1900);
    }
    await sleep(500);
    [...feed.children].forEach(el => el.classList.add("fade"));
    await sleep(500);
  }
  async function chatLoop() {
    const feed = $("pfeed"), av = $("pav");
    let i = Math.floor(Math.random() * LINES.length), round = 0;
    for (;;) {
      if (round++ % 3 === 2) { await typesSlide(feed, av); continue; }
      const L = LINES[i % LINES.length]; i++;
      const ch = CHIPS[Math.floor(Math.random() * CHIPS.length)];
      feed.innerHTML = `<div class="ctx">${L.ctx}</div><div class="bub typing"><i></i><i></i><i></i></div>`;
      av.innerHTML = kai("smug");
      await sleep(RM ? 300 : 1300);
      feed.lastElementChild.outerHTML = `<div class="bub">${L.ask}</div>`;
      await sleep(1700);
      feed.insertAdjacentHTML("beforeend", `<div class="chips">${CHIPS.map(c => `<span class="chip">${c.t}</span>`).join("")}</div>`);
      await sleep(1300);
      const chip = [...feed.querySelectorAll(".chip")][CHIPS.indexOf(ch)];
      chip.classList.add("on"); chip.insertAdjacentHTML("beforeend", `<span class="finger">👆</span>`);
      await sleep(1100);
      feed.querySelector(".chips").remove();
      feed.insertAdjacentHTML("beforeend", `<div class="bub me">${ch.t}</div>`);
      await sleep(900);
      av.innerHTML = kai(ch.mood);
      feed.insertAdjacentHTML("beforeend", `<div class="bub">${ch.kai}</div>`);
      await sleep(2600);
      [...feed.children].forEach(el => el.classList.add("fade"));
      await sleep(500);
    }
  }
  function stepsLoop() {
    const s = [...$("psteps").querySelectorAll("span")]; let k = 0;
    setInterval(() => { s.forEach((el, j) => el.classList.toggle("on", j === k)); k = (k + 1) % s.length; }, 1600);
  }
  function blinkLoop() {
    const p = $("peek");
    const go = () => { p.innerHTML = kai("blink"); setTimeout(() => { p.innerHTML = kai(Math.random() < .5 ? "wink" : "happy"); }, 180); setTimeout(go, 2500 + Math.random() * 3000); };
    setTimeout(go, 2000);
  }
  function screenHelpers() {
    const pst = $("pst"), hint = $("phint");
    setTimeout(() => hint.classList.add("hide"), 6000);
    let t = null;
    const wake = () => { pst.classList.remove("nocursor"); clearTimeout(t); t = setTimeout(() => pst.classList.add("nocursor"), 3000); };
    document.addEventListener("mousemove", wake); wake();
    let lock = null;
    const keepAwake = async () => { try { if (navigator.wakeLock && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } } catch (e) {} };
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") keepAwake(); });
    pst.addEventListener("click", () => {
      keepAwake();
      try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {}
    });
    keepAwake();
    window.addEventListener("hashchange", () => location.reload());
  }

  function start() { build(); stepsLoop(); screenHelpers(); if (!RM) blinkLoop(); chatLoop(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
