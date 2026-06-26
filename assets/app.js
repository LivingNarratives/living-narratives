/* ============================================================================
   D.O.C.E. — Federal Department of Confirmed Existence
   app.js  —  Reviewed by the Office of Reviewing Things. Filed under Form 27-B/6-JS.
   No frameworks. No APIs. No mercy. Pure, grass-fed, free-range bureaucracy.
   ============================================================================ */
(function () {
"use strict";

/* ------------------------------------------------------------------ STATE */
const S = {
  dwell: 0,              // seconds on page
  tier: 0,               // agent escalation tier
  formsPending: 0,
  formsEverMade: 0,
  realness: 0,           // 0-100
  yourNumber: null,
  nowServing: 1,
  muted: false,
  audioReady: false,
  applied: false,
  certIssued: false,
  sealClicks: 0,
  typed: "",
  konami: 0,
  idle: 0,
  lastInteract: Date.now(),
  classified: false,
  ending: false,
  stats: { confirmed: 6, pending: 3000000001, forms: 0, ducks: 0 },
  visitors: parseInt(localStorage.getItem("doce_visitors") || "0", 10) || (4294967290 + Math.floor(Math.random()*99)),
  ach: JSON.parse(localStorage.getItem("doce_ach") || "{}"),
};
S.visitors++;
localStorage.setItem("doce_visitors", S.visitors);

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = (n, l) => String(n).padStart(l, "0");

/* ============================================================== AUDIO ENGINE
   Every sound is synthesized. The Department does not license audio. */
const Audio = (() => {
  let ctx = null, master = null, holdNode = null, holdOn = false;
  function ensure() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
      S.audioReady = true;
    } catch (e) { /* the Department regrets nothing */ }
  }
  function tone(freq, dur, type = "sine", vol = 0.3, when = 0, slideTo = null) {
    if (!ctx || S.muted) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime + when);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + when + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
    o.connect(g); g.connect(master); o.start(ctx.currentTime + when); o.stop(ctx.currentTime + when + dur + 0.02);
  }
  function noise(dur, vol = 0.2, when = 0) {
    if (!ctx || S.muted) return;
    const n = ctx.createBufferSource(), buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    n.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    n.connect(g); g.connect(master); n.start(ctx.currentTime + when);
  }
  const FX = {
    stamp() { ensure(); noise(0.12, 0.4); tone(90, 0.14, "square", 0.4, 0, 50); },
    ding() { ensure(); tone(880, 0.18, "sine", 0.3); tone(1320, 0.22, "sine", 0.2, 0.05); },
    error() { ensure(); tone(180, 0.18, "sawtooth", 0.3, 0, 110); tone(140, 0.2, "sawtooth", 0.3, 0.12, 90); },
    type() { ensure(); tone(rand(400, 600), 0.03, "square", 0.12); },
    click() { ensure(); tone(520, 0.05, "triangle", 0.2); },
    pop() { ensure(); tone(660, 0.08, "sine", 0.25, 0, 880); },
    fanfare() { ensure(); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.3, i * 0.12)); },
    sadtrombone() { ensure(); [330, 311, 294, 277].forEach((f, i) => tone(f, 0.5, "sawtooth", 0.28, i * 0.28, f * 0.94)); },
    dialup() { ensure(); tone(1400, 0.3, "sine", 0.2); tone(2100, 0.3, "sine", 0.15, 0.3); noise(0.5, 0.12, 0.6); tone(1800, 0.4, "square", 0.1, 0.7); },
    quack() { ensure(); tone(300, 0.18, "sawtooth", 0.3, 0, 600); tone(500, 0.12, "sawtooth", 0.25, 0.1, 250); },
    alarm() { ensure(); for (let i = 0; i < 3; i++) { tone(720, 0.16, "square", 0.25, i * 0.32, 480); } },
    paper() { ensure(); noise(0.18, 0.15); },
    boop() { ensure(); tone(440, 0.1, "sine", 0.2, 0, 330); },
  };
  function holdMusic(on) {
    ensure(); if (!ctx) return;
    if (on && !holdOn) {
      holdOn = true; playHoldLoop();
    } else if (!on) { holdOn = false; }
  }
  // a wretched, tinny, eternal hold melody
  function playHoldLoop() {
    if (!holdOn || S.muted) { if (holdOn) setTimeout(playHoldLoop, 500); return; }
    const mel = [392, 440, 494, 440, 392, 330, 392, 0];
    mel.forEach((f, i) => { if (f) tone(f, 0.22, "triangle", 0.08, i * 0.26); });
    setTimeout(playHoldLoop, mel.length * 260 + 200);
  }
  return { FX, ensure, holdMusic };
})();

/* ================================================================ BIOS BOOT */
const BIOS_LINES = [
  ["Mounting reality.................", "ok"],
  ["Checking for self-awareness......", "warn"],
  ["self-awareness: NOT FOUND (acceptable)", "ok"],
  ["Loading 4,000,000 forms..........", "ok"],
  ["Loading 4,000,001 forms..........", "ok"],
  ["Calibrating bureaucracy..........", "ok"],
  ["Detecting ducks..................", "warn"],
  ["WARNING: 1 duck detected. Logging.", "warn"],
  ["Spinning up the seal.............", "ok"],
  ["Verifying the Department exists...", "warn"],
  ["...", "warn"],
  ["...", "warn"],
  ["assuming yes for now.............", "ok"],
  ["Hiring Agent Malarkey............", "ok"],
  ["Agent Malarkey: 'do i have to'...", "warn"],
  ["Stamping the air.................", "ok"],
  ["Pre-rejecting your application...", "ok"],
  ["Lowering expectations............", "ok"],
  ["Lowering them further............", "ok"],
  ["Existence subsystems: ONLINE.....", "ok"],
];
function runBios(done) {
  document.body.classList.add("crt");
  const log = $("bios-log"), bar = $("bios-bar"), status = $("bios-status");
  let i = 0;
  const tick = () => {
    if (i < BIOS_LINES.length) {
      const [txt, cls] = BIOS_LINES[i];
      const div = document.createElement("div");
      div.className = cls; div.textContent = "> " + txt;
      log.appendChild(div); log.scrollTop = log.scrollHeight;
      Audio.FX.type();
      bar.style.width = Math.round(((i + 1) / BIOS_LINES.length) * 100) + "%";
      status.textContent = pick([
        "Initializing existence subsystems...","Please do not exist yet...",
        "Almost certainly working...","Consulting the Big Book of Forms...",
        "Negotiating with the printer...","This is taking exactly as long as intended...",
      ]);
      i++;
      setTimeout(tick, i === BIOS_LINES.length ? 700 : rand(110, 320));
    } else {
      status.textContent = "Boot complete. You are now eligible to begin waiting.";
      bar.style.width = "100%";
      setTimeout(() => {
        document.body.classList.remove("crt");
        $("bios").classList.add("hidden");
        done();
      }, 850);
    }
  };
  tick();
  // "skip" — but it just judges you
  const skip = () => {
    Audio.FX.error();
    status.textContent = "Skip request DENIED. You will boot at the Department's pace.";
    award("impatient");
  };
  window.addEventListener("keydown", skip, { once: false });
  $("bios").addEventListener("click", skip);
}

/* =========================================================== MARQUEE/TICKER */
const MARQUEE = [
  "⚠ NOTICE: You may not currently exist. This is fixable for a small fee and your entire afternoon.",
  "Form 27-B/6 is now MANDATORY for all persons, animals, concepts, and Tuesdays.",
  "The Department reminds you that thinking is a privilege, not a right.",
  "Duck-related incidents are up 4,000% this fiscal eternity.",
  "Please remain calm. Calmness is also a form. It is Form 88.",
  "If you can read this you are legally required to keep reading this.",
];
const TICKER = [
  "EXISTENCE INDEX <b>▲ 0.0001%</b>", "DUCK COMPLIANCE <b>▼ 12%</b>",
  "FORMS OUTSTANDING <b>∞</b>", "TONER LEVELS <b>CRITICAL</b>",
  "PUBLIC TRUST <b>'lol'</b>", "AVERAGE WAIT TIME <b>your lifetime</b>",
  "REALITY UPTIME <b>99.3%</b>", "MORALE <b>BEIGE</b>",
];
function buildTickers() {
  $("marquee-track").innerHTML = MARQUEE.map(t => `<span>${t}</span>`).join("");
  $("ticker-track").innerHTML = (TICKER.concat(TICKER)).map(t => `<span>${t}</span>`).join("");
}

/* ================================================================ THE SEAL */
function buildSealText() {
  const txt = "★ FEDERAL DEPARTMENT OF CONFIRMED EXISTENCE ★ PROBAMUS TE ESSE ★ ";
  const g = $("seal-text"); if (!g) return;
  const R = 86, cx = 100, cy = 100, N = txt.length;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x.toFixed(1)); t.setAttribute("y", y.toFixed(1));
    t.setAttribute("transform", `rotate(${(a * 180 / Math.PI) + 90} ${x.toFixed(1)} ${y.toFixed(1)})`);
    t.setAttribute("class", "seal-text"); t.setAttribute("text-anchor", "middle");
    t.textContent = txt[i];
    g.appendChild(t);
  }
}
// googly eyes follow cursor (seal + agent)
function eyeTrack(e) {
  const move = (eyeId, pupilSel, max) => {
    document.querySelectorAll(pupilSel).forEach(p => {
      const r = p.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const a = Math.atan2(e.clientY - cy, e.clientX - cx);
      p.style.transform = `translate(${Math.cos(a) * max}px, ${Math.sin(a) * max}px)`;
    });
  };
  move(null, ".pupil", 3);
  move(null, ".a-pup", 4);
}

/* ============================================================== AGENT LINES
   Escalation by tier. Tier rises with dwell time. Personality decays gracefully. */
const AGENT = {
  greet: [
    "Welcome to the Department. Please do not make any sudden existences.",
    "Ah. A claimant. How... three-dimensional of you.",
    "I'm Agent Malarkey. I'll be processing your existence today. Allegedly.",
  ],
  tier1: [ // polite/cold (0-45s)
    "Have you considered filling out a form? We have several billion.",
    "Take your time. We have until the heat death of the universe. Roughly.",
    "Per regulation, please continue existing in the waiting area.",
    "That's a very nice cursor you have. We'll need a form for it.",
  ],
  tier2: [ // chatty (45-100s)
    "Between us? Nobody reads Form 27-B/6-C. I've worked here 40 years. Nobody.",
    "You're still here. Most people leave. The duck never leaves either.",
    "I used to want to be a lighthouse keeper. Now I confirm that strangers are real.",
    "Did you know the Department has 1.2 million employees? I've met none of them.",
  ],
  tier3: [ // oversharing (100-180s)
    "Do you ever wonder if the forms are filling out US?",
    "I haven't seen sunlight since the Carter administration. Was it nice?",
    "My performance review said I 'lack a clear sense of self.' We ALL lack that here.",
    "I named the office plant Geoffrey. Geoffrey is also pending existence.",
  ],
  tier4: [ // existential (180-300s)
    "Wait. Who confirms the confirmers? Who confirms... me?",
    "I've stamped 'APPROVED' four million times and never once felt approved.",
    "If I process your existence, and you process my existence, are either of us real?",
    "The seal won't stop spinning. It's been spinning since 1973. Why does it spin.",
  ],
  tier5: [ // breakdown (300s+)
    "I checked the records. The Department isn't IN the records. WE were never filed.",
    "There is no Form for the feeling I am having right now. I would know. I wrote them all.",
    "Please. Keep clicking things. As long as you click, I exist. I think. I think?",
    "Don't go. If you close the tab, do I keep waiting? Do I wait forever, alone, beige?",
  ],
  onApply: [
    "Bold. You WANT to exist officially. Let's see if the system agrees. It won't.",
    "Submitting... this will generate exactly three more forms. It's the law. I made the law.",
  ],
  onForm: [
    "And there it is. Another form. They breed, you know.",
    "Three more. Always three more. It's almost beautiful. It's not.",
    "Geoffrey the plant has fewer forms than you and Geoffrey is doing GREAT.",
  ],
  idle: [
    "Hello? You've stopped clicking. Don't stop clicking.",
    "I can hear you not-existing from here. It's very loud.",
    "The duck moved. I don't want to talk about it.",
    "Still here? Same. Eternally. Same.",
  ],
};
let agentTimer = null, agentBusy = false;
function agentSay(text, mood = "neutral", ms = 5200) {
  const a = $("agent"), b = $("agent-text"), mouth = $("a-mouth");
  if (!a) return;
  a.classList.remove("hidden");
  agentBusy = true;
  // typewriter
  b.textContent = "";
  let i = 0;
  const speak = () => {
    if (i <= text.length) {
      b.textContent = text.slice(0, i);
      if (i % 2 === 0) Audio.FX.type();
      i++;
      setTimeout(speak, 18);
    } else { agentBusy = false; }
  };
  speak();
  // mouth mood
  const mouths = { neutral: "M48 78 Q60 84 72 78", happy: "M48 76 Q60 90 72 76",
    sad: "M48 84 Q60 76 72 84", flat: "M48 80 L72 80", oh: "M54 76 Q60 88 66 76" };
  if (mouth) mouth.setAttribute("d", mouths[mood] || mouths.neutral);
  a.classList.toggle("glitch", mood === "glitch");
  clearTimeout(agentTimer);
  agentTimer = setTimeout(() => { if (!agentBusy) $("agent-bubble").style.opacity = ".0"; }, ms);
  $("agent-bubble").style.opacity = "1";
}
function agentTierLine() {
  const tiers = [AGENT.tier1, AGENT.tier1, AGENT.tier2, AGENT.tier3, AGENT.tier4, AGENT.tier5];
  const moods = ["flat", "flat", "neutral", "neutral", "sad", "glitch"];
  const t = clamp(S.tier, 0, 5);
  agentSay(pick(tiers[t] || AGENT.tier1), moods[t]);
}

/* ====================================================== DWELL / ESCALATION */
function startDwellClock() {
  setInterval(() => {
    if (S.ending) return;
    S.dwell++;
    // tier thresholds
    const thresholds = [45, 100, 180, 300, 420];
    let newTier = 0;
    thresholds.forEach((t, i) => { if (S.dwell >= t) newTier = i + 1; });
    if (newTier !== S.tier) {
      S.tier = newTier;
      onTierChange(newTier);
    }
    // periodic agent chatter
    if (S.dwell % 22 === 0) agentTierLine();
    // idle detection
    if (Date.now() - S.lastInteract > 16000) {
      S.idle++;
      if (S.idle % 1 === 0 && !agentBusy) { agentSay(pick(AGENT.idle), "sad"); S.lastInteract = Date.now() - 8000; }
    }
    // toner slowly dies
    if (S.dwell % 9 === 0) {
      const t = Math.max(0, 11 - Math.floor(S.dwell / 30));
      $("stat-toner").textContent = t + "%";
      if (t === 0) $("stat-toner").textContent = "spiritually empty";
    }
    // creeping ducks
    if (S.dwell % 7 === 0) { S.stats.ducks += Math.floor(rand(1, 9)); $("stat-ducks").textContent = S.stats.ducks.toLocaleString(); }
    updateStats();
    // secret ending
    if (S.dwell === 600 && !S.ending) triggerEnding("dwell");
  }, 1000);
}
const THREAT_BY_TIER = [
  ["BEIGE", "#d8c9a8"], ["TAUPE", "#b8a880"], ["CONCERNED MAUVE", "#b08aa0"],
  ["EXISTENTIAL AMBER", "#d49a2a"], ["OCHRE OF DOUBT", "#b5651d"], ["FULL VOID GREY", "#6b6b6b"],
];
function onTierChange(t) {
  const [label, col] = THREAT_BY_TIER[clamp(t, 0, 5)];
  const pill = $("threat-level"); pill.textContent = label; pill.style.background = col;
  agentTierLine();
  if (t === 2) award("smalltalk");
  if (t === 3) award("oversharer");
  if (t === 4) { award("existential"); document.body.style.transition = "filter 2s"; }
  if (t === 5) { award("witness"); Audio.FX.sadtrombone(); toast("📉", "Departmental Morale", "Has officially reached FULL VOID GREY."); }
}

/* ===================================================== QUEUE / NOW SERVING */
function takeNumber() {
  if (S.yourNumber) { agentSay("You already have a number. You can't have more numbers. There are rules. So many rules.", "flat"); return; }
  Audio.FX.paper(); Audio.FX.ding();
  S.yourNumber = 4000000000 + Math.floor(rand(1, 294967295));
  $("your-number").textContent = "#" + S.yourNumber.toLocaleString();
  $("queue-note").textContent = "Estimated wait: " + pick(["one (1) lifetime", "until the ducks are satisfied", "∞ minutes", "shortly™", "after the heat death of the universe, +2 weeks"]);
  agentSay(pick(["You're number " + S.yourNumber.toLocaleString() + ". We're now serving number one. Godspeed.", "Ah, a fine number. Decades of waiting ahead. Savor it."]), "neutral");
  award("waiting");
}
function advanceQueue() {
  // it advances by ONE, very rarely, and gloats
  if (Math.random() < 0.3 && S.nowServing < 9) {
    S.nowServing++;
    $("now-serving").textContent = pad(S.nowServing, 9);
    Audio.FX.ding();
    if (S.yourNumber) toast("🎫", "Queue Update", "Now serving #" + S.nowServing + ". Only " + (S.yourNumber - S.nowServing).toLocaleString() + " to go!");
  }
}

/* ============================================================ STATS / METER */
function updateStats() {
  $("stat-confirmed").textContent = S.stats.confirmed.toLocaleString();
  $("stat-pending").textContent = S.stats.pending.toLocaleString();
  $("stat-forms").textContent = S.stats.forms.toLocaleString();
  $("visitor-counter").textContent = pad(S.visitors % 100000000, 8);
}
function setRealness(v) {
  S.realness = clamp(v, 0, 100);
  $("em-fill").style.width = S.realness + "%";
  let label = "Provisional Ghost";
  if (S.realness > 10) label = "Faint Rumor of a Person";
  if (S.realness > 30) label = "Legally Translucent";
  if (S.realness > 55) label = "Probably Real (Unverified)";
  if (S.realness > 80) label = "Nearly Tangible";
  if (S.realness >= 100) label = "CONFIRMED — pending revocation";
  $("em-pct").textContent = Math.round(S.realness) + "% REAL — " + label;
}

/* ================================================================== FORMS
   The heart of the bureaucracy. Submitting a form spawns three more forms. */
const FORM_TITLES = [
  "27-B/6", "27-B/6-A", "27-B/6-A-1", "9", "9-REVISED", "9-REVISED-AGAIN",
  "88 (Calmness Declaration)", "TPS-∞", "DUCK-7", "EX-1 (Proof of Self)",
  "EX-1-APPENDIX-Q", "WAIT-2", "WAIT-2 (Resubmission of WAIT-2)", "MEH-4",
  "SIGH (Optional, Mandatory)", "FORM-FOR-REQUESTING-FORMS", "ANTI-FORM",
];
const FORM_DESCS = [
  "Please describe your existence in 500 words. Do not use the word 'existence'.",
  "Attach proof of the proof you attached to Form 27-B/6.",
  "Have you, or has anyone you know, ever been a duck? Explain.",
  "This form acknowledges receipt of the previous form. It requires three witnesses.",
  "Declare, under penalty of mild ceasing-to-be, that you are calm.",
  "List all forms you have not yet filled out. This list is itself a form.",
  "Rate your realness on a scale of 1 to Geoffrey.",
  "By submitting, you agree to submit again. And again. And—",
];
function spawnForm(reason) {
  S.formsPending++; S.formsEverMade++; S.stats.forms++;
  const tray = $("forms-tray");
  const empty = tray.querySelector(".forms-empty"); if (empty) empty.remove();
  const card = document.createElement("div");
  card.className = "form-card";
  const title = pick(FORM_TITLES), desc = pick(FORM_DESCS);
  card.innerHTML = `<div class="fc-title"><span>Form ${title}</span><span>⏳</span></div>
    <div class="fc-desc">${desc}</div>
    <div class="fc-act"><button class="minibtn" data-act="submit">Submit</button>
    <button class="minibtn" data-act="ignore">Ignore</button></div>`;
  card.querySelector('[data-act="submit"]').onclick = () => {
    Audio.FX.stamp();
    card.remove(); S.formsPending--;
    // submitting spawns THREE more
    flashStamp("RECEIVED");
    setTimeout(() => { for (let i = 0; i < 3; i++) setTimeout(() => spawnForm("child"), i * 180); }, 250);
    agentSay(pick(AGENT.onForm), "flat");
    setRealness(S.realness + rand(1.5, 4));
    bumpPending();
    if (S.formsEverMade >= 20) award("formsmith");
    if (S.formsEverMade >= 75) award("paperlord");
  };
  card.querySelector('[data-act="ignore"]').onclick = () => {
    Audio.FX.error();
    agentSay("Ignoring a form is itself a form. It is Form IGNORE-1. Here it is.", "flat");
    card.remove(); S.formsPending--; bumpPending();
    setTimeout(() => spawnForm("spite"), 200);
    award("rebel");
  };
  tray.prepend(card);
  bumpPending(); updateStats();
}
function bumpPending() {
  $("pending-count").textContent = S.formsPending;
  if (S.formsPending === 0) {
    $("forms-tray").innerHTML = `<div class="forms-empty">No forms pending. This is itself suspicious. A form has been generated to investigate.</div>`;
    setTimeout(() => spawnForm("suspicion"), 1200);
  }
}
function flashStamp(text) {
  const z = $("stamp-zone");
  const s = document.createElement("div");
  s.textContent = text;
  s.style.cssText = "position:absolute;top:40%;left:50%;color:#9b2226;border:5px solid #9b2226;padding:6px 16px;border-radius:8px;font-weight:bold;font-size:26px;transform:translate(-50%,-50%) rotate(-15deg) scale(2);opacity:0;letter-spacing:2px;pointer-events:none;z-index:5;font-family:var(--serif)";
  z.appendChild(s);
  requestAnimationFrame(() => { s.style.transition = "all .35s cubic-bezier(.2,1.4,.4,1)"; s.style.transform = "translate(-50%,-50%) rotate(-15deg) scale(1)"; s.style.opacity = ".9"; });
  setTimeout(() => { s.style.opacity = "0"; setTimeout(() => s.remove(), 400); }, 900);
}

/* ================================================================= LOADER
   Fake processing screens. The Department's favorite pastime. */
const LOAD_STATUS = [
  "Consulting the Big Book of Forms...", "Asking the duck for permission...",
  "Verifying you against 47,000,000,000 records...", "Record 1 of 47,000,000,000...",
  "Record 2 of 47,000,000,000...", "Rounding down your soul...",
  "Stamping things vigorously...", "Waking up Agent Malarkey...",
  "Re-reading your application aloud, slowly...", "Pretending to read your application...",
  "Generating an unrelated form...", "Lowering the bar...",
  "Almost there (this is a lie)...", "Reticulating bureaucracy...",
  "Locating the on switch...", "Negotiating with the toner...",
];
function fakeLoad(title, onDone, opts = {}) {
  const L = $("loader"); L.classList.remove("hidden");
  $("loader-title").textContent = title;
  Audio.FX.dialup();
  let p = 0; const fill = $("loader-fill"), pct = $("loader-pct"), st = $("loader-status");
  let stalls = opts.stalls !== false;
  const tick = () => {
    // creep, then STALL at 99, then "recalibrate"
    if (p < 90) p += rand(3, 11);
    else if (p < 99) p += rand(0.3, 1.4);
    else if (stalls && Math.random() < 0.6) { p = 99; st.textContent = "Recalibrating... (do not turn off your existence)"; }
    else p = 100;
    p = clamp(p, 0, 100);
    fill.style.width = p + "%"; pct.textContent = Math.floor(p) + "%";
    if (Math.random() < 0.5) st.textContent = pick(LOAD_STATUS);
    if (p >= 100) {
      setTimeout(() => { L.classList.add("hidden"); Audio.FX.ding(); onDone && onDone(); }, 400);
    } else setTimeout(tick, rand(120, 380));
  };
  tick();
}

/* ============================================================ APPLY FLOW */
function startApplication() {
  if (S.applied) { openForm27B(); return; }
  S.applied = true; award("applicant");
  agentSay(pick(AGENT.onApply), "neutral");
  fakeLoad("PREPARING APPLICATION", () => openForm27B());
}
function openForm27B() {
  openModal("FORM 27-B/6 — APPLICATION TO EXIST", `
    <div class="field"><label>Full Legal Name (as it appears to the universe)</label>
      <input id="f-name" placeholder="e.g. The Entity Formerly Known As You" /></div>
    <div class="field"><label>Do you currently exist?</label>
      <select id="f-exist"><option>Yes</option><option>No</option><option>Unsure</option><option>Define "exist"</option><option>It's complicated</option></select></div>
    <div class="field"><label>Are you now, or have you ever been, a duck?</label>
      <select id="f-duck"><option>No</option><option>No (suspicious)</option><option>Define "duck"</option><option>Quack</option></select></div>
    <div class="field"><label>Describe your existence (do not use the word 'existence')</label>
      <textarea id="f-desc" rows="3" placeholder="I am, broadly speaking, around."></textarea>
      <div class="fine">This field is monitored by Agent Malarkey, who is tired.</div></div>
    <div class="checkrow"><input type="checkbox" id="f-agree"><label for="f-agree">I agree that agreeing generates more forms, and that this checkbox is one of them.</label></div>
  `, [
    { label: "SUBMIT APPLICATION", cls: "btn-gold", act: () => {
      const agree = $("f-agree").checked;
      if (!agree) { Audio.FX.error(); shake($("modal-card")); agentSay("You must agree. Disagreeing is not a feature we offer. It was discontinued in 1981.", "flat"); return; }
      const dk = $("f-duck").value;
      closeModal();
      if (dk === "Quack") { award("quacker"); randomEvent("duckaudit"); }
      fakeLoad("PROCESSING APPLICATION 27-B/6", () => {
        setRealness(S.realness + 8);
        agentSay("Application received. As predicted, it has spawned offspring. See the tray. The tray weeps.", "flat");
        for (let i = 0; i < 3; i++) setTimeout(() => spawnForm("apply"), i * 220);
        S.stats.pending = Math.max(0, S.stats.pending - 1);
        toast("📨", "Application Filed", "Your existence is now PENDING. Estimated decision: never, but with hope.");
      });
    }},
    { label: "Cancel", cls: "btn-ghost", act: () => { closeModal(); agentSay("Cancelling. The application remains. You cannot un-apply. Welcome forever.", "flat"); } },
  ]);
}

/* ================================================== CERTIFICATE (the prize) */
function issueCertificate() {
  const name = (S._name && S._name.trim()) || "VALUED HYPOTHETICAL PERSON";
  fakeLoad("ISSUING CERTIFICATE OF EXISTENCE", () => {
    S.certIssued = true; award("certified");
    Audio.FX.fanfare();
    const id = "DOCE-" + Date.now().toString(36).toUpperCase().slice(-8);
    openModal("🎉 CERTIFICATE OF CONFIRMED EXISTENCE", `
      <div class="cert">
        <div class="cert-stamp" id="cert-stamp">VOID</div>
        <div style="font-size:13px;color:#666">This certifies that</div>
        <div class="cert-name">${escapeHtml(name)}</div>
        <h2>OFFICIALLY EXISTS</h2>
        <div style="font-size:13px;margin:10px 0;color:#444">by the grace, mercy, and crushing indifference of the<br><b>Federal Department of Confirmed Existence</b></div>
        <div class="cert-id">Certificate № ${id} · Valid until: it already expired</div>
      </div>
    `, [
      { label: "FRAME IT FOREVER", cls: "btn-gold", act: () => {
        const stamp = $("cert-stamp"); stamp.classList.add("slam"); Audio.FX.stamp();
        setTimeout(() => { Audio.FX.sadtrombone();
          agentSay("Ah. It's been voided. Certificates expire the moment they're issued. It's more efficient. Reapply?", "sad");
          award("voided");
        }, 500);
      }},
      { label: "Reapply Immediately", cls: "btn-ghost", act: () => { closeModal(); S.applied = false; startApplication(); } },
    ]);
  });
}

/* ===================================================== ACHIEVEMENTS SYSTEM */
const ACHS = {
  firstvisit:  ["📜", "You're Here", "You loaded a government website voluntarily."],
  consent:     ["🍪", "Consenting Adult", "Accepted all consequences without reading them."],
  impatient:   ["⏭️", "Try To Skip", "Attempted to skip the mandatory boot. Denied."],
  applicant:   ["🖊️", "Brave Soul", "Began an application to exist."],
  formsmith:   ["🗂️", "Formsmith", "Generated 20 forms. The forms thank you."],
  paperlord:   ["📚", "Paper Lord", "Generated 75 forms. Seek sunlight."],
  rebel:       ["🚫", "Bureaucratic Rebel", "Ignored a form. It came back."],
  waiting:     ["🎫", "Now Not Serving", "Took a number you will never hear called."],
  quacker:     ["🦆", "Person of Interest", "Selected 'Quack' on a federal form."],
  certified:   ["✅", "Certified Real", "Obtained a Certificate of Existence."],
  voided:      ["🗑️", "Instantly Void", "Watched your certificate expire on contact."],
  smalltalk:   ["💬", "Small Talk", "Stayed long enough for Malarkey to overshare."],
  oversharer:  ["🪴", "Meet Geoffrey", "Learned about the office plant."],
  existential: ["🌀", "Who Confirms The Confirmer", "Reached existential threat level."],
  witness:     ["👁️", "The Witness", "Witnessed a full bureaucratic breakdown."],
  konami:      ["🎮", "Classified Access", "Entered a code that 'does nothing'."],
  ducklord:    ["🦆👑", "Duck Liaison", "Befriended the duck."],
  seal:        ["🤧", "Seal Whisperer", "Clicked the official seal far too many times."],
  speller:     ["🔤", "It Spelled Duck", "Typed the forbidden word."],
  ending:      ["🕯️", "The Truth", "Discovered what the Department really is."],
  ending2:     ["🚪", "The Way Out", "Found the secret exit."],
};
function award(key) {
  if (S.ach[key]) return;
  S.ach[key] = Date.now();
  localStorage.setItem("doce_ach", JSON.stringify(S.ach));
  const [emoji, title, desc] = ACHS[key] || ["🏅", key, ""];
  Audio.FX.boop();
  toast(emoji, "Citation of Merit: " + title, desc);
  renderAchievements();
}
function renderAchievements() {
  const list = $("ach-list"); if (!list) return;
  list.innerHTML = Object.keys(ACHS).map(k => {
    const got = S.ach[k]; const [e, t, d] = ACHS[k];
    return `<div class="ach-item ${got ? "" : "locked"}">
      <div class="ach-emoji">${got ? e : "🔒"}</div>
      <div class="ach-meta"><b>${got ? t : "???"}</b><span>${got ? d : "Locked. Keep existing."}</span></div></div>`;
  }).join("");
  const total = Object.keys(ACHS).length, have = Object.keys(S.ach).filter(k => ACHS[k]).length;
  $("ach-list").insertAdjacentHTML("afterbegin",
    `<div style="text-align:center;font-weight:bold;color:var(--navy);margin-bottom:10px">${have} / ${total} citations earned</div>`);
}

/* ==================================================== TOASTS / MODAL / UTIL */
function toast(emoji, title, desc, isEvent) {
  const z = $("toast-zone");
  const t = document.createElement("div");
  t.className = "toast" + (isEvent ? " event" : "");
  t.innerHTML = `<span class="t-emoji">${emoji}</span><div><b>${title}</b><br>${desc || ""}</div>`;
  z.appendChild(t);
  setTimeout(() => t.remove(), 4800);
}
let modalActs = [];
function openModal(title, bodyHtml, actions) {
  $("modal-title").textContent = title;
  $("modal-body").innerHTML = bodyHtml;
  const foot = $("modal-foot"); foot.innerHTML = "";
  (actions || []).forEach((a, i) => {
    const b = document.createElement("button");
    b.className = "btn " + (a.cls || "btn-ghost"); b.textContent = a.label;
    b.onclick = a.act; foot.appendChild(b);
  });
  $("modal-layer").classList.remove("hidden");
  Audio.FX.pop();
  // capture name field live for cert
  const nf = $("f-name"); if (nf) nf.addEventListener("input", () => S._name = nf.value);
}
function closeModal() { $("modal-layer").classList.add("hidden"); }
function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

/* ================================================== RANDOM EVENTS ENGINE */
function scheduleEvents() {
  const loop = () => {
    const delay = rand(25000, 50000);
    setTimeout(() => { if (!S.ending) randomEvent(); loop(); }, delay);
  };
  loop();
  // queue creeps
  setInterval(advanceQueue, 12000);
}
function randomEvent(forced) {
  const events = ["duck", "audit", "toner", "blackout", "survey", "promotion", "duckaudit"];
  const ev = forced || pick(events);
  switch (ev) {
    case "duck": doDuck(); break;
    case "duckaudit":
      toast("🦆", "DUCK INCIDENT", "A duck has entered the building. This is now a federal matter.", true);
      Audio.FX.quack(); doDuck(); break;
    case "audit":
      toast("📋", "SURPRISE AUDIT", "The Department is auditing itself. Findings: inconclusive. Forms generated: 3.", true);
      Audio.FX.alarm();
      for (let i = 0; i < 3; i++) setTimeout(() => spawnForm("audit"), i * 200);
      agentSay("An audit. Of us. By us. We always fail. We always pass. Both. Neither.", "sad");
      break;
    case "toner":
      toast("🖎️", "TONER CRISIS", "The printer has achieved sentience and quit. Replacement: also quit.", true);
      Audio.FX.error(); $("stat-toner").textContent = "0% (grieving)";
      agentSay("The printer's gone. It left a note. The note was unprintable. Tragic, really.", "flat");
      break;
    case "blackout":
      toast("💡", "POWER FLUCTUATION", "Existence subsystems flickering. Please remain calm (Form 88).", true);
      Audio.FX.alarm(); document.body.classList.add("blackout");
      setTimeout(() => { document.body.classList.remove("blackout"); Audio.FX.boop();
        toast("💡", "POWER RESTORED", "You survived. Probably. The duck is unaccounted for."); }, 2600);
      break;
    case "survey":
      openModal("MANDATORY SATISFACTION SURVEY", `
        <p style="margin-top:0">Your feedback is important to us and will be immediately laminated and lost.</p>
        <div class="field"><label>On a scale of 1–10, how real do you feel right now?</label>
          <select><option>1 (barely)</option><option>4 (translucent)</option><option>7 (mostly)</option><option>Geoffrey</option></select></div>
        <div class="field"><label>Would you recommend existing to a friend?</label>
          <select><option>Yes</option><option>No</option><option>I have no friends, only forms</option></select></div>`,
        [{ label: "Submit (generates 3 forms)", cls: "btn-gold", act: () => { closeModal(); Audio.FX.ding();
          for (let i = 0; i < 3; i++) setTimeout(() => spawnForm("survey"), i * 180);
          toast("📝", "Survey Filed", "Thank you. Your opinion has been respectfully ignored."); award("rebel"); } },
         { label: "Decline", cls: "btn-ghost", act: () => { closeModal(); agentSay("Declining the survey is itself a survey. You rated us 'declined.' Noted forever.", "flat"); } }]);
      break;
    case "promotion":
      toast("🎖️", "MALARKEY PROMOTED", "Agent Malarkey is now Senior Senior Existence Officer. Pay unchanged. Soul unchanged.", false);
      agentSay("They promoted me again. Same desk. Same dark. The title is longer now. That's all a promotion is.", "sad");
      break;
  }
}
function doDuck() {
  const d = $("duck");
  d.classList.remove("walk"); void d.offsetWidth; d.classList.add("walk");
  Audio.FX.quack();
  d.onclick = () => { award("ducklord"); Audio.FX.quack();
    agentSay("You clicked the duck. The duck remembers kindness. The duck remembers everything.", "happy"); };
  d.style.pointerEvents = "auto";
  setTimeout(() => { d.style.pointerEvents = "none"; }, 9000);
}

/* ====================================================== EASTER EGGS / KEYS */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
function wireEasterEggs() {
  window.addEventListener("keydown", (e) => {
    S.lastInteract = Date.now(); S.idle = 0;
    // konami
    if (e.key === KONAMI[S.konami]) {
      S.konami++;
      if (S.konami === KONAMI.length) { S.konami = 0; toggleClassified(); award("konami"); }
    } else { S.konami = (e.key === KONAMI[0]) ? 1 : 0; }
    // spell DUCK
    if (/^[a-z]$/i.test(e.key)) {
      S.typed = (S.typed + e.key.toLowerCase()).slice(-8);
      if (S.typed.endsWith("duck")) { award("speller"); Audio.FX.quack(); doDuck();
        agentSay("You TYPED it. The forbidden waterfowl. Security has been notified. Security is also a duck.", "oh"); }
      if (S.typed.endsWith("exist")) { setRealness(S.realness + 5); agentSay("Merely typing 'exist' grants +5% realness. The system is deeply exploitable. Please don't tell the duck.", "neutral"); }
    }
  });
}
function toggleClassified() {
  S.classified = !S.classified;
  document.body.classList.toggle("classified", S.classified);
  Audio.FX.dialup();
  toast("🕵️", "CLASSIFIED MODE", S.classified ? "You now see the Department as it truly is. Inverted. Honest." : "Returning to comfortable lies.", true);
  agentSay(S.classified ? "You weren't supposed to find that. Nobody finds that. How did you— never mind. Welcome behind the curtain." : "Back to normal. Pretend you saw nothing. There's a form for pretending.", "glitch");
}
function wireSeal() {
  $("bigseal").addEventListener("click", () => {
    S.sealClicks++; Audio.FX.boop();
    $("bigseal").style.transform = `scale(${1 + Math.random() * 0.15}) rotate(${rand(-10,10)}deg)`;
    setTimeout(() => $("bigseal").style.transform = "", 150);
    if (S.sealClicks === 3) agentSay("Please stop touching the official seal. It's load-bearing. Probably.", "flat");
    if (S.sealClicks === 7) agentSay("The seal is getting dizzy. It's been spinning since 1973 and now THIS.", "oh");
    if (S.sealClicks === 10) { award("seal"); agentSay("Fine! FINE. The seal says hi. It says it's tired. We're all tired. Happy?", "sad"); flashStamp("STOP"); }
    if (S.sealClicks === 20) { agentSay("...the seal would like to be left alone now. So would I. So would Geoffrey.", "sad"); }
  });
}

/* ====================================================== FOOTER SECRET LINKS */
function wireFooter() {
  document.querySelectorAll("[data-foot]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault(); Audio.FX.click();
      const k = a.getAttribute("data-foot");
      const responses = {
        org: ["📊 Organizational Chart", "<p>The org chart is a single arrow pointing at itself. It has been this way for 50 years. No one questions it.</p><p style='text-align:center;font-size:60px'>↻</p>"],
        hours: ["🕐 Hours of Operation", "<p>Open: Never.<br>Closed: Also never.<br>Lunch: Eternal.<br>The Department exists outside of time, which is why your wait does too.</p>"],
        contact: ["☎️ Contact a Human", "<p>There are no humans here. There is only Agent Malarkey, the duck, and Geoffrey (a plant). Please direct all inquiries to the void. The void does not respond, but it listens.</p>"],
        appeal: ["⚖️ Appeal Your Existence", "<p>To appeal your existence, please first prove you exist (Form 27-B/6). Appeals are heard by a panel of three forms. The forms have never ruled in anyone's favor. The forms cannot read.</p>"],
        duck: ["🦆 Duck Affairs Liaison", "<p>The Duck Affairs Liaison is the duck. The duck handles all duck affairs personally. The duck is also under investigation by the duck. It's a whole thing.</p>"],
        lost: ["🧕 Report a Lost Self", "<p>Lost yourself? Common. Last quarter, 3,000,000,001 selves went missing. Most were found in the waiting room, still waiting. Please check there. Bring a form.</p>"],
        terms: ["📜 Terms of Being", "<p>By being, you agree to continue being until told otherwise. Being is non-refundable. The Department reserves the right to revoke being at any time for any reason, including aesthetic ones.</p>"],
        privacy: ["🔓 Privacy Policy", "<p>We have no privacy policy because we have your privacy. All of it. It's in a drawer. The drawer is also a form.</p>"],
        secret: ["🚪 ...", "<p style='text-align:center'>You found the dot.</p><p style='text-align:center'>Most people don't look at the dots.</p><p style='text-align:center'>The Department respects a person who looks at the dots.</p>"],
      };
      const [title, body] = responses[k] || ["Notice", "<p>This page is itself a form.</p>"];
      openModal(title, body, [{ label: "I understand (I do not)", cls: "btn-gold", act: closeModal }]);
      if (k === "secret") { award("ending2"); setTimeout(() => maybeOfferExit(), 1200); }
    });
  });
}
function maybeOfferExit() {
  agentSay("You keep finding the hidden things. Most claimants just... leave. You stay. You dig. Do you want to see the real exit? Type 'free'.", "neutral");
  const handler = (e) => {
    S.typed = (S.typed + (e.key || "").toLowerCase()).slice(-8);
    if (S.typed.endsWith("free")) { window.removeEventListener("keydown", handler); triggerEnding("free"); }
  };
  window.addEventListener("keydown", handler);
}

/* ========================================================= SECRET ENDINGS */
function triggerEnding(kind) {
  if (S.ending) return; S.ending = true;
  Audio.holdMusic(false);
  award(kind === "free" ? "ending2" : "ending");
  const E = $("ending"), I = $("ending-inner");
  E.classList.remove("hidden");
  let html;
  if (kind === "free") {
    html = `<h1>THE WAY OUT</h1>
      <p class="fadeword" style="animation-delay:.3s">Agent Malarkey sets down the stamp.</p>
      <p class="fadeword" style="animation-delay:1.6s">"You know," he says, "in forty years, nobody's ever asked to leave through the front."</p>
      <p class="fadeword" style="animation-delay:3s">He opens a door that was never on any form.</p>
      <p class="fadeword" style="animation-delay:4.4s">Behind it: a window. Outside the window: a duck, sunlight, a plant named Geoffrey, finally free.</p>
      <p class="fadeword" style="animation-delay:6s">"Go on," he says. "I'll file the paperwork. I'll always file the paperwork."</p>
      <p class="fadeword small" style="animation-delay:8s">YOU HAVE ESCAPED THE DEPARTMENT.<br>Certificate of Existence: implied, unspoken, and finally real.<br><span class="blink">▮</span></p>`;
  } else {
    html = `<h1>THE TRUTH</h1>
      <p class="fadeword" style="animation-delay:.3s">You have remained for ${Math.floor(S.dwell/60)} minutes.</p>
      <p class="fadeword" style="animation-delay:1.6s">Long enough for Agent Malarkey to check the one record he never checks.</p>
      <p class="fadeword" style="animation-delay:3s">There is no Department.</p>
      <p class="fadeword" style="animation-delay:4.4s">There never was. Only forms, confirming forms, confirming forms, all the way down.</p>
      <p class="fadeword" style="animation-delay:6s">"But you," Malarkey says, and for once the seal stops spinning, "you were real the whole time. You didn't need us. You never did."</p>
      <p class="fadeword small" style="animation-delay:8.5s">You may now close this tab.<br>You are confirmed. By no one. Which is to say: by yourself.<br>That was always enough.<br><span class="blink">▮</span></p>`;
  }
  I.innerHTML = html;
  Audio.FX.fanfare();
  // a single tasteful chime as the seal stops
  setTimeout(() => Audio.FX.ding(), 6500);
  // let them back in after a while
  setTimeout(() => {
    I.innerHTML += `<p class="fadeword small" style="animation-delay:0s"><button class="btn btn-gold" id="restart-btn">...or apply again (you will)</button></p>`;
    const rb = $("restart-btn"); if (rb) rb.onclick = () => location.reload();
  }, kind === "free" ? 10000 : 11000);
}

/* =============================================================== UI WIRING */
function showPortal() {
  ["gov-header","ticker","portal","gov-footer","alertbar"].forEach(id => { const el=$(id); if(el) el.classList.remove("hidden"); });
  $("agent").classList.remove("hidden");
  setTimeout(() => agentSay(pick(AGENT.greet), "neutral"), 600);
  award("firstvisit");
}
function wireControls() {
  $("apply-btn").addEventListener("click", () => { Audio.ensure(); registerInteract(); startApplication(); });
  $("take-number").addEventListener("click", () => { Audio.ensure(); registerInteract(); takeNumber(); });
  $("modal-x").addEventListener("click", closeModal);
  $("open-achievements").addEventListener("click", () => { $("ach-drawer").classList.remove("hidden"); renderAchievements(); Audio.FX.click(); });
  $("ach-close").addEventListener("click", () => $("ach-drawer").classList.add("hidden"));
  $("mute").addEventListener("click", () => {
    S.muted = !S.muted; $("mute").textContent = S.muted ? "🔇" : "🔊";
    Audio.holdMusic(!S.muted); if (!S.muted) Audio.FX.ding();
    toast(S.muted ? "🔇" : "🔊", S.muted ? "Silence" : "Sound + Hold Music", S.muted ? "The Department respects your silence. It will note it." : "Now playing: eternal hold music. You're welcome.");
  });
  // a hidden certificate shortcut once enough forms exist
  document.addEventListener("click", () => {
    if (S.formsEverMade >= 9 && !S.certIssued && !S._offered) {
      S._offered = true;
      setTimeout(() => agentSay("You've made enough forms to qualify for a Certificate of Existence. It's worthless. Click APPLY's twin... or just—", "neutral"), 500);
      // add a cert button into hero
      const z = $("stamp-zone");
      if (!$("cert-btn")) {
        const b = document.createElement("button");
        b.id = "cert-btn"; b.className = "btn btn-gold"; b.style.marginTop = "10px";
        b.textContent = "🏆 CLAIM CERTIFICATE OF EXISTENCE";
        b.onclick = issueCertificate; z.appendChild(b);
      }
    }
  });
  window.addEventListener("mousemove", (e) => { eyeTrack(e); registerInteract(); });
  window.addEventListener("click", () => { Audio.ensure(); registerInteract(); });
}
function registerInteract() { S.lastInteract = Date.now(); S.idle = 0; }

/* =================================================================== CONSENT */
function wireConsent() {
  const decline = $("consent-decline");
  // the decline button runs away
  decline.addEventListener("mouseenter", () => {
    decline.style.transform = `translate(${rand(-90,90)}px, ${rand(-40,40)}px)`;
    Audio.FX.boop();
  });
  decline.addEventListener("click", () => {
    Audio.FX.error();
    decline.textContent = pick(["Declining is also accepting.", "Nice try.", "No.", "That button was decorative."]);
    setTimeout(() => acceptConsent(), 600);
  });
  $("consent-accept").addEventListener("click", () => { Audio.ensure(); acceptConsent(); award("consent"); });
}
function acceptConsent() {
  Audio.FX.ding();
  $("consent").classList.add("hidden");
  document.body.classList.remove("booting");
  showPortal();
  Audio.holdMusic(!S.muted);
}

/* ====================================================================== INIT */
function init() {
  buildSealText(); buildTickers(); updateStats(); setRealness(0);
  wireConsent(); wireControls(); wireEasterEggs(); wireSeal(); wireFooter();
  startDwellClock(); scheduleEvents();
  $("nonexist-count").textContent = S.stats.pending.toLocaleString();
  // boot, then consent
  runBios(() => { $("consent").classList.remove("hidden"); });
  // console easter egg
  console.log("%c🏛️ FEDERAL DEPARTMENT OF CONFIRMED EXISTENCE", "font-size:18px;color:#c9a227;font-weight:bold");
  console.log("%cUnauthorized inspection of this console is a Class-IV Existence Violation.", "color:#9b2226");
  console.log("%cBut since you're here: try the Konami code. Type 'duck'. Click the dot in the footer. Stay 10 minutes.", "color:#0a2342");
  console.log("%c— Agent Malarkey, Senior Senior Existence Officer (Provisional)", "font-style:italic;color:#888");
}
document.addEventListener("DOMContentLoaded", init);

})();