// Generates the KiddoFizz Cola design-canvas artboards (.dc.html) + canvas.json.
// Run:  node build_artboards.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));

// --- palette -----------------------------------------------------------------
const INK = "#1B1614";      // warm near-black
const INK2 = "#5A514C";
const INK3 = "#7C7069";   // darkened to clear 4.5:1 on paper
const PAPER = "#FDFBF7";    // warm white, chroma well under 0.02
const PAPER2 = "#F4EEE5";
const LINE = "#E5DCD0";
const RED = "#DE2C24";      // reserved: wordmark, primary CTA, flavour beat (4.7:1 with white)
const YEL = "#FFC72C";
const CYAN = "#14BEE1";
const BLUE = "#1B6FE0";
const GREEN = "#37B34A";

// Readable partners for each accent. The bright brand colours are fine as fills but
// fail contrast as text/icons, so anything small and meaningful uses the dark variant,
// and text sitting ON an accent uses ink unless the accent is dark enough for white.
const ACCENT_DARK = { "#14BEE1": "#0A7E99", "#FFC72C": "#96690A", "#37B34A": "#1F6E2C", "#DE2C24": "#DE2C24", "#1B6FE0": "#1B6FE0" };
const dark = (a) => ACCENT_DARK[a] || a;
const onAccent = (a) => (a === "#DE2C24" || a === "#1B6FE0" ? "#FFFFFF" : "#1B1614");

const BODY_PATH =
  "M74 64v34c0 22-34 36-40 82-4 34-4 58-4 90v138c0 30 16 46 44 48h52" +
  "c28-2 44-18 44-48V270c0-32 0-56-4-90-6-46-40-60-40-82V64z";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700" +
  "&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

function R(s, vars = {}) {
  for (const [k, v] of Object.entries(vars)) s = s.split("__" + k + "__").join(String(v));
  return s;
}

// --- the bottle --------------------------------------------------------------
function bottle(accent = CYAN, claim = "CAFFEINE FREE", height = 490) {
  const w = Math.round((200 * height) / 490);
  return R(
    `<svg viewBox="0 0 200 490" width="__W__" height="__H__" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="KiddoFizz Cola 250ml bottle">
<defs>
<linearGradient id="lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4571F"/><stop offset="1" stop-color="#752B11"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".50"/><stop offset=".26" stop-color="#ffffff" stop-opacity=".04"/><stop offset=".70" stop-color="#000000" stop-opacity=".05"/><stop offset="1" stop-color="#000000" stop-opacity=".18"/></linearGradient>
<clipPath id="bd"><path d="__P__"/></clipPath>
</defs>
<ellipse cx="100" cy="466" rx="70" ry="13" fill="#1B1614" opacity=".12"/>
<g clip-path="url(#bd)">
  <rect x="18" y="58" width="164" height="400" fill="url(#lq)"/>
  <circle cx="64" cy="200" r="4.5" fill="#ffffff" opacity=".26"/>
  <circle cx="132" cy="238" r="3" fill="#ffffff" opacity=".22"/>
  <circle cx="88" cy="164" r="2.5" fill="#ffffff" opacity=".30"/>
  <circle cx="118" cy="438" r="3.5" fill="#ffffff" opacity=".18"/>
  <circle cx="56" cy="430" r="2.5" fill="#ffffff" opacity=".20"/>
  <rect x="18" y="258" width="164" height="142" fill="__A__"/>
  <path d="M18 258h164v10c-28 8-56 2-84 8s-52 4-80-4z" fill="#ffffff" opacity=".22"/>
  <rect x="27" y="268" width="146" height="60" rx="13" fill="#ffffff"/>
  <text x="100" y="299" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="25" font-weight="700" letter-spacing="-.5"><tspan fill="__RE__">Kiddo</tspan><tspan fill="__BL__">Fizz</tspan></text>
  <text x="100" y="317" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="800" fill="__IN__" letter-spacing="4.5">COLA</text>
  <rect x="44" y="340" width="112" height="21" rx="10.5" fill="#ffffff"/>
  <text x="100" y="354.5" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="__IN__" letter-spacing=".9">__C__</text>
  <text x="100" y="384" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="__OA__" letter-spacing=".6">250ml e</text>
  <rect x="18" y="58" width="164" height="400" fill="url(#gl)"/>
</g>
<path d="__P__" fill="none" stroke="#1B1614" stroke-opacity=".20" stroke-width="2.5"/>
<rect x="66" y="14" width="68" height="48" rx="9" fill="__A__"/>
<g stroke="#1B1614" stroke-opacity=".16" stroke-width="2"><path d="M79 18v40"/><path d="M92 18v40"/><path d="M105 18v40"/><path d="M118 18v40"/></g>
<rect x="66" y="14" width="68" height="48" rx="9" fill="url(#gl)" opacity=".55"/>
<rect x="66" y="14" width="68" height="48" rx="9" fill="none" stroke="#1B1614" stroke-opacity=".18" stroke-width="2"/>
</svg>`,
    { W: w, H: height, P: BODY_PATH, A: accent, C: claim,
      RE: RED, BL: BLUE, IN: INK, OA: onAccent(accent) }
  );
}

// --- shared chrome -----------------------------------------------------------
function wordmark(size = 26, reversed = false) {
  return R(
    `<div style="display:flex;align-items:flex-start;font-family:Fredoka, sans-serif;font-weight:700;font-size:__S__px;line-height:1;letter-spacing:-.025em;"><span style="color:__K__">Kiddo</span><span style="color:__F__">Fizz</span><span style="display:inline-block;width:__D__px;height:__D__px;border-radius:50%;background:#FFC72C;margin-left:__M__px;margin-top:__T__px;"></span></div>`,
    {
      S: size,
      K: reversed ? "#FFFFFF" : RED,
      F: reversed ? "#FFC72C" : BLUE,
      D: (size * 0.22).toFixed(1),
      M: (size * 0.14).toFixed(1),
      T: (size * 0.05).toFixed(1),
    }
  );
}

const TICK =
  '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
  'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 6.5 11.5 3 8"/></svg>';

function nav(active = "Our drink") {
  let links = "";
  for (const it of ["Our drink", "What&#39;s inside", "For families", "Where to buy"]) {
    links += R(
      `<a href="#" style="text-decoration:none;color:__C__;font-size:15px;font-weight:__W__;">__T__</a>`,
      { C: it === active ? INK : INK2, W: it === active ? "700" : "600", T: it }
    );
  }
  return R(
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:26px 56px;">
  __WM__
  <div style="display:flex;align-items:center;gap:30px;">
    __L__
    <a href="#" style="text-decoration:none;background:__RED__;color:#fff;font-size:14.5px;font-weight:700;padding:12px 22px;border-radius:999px;box-shadow:0 4px 14px rgba(222,44,36,.28);">Find a stockist</a>
  </div>
</div>`,
    { WM: wordmark(26), L: links, RED: RED }
  );
}

function kicker(text, accent) {
  return R(
    `<div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px 7px 11px;border-radius:999px;background:__A__1F;color:__D__;font-size:12.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;">
<span style="width:8px;height:8px;border-radius:50%;background:__A__;"></span>__T__</div>`,
    { A: accent, D: INK, T: text }
  );
}

function page(body, w, h) {
  return R(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="__F__">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif; color: __INK__; -webkit-font-smoothing: antialiased; }
    h1, h2, h3 { font-family: Fredoka, 'Plus Jakarta Sans', sans-serif; margin: 0; text-wrap: pretty; letter-spacing: -.02em; }
    p { margin: 0; text-wrap: pretty; }
    a { color: __BLUE__; } a:hover { color: #14549E; }
  </style>
</helmet>
__B__
</x-dc>
<script data-dc-script data-props='{"$preview":{"width":__W__,"height":__H__}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`,
    { F: FONTS, INK: INK, BLUE: BLUE, B: body, W: w, H: h }
  );
}

// --- 01 hero -----------------------------------------------------------------
function hero() {
  let trust = "";
  for (const t of ["Caffeine free", "Aspartame free", "Low calorie", "Vitamins B3, B5, B6 &amp; C"]) {
    trust += R(
      `<div style="display:flex;align-items:center;gap:7px;color:__C__;font-size:13.5px;font-weight:600;"><span style="color:__G__;display:flex;">__K__</span>__T__</div>`,
      { C: INK2, G: dark(GREEN), K: TICK, T: t }
    );
  }
  let bubbles = "";
  for (const [x, y, r, o] of [[64, 300, 11, .30], [150, 190, 7, .38], [96, 96, 16, .22],
                              [196, 320, 9, .28], [40, 150, 6, .34], [176, 92, 5, .30],
                              [128, 400, 6, .24]]) {
    bubbles += R(
      `<div style="position:absolute;left:__X__px;top:__Y__px;width:__D__px;height:__D__px;border-radius:50%;border:2px solid __C__;opacity:__O__;"></div>`,
      { X: x, Y: y, D: r * 2, C: CYAN, O: o }
    );
  }
  return R(
    `<div style="width:1280px;height:800px;position:relative;overflow:hidden;background:__P__;">
  <div style="position:absolute;inset:0;background:radial-gradient(760px 620px at 74% 42%, __CY__26 0%, __CY__00 68%);"></div>
  <div style="position:absolute;left:-140px;top:-190px;width:520px;height:520px;border-radius:50%;background:__YE__1A;"></div>
  __NAV__
  <div style="position:relative;display:grid;grid-template-columns:1.06fr .94fr;align-items:center;gap:24px;padding:0 56px;height:678px;">
    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:26px;max-width:600px;">
      __KICK__
      <h1 style="font-size:78px;line-height:.96;font-weight:700;">Big fizz.<br><span style="color:__CY__;">Zero caffeine.</span></h1>
      <p style="font-size:19.5px;line-height:1.5;color:__I2__;max-width:490px;">A bubblegum cola made for kids, with a label parents can actually read. 250ml, low calorie, and nothing in it you would need to look up.</p>
      <div style="display:flex;align-items:center;gap:14px;">
        <a href="#" style="text-decoration:none;background:__RE__;color:#fff;font-size:16px;font-weight:700;padding:17px 32px;border-radius:999px;box-shadow:0 8px 22px rgba(222,44,36,.30);">Find a stockist</a>
        <a href="#" style="text-decoration:none;color:__IN__;font-size:16px;font-weight:700;padding:17px 28px;border-radius:999px;border:2px solid __LN__;">See what&#39;s inside</a>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:11px 24px;padding-top:6px;">__TR__</div>
    </div>
    <div style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:420px;height:420px;border-radius:50%;background:__CY__24;"></div>
      <div style="position:absolute;width:520px;height:520px;border-radius:50%;border:2px dashed __CY__59;"></div>
      __BUB__
      <div style="position:relative;">__BOT__</div>
    </div>
  </div>
  <div style="position:absolute;left:56px;bottom:26px;display:flex;align-items:center;gap:10px;color:__I3__;font-size:12.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;">
    <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="__I3__" stroke-width="2" stroke-linecap="round"><rect x="1" y="1" width="14" height="22" rx="7"/><path d="M8 6v4"/></svg>
    Scroll to see inside
  </div>
</div>`,
    { P: PAPER, CY: CYAN, YE: YEL, NAV: nav(), KICK: kicker("New in the UK", CYAN),
      I2: INK2, I3: INK3, IN: INK, RE: RED, LN: LINE, TR: trust, BUB: bubbles,
      BOT: bottle(CYAN, "CAFFEINE FREE", 540) }
  );
}

// --- 02-05 the pinned sequence ----------------------------------------------
function specBar(n, deg, accent) {
  return R(
    `<div style="display:flex;align-items:center;gap:11px;height:38px;padding:0 22px;background:__IN__;color:__P__;font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
<span style="width:8px;height:8px;border-radius:50%;background:__A__;flex:none;"></span>Pinned section &#183; Beat __N__ of 4 &#183; Bottle at __D__&#176;
<span style="margin-left:auto;opacity:.5;font-weight:600;letter-spacing:.03em;text-transform:none;font-size:12px;">Storyboard frame &#8212; one scroll section, four states</span>
</div>`,
    { IN: INK, P: PAPER, A: accent, N: n, D: deg }
  );
}

function dots(active, accent) {
  let out = "";
  for (let i = 1; i <= 4; i++) {
    out += i === active
      ? R(`<span style="width:30px;height:8px;border-radius:99px;background:__A__;"></span>`, { A: accent })
      : R(`<span style="width:8px;height:8px;border-radius:99px;background:__L__;"></span>`, { L: LINE });
  }
  return `<div style="display:flex;align-items:center;gap:7px;">${out}</div>`;
}

function orbit(n, accent) {
  if (n !== 2) return "";
  let out = "";
  for (const [lbl, x, y] of [["B3", 8, 88], ["B5", 402, 148], ["B6", 26, 362], ["C", 396, 404]]) {
    out += R(
      `<div style="position:absolute;left:__X__px;top:__Y__px;width:64px;height:64px;border-radius:50%;background:#fff;border:2.5px solid __A__;display:flex;align-items:center;justify-content:center;font-family:Fredoka, sans-serif;font-weight:700;font-size:21px;color:__IN__;box-shadow:0 6px 18px rgba(27,22,20,.11);">__L__</div>`,
      { X: x, Y: y, A: accent, IN: INK, L: lbl }
    );
  }
  return out;
}

function claimBox(items, accent) {
  let out = "";
  for (const t of items) {
    out += R(
      `<div style="display:flex;gap:9px;align-items:flex-start;color:__I2__;font-size:13.5px;line-height:1.45;"><span style="color:__A__;display:flex;padding-top:1px;flex:none;">__K__</span><span>__T__</span></div>`,
      { I2: INK2, A: dark(accent), K: TICK, T: t }
    );
  }
  return R(
    `<div style="display:flex;flex-direction:column;gap:9px;padding:16px 18px;border-radius:14px;background:__A__14;border:1px solid __A__2E;max-width:460px;">__O__</div>`,
    { A: accent, O: out }
  );
}

function chip(text, accent) {
  return R(
    `<div style="display:inline-flex;align-items:center;gap:9px;padding:12px 19px;border-radius:12px;background:__A__14;border:1px solid __A__2E;color:__IN__;font-size:14.5px;font-weight:700;"><span style="color:__AD__;display:flex;">__K__</span>__T__</div>`,
    { A: accent, AD: dark(accent), IN: INK, K: TICK, T: text }
  );
}

function beat({ n, deg, accent, kick, head, body, extra = "", flip = false, claim }) {
  const copy = R(
    `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:22px;max-width:480px;">
  __K__
  <h2 style="font-size:56px;line-height:1.02;font-weight:700;">__H__</h2>
  <p style="font-size:19px;line-height:1.55;color:__I2__;">__B__</p>
  __E__
  <div style="padding-top:8px;">__D__</div>
</div>`,
    { K: kicker(kick, accent), H: head, B: body, I2: INK2, E: extra, D: dots(n, accent) }
  );
  const stage = R(
    `<div style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;width:470px;height:470px;border-radius:50%;background:__A__26;"></div>
  <div style="position:absolute;width:566px;height:566px;border-radius:50%;border:2px dashed __A__4D;"></div>
  __O__
  <div style="position:relative;">__BOT__</div>
</div>`,
    { A: accent, O: orbit(n, accent), BOT: bottle(accent, claim, 520) }
  );
  return R(
    `<div style="width:1280px;height:800px;position:relative;overflow:hidden;background:__P__;display:flex;flex-direction:column;">
  __SB__
  <div style="flex:1;position:relative;display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));align-items:center;gap:40px;padding:0 66px;">
    <div style="position:absolute;__SIDE__:-170px;top:-120px;width:560px;height:560px;border-radius:50%;background:__A__12;"></div>
    __C__
  </div>
</div>`,
    { P: PAPER, SB: specBar(n, deg, accent), A: accent, C: flip ? stage + copy : copy + stage,
      SIDE: flip ? "left" : "right" }
  );
}

// --- 06 label and nutrition --------------------------------------------------
function nutrition() {
  const rows = [["Energy", 0], ["Fat", 0], ["&#8212; of which saturates", 1],
                ["Carbohydrate", 0], ["&#8212; of which sugars", 1], ["Protein", 0],
                ["Salt", 0], ["Niacin (B3)", 0], ["Pantothenic acid (B5)", 0],
                ["Vitamin B6", 0], ["Vitamin C", 0]];
  let tbody = "";
  rows.forEach(([nm, indented], i) => {
    tbody += R(
      `<div style="display:grid;grid-template-columns:1.7fr 1fr 1fr;background:__BG__;border-bottom:1px solid __LN__;">
  <div style="padding:11px 16px;font-size:14px;font-weight:600;__IND__">__N__</div>
  <div style="padding:11px 16px;font-size:14px;color:__I3__;text-align:right;">&#8212;</div>
  <div style="padding:11px 16px;font-size:14px;color:__I3__;text-align:right;">&#8212;</div>
</div>`,
      { BG: i % 2 === 0 ? "#FFFFFF" : PAPER, LN: LINE, I3: INK3, N: nm,
        IND: indented ? `padding-left:30px;color:${INK2};` : `color:${INK};` }
    );
  });
  let claims = "";
  for (const t of ["Vitamin C contributes to the normal function of the immune system.",
                   "Vitamin B6 contributes to normal energy-yielding metabolism.",
                   "Niacin contributes to the reduction of tiredness and fatigue.",
                   "Pantothenic acid contributes to normal mental performance."]) {
    claims += R(
      `<div style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;color:__I2__;"><span style="color:__G__;display:flex;padding-top:2px;flex:none;">__K__</span><span>__T__</span></div>`,
      { I2: INK2, G: dark(GREEN), K: TICK, T: t }
    );
  }
  let labelChips = "";
  for (const t of ["CAFFEINE FREE", "ASPARTAME FREE", "LOW CALORIE", "B3 &#183; B5 &#183; B6 &#183; C"]) {
    labelChips += R(
      `<span style="background:#fff;color:__IN__;font-size:11.5px;font-weight:800;padding:8px 14px;border-radius:999px;">__T__</span>`,
      { IN: INK, T: t }
    );
  }
  return R(
    `<div style="width:1280px;height:1180px;position:relative;overflow:hidden;background:#FFFFFF;padding:64px 66px;">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:44px;">
    <div style="display:flex;flex-direction:column;gap:18px;max-width:660px;">
      __KICK__
      <h2 style="font-size:52px;line-height:1.04;font-weight:700;">Everything in the bottle,<br>in plain English.</h2>
    </div>
    <p style="font-size:16px;line-height:1.55;color:__I2__;max-width:340px;">The part of the page written for whoever is actually holding the trolley.</p>
  </div>
  <div style="display:grid;grid-template-columns:400px minmax(0, 1fr);gap:52px;align-items:start;">
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="position:relative;width:400px;height:470px;border-radius:20px;background:__CY__;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-shadow:0 14px 34px rgba(27,22,20,.13);">
        <div style="position:absolute;top:0;left:0;right:0;height:74px;background:#ffffff2E;"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:74px;background:#00000014;"></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;background:#fff;border-radius:20px;padding:26px 40px;box-shadow:0 6px 18px rgba(27,22,20,.10);">
          __WMW__
          <div style="font-size:12px;font-weight:800;letter-spacing:6px;color:__IN__;">COLA</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:320px;padding-top:8px;">__LC__</div>
        <div style="font-size:15px;font-weight:800;color:__IN__;padding-top:10px;letter-spacing:.5px;">250ml e</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:__I3__;">
        <span style="width:9px;height:9px;border-radius:2px;border:2px dashed __I3__;flex:none;"></span>Placeholder label &#8212; not final artwork
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div style="border:1px solid __LN__;border-radius:16px;overflow:hidden;">
        <div style="display:grid;grid-template-columns:1.7fr 1fr 1fr;background:__IN__;color:#fff;">
          <div style="padding:13px 16px;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;">Nutrition</div>
          <div style="padding:13px 16px;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;text-align:right;">Per 100ml</div>
          <div style="padding:13px 16px;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;text-align:right;">Per bottle</div>
        </div>
        __TB__
      </div>
      <div style="display:flex;gap:11px;align-items:flex-start;padding:14px 18px;border-radius:12px;background:__YE__1F;border:1px solid __YE__59;">
        <span style="flex:none;display:flex;color:__IN__;"><svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 5v4M8 11.2v.1"/></svg></span>
        <div style="font-size:13.5px;line-height:1.5;color:__IN__;font-weight:600;">Figures to be supplied by KiddoFizz. Every value here is left blank on purpose &#8212; nutrition data is not something to mock up.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:__I3__;">What we can say about the vitamins</div>
        __CL__
        <div style="font-size:12px;line-height:1.5;color:__I3__;padding-top:2px;">Wording taken from the GB Nutrition and Health Claims Register. Final copy to be signed off by KiddoFizz&#39;s compliance team.</div>
      </div>
      <div style="font-size:13.5px;line-height:1.55;color:__I2__;"><span style="font-weight:800;color:__IN__;">Ingredients:</span> <span style="color:__I3__;">[ INGREDIENTS LIST TO SUPPLY ]</span></div>
    </div>
  </div>
</div>`,
    { KICK: kicker("For the grown-ups", GREEN), I2: INK2, I3: INK3, IN: INK, LN: LINE,
      CY: CYAN, YE: YEL, TB: tbody, CL: claims, LC: labelChips, WMW: wordmark(38) }
  );
}

// --- 07 for families ---------------------------------------------------------
function family() {
  let cards = "";
  for (const [t, b] of [
    ["A label that answers questions", "No caffeine, no aspartame, low calorie. The three things a parent checks, printed on the front."],
    ["A flavour they ask for by name", "Bubblegum, in the cola bottle shape they already recognise from the shelf."],
    ["250ml, and that is the point", "One bottle, one sitting. Small enough that nobody has to negotiate the second half."],
  ]) {
    cards += R(
      `<div style="display:flex;flex-direction:column;gap:11px;padding:26px;border-radius:18px;background:#fff;border:1px solid __LN__;">
  <div style="width:40px;height:40px;border-radius:11px;background:__YE__;display:flex;align-items:center;justify-content:center;color:__IN__;">__K__</div>
  <h3 style="font-size:21px;font-weight:600;line-height:1.2;">__T__</h3>
  <p style="font-size:14.5px;line-height:1.55;color:__I2__;">__B__</p>
</div>`,
      { LN: LINE, YE: YEL, IN: INK, K: TICK, T: t, B: b, I2: INK2 }
    );
  }
  return R(
    `<div style="width:1280px;height:820px;position:relative;overflow:hidden;background:__P__;padding:60px 66px;">
  <div style="position:absolute;right:-190px;top:-160px;width:560px;height:560px;border-radius:50%;background:__YE__2E;"></div>
  <div style="position:relative;display:grid;grid-template-columns:minmax(0, 1fr) 470px;gap:52px;align-items:center;height:100%;">
    <div style="display:flex;flex-direction:column;gap:24px;">
      __KICK__
      <h2 style="font-size:54px;line-height:1.03;font-weight:700;max-width:560px;">Made for the whole family,<br>not just the kids.</h2>
      <p style="font-size:18.5px;line-height:1.55;color:__I2__;max-width:520px;">Children pick it up because it looks like fun. Parents put it in the trolley because the back of the bottle holds up to a proper read.</p>
      <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:16px;padding-top:8px;">__C__</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));grid-template-rows:repeat(2, minmax(0, 1fr));gap:14px;height:520px;">
      <div style="grid-column:span 2;border-radius:18px;border:2px dashed __I3__;background:__PP__;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:__I3__;">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.8"/><path d="m3 17 5-4.5 4.5 4 3-2.5L21 18"/></svg>
        <div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Family photography</div>
      </div>
      <div style="border-radius:18px;border:2px dashed __I3__;background:__PP__;display:flex;align-items:center;justify-content:center;color:__I3__;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;text-align:center;padding:14px;">Lifestyle shot</div>
      <div style="border-radius:18px;border:2px dashed __I3__;background:__PP__;display:flex;align-items:center;justify-content:center;color:__I3__;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;text-align:center;padding:14px;">Product in hand</div>
    </div>
  </div>
</div>`,
    { P: PAPER, YE: YEL, KICK: kicker("Who it is for", YEL), I2: INK2, I3: INK3, PP: PAPER2, C: cards }
  );
}

// --- 08 the range ------------------------------------------------------------
function range() {
  let ghosts = "";
  for (const nm of ["Flavour 02", "Flavour 03", "Flavour 04"]) {
    ghosts += R(
      `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:430px;border-radius:20px;border:2px dashed __LN__;background:__P__;">
  <div style="width:66px;height:150px;border-radius:9px 9px 14px 14px;border:2px dashed __I3__;opacity:.55;"></div>
  <div style="font-size:15px;font-weight:700;color:__I3__;">__N__</div>
  <div style="font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:__I3__;opacity:.75;">Room on the shelf</div>
</div>`,
      { LN: LINE, P: PAPER, I3: INK3, N: nm }
    );
  }
  return R(
    `<div style="width:1280px;height:800px;position:relative;overflow:hidden;background:#FFFFFF;padding:58px 66px;">
  <div style="position:absolute;left:-160px;bottom:-220px;width:560px;height:560px;border-radius:50%;background:__GR__1F;"></div>
  <div style="position:relative;display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:36px;">
    <div style="display:flex;flex-direction:column;gap:16px;">
      __KICK__
      <h2 style="font-size:50px;line-height:1.04;font-weight:700;">One flavour now.<br>Room for more.</h2>
    </div>
    <p style="font-size:16px;line-height:1.55;color:__I2__;max-width:330px;">The grid is built for four. Bubblegum is what launches; the empty slots are the roadmap.</p>
  </div>
  <div style="position:relative;display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:20px;">
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;height:430px;padding:24px 18px;border-radius:20px;background:__GR__14;border:2px solid __GR__;">
      <div style="display:flex;align-items:center;justify-content:center;height:262px;">__BOT__</div>
      <h3 style="font-size:21px;font-weight:600;">Bubblegum</h3>
      <div style="font-size:13.5px;color:__I2__;text-align:center;line-height:1.45;">250ml &#183; caffeine free<br>aspartame free &#183; low calorie</div>
      <a href="#" style="margin-top:auto;text-decoration:none;background:__RE__;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:999px;">Find a stockist</a>
    </div>
    __G__
  </div>
</div>`,
    { GR: GREEN, KICK: kicker("The range", GREEN), I2: INK2, RE: RED,
      BOT: bottle(GREEN, "BUBBLEGUM", 250), G: ghosts }
  );
}

// --- 09 where to buy ---------------------------------------------------------
function stockists() {
  let slots = "";
  for (let i = 0; i < 5; i++) {
    slots += R(
      `<div style="height:78px;border-radius:14px;border:2px dashed __LN__;background:#fff;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:__I3__;">Retailer</div>`,
      { LN: LINE, I3: INK3 }
    );
  }
  let pins = "";
  for (const [x, y, big] of [[120, 96, 0], [196, 154, 1], [94, 214, 0], [232, 268, 0], [150, 330, 1], [250, 96, 0]]) {
    pins += R(
      `<div style="position:absolute;left:__X__px;top:__Y__px;width:__D__px;height:__D__px;border-radius:50% 50% 50% 0;background:__RE__;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(27,22,20,.20);"></div>`,
      { X: x, Y: y, D: big ? 22 : 15, RE: RED }
    );
  }
  return R(
    `<div style="width:1280px;height:760px;position:relative;overflow:hidden;background:__P__;padding:58px 66px;">
  <div style="position:absolute;inset:0;background:radial-gradient(700px 520px at 22% 46%, __BL__1A 0%, __BL__00 70%);"></div>
  <div style="position:relative;display:grid;grid-template-columns:minmax(0, 1fr) 420px;gap:56px;align-items:center;height:100%;">
    <div style="display:flex;flex-direction:column;gap:24px;">
      __KICK__
      <h2 style="font-size:54px;line-height:1.03;font-weight:700;">Find KiddoFizz<br>near you.</h2>
      <p style="font-size:18.5px;line-height:1.55;color:__I2__;max-width:470px;">Launching across the UK first. Put in a postcode and we will show the nearest shops carrying it.</p>
      <div style="display:flex;gap:11px;align-items:center;max-width:470px;">
        <div style="flex:1;display:flex;align-items:center;gap:11px;background:#fff;border:2px solid __LN__;border-radius:999px;padding:15px 22px;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="__I3__" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
          <span style="font-size:16px;color:__I3__;">Enter your postcode</span>
        </div>
        <a href="#" style="text-decoration:none;background:__RE__;color:#fff;font-size:15.5px;font-weight:700;padding:16px 30px;border-radius:999px;white-space:nowrap;">Search</a>
      </div>
      <div style="padding-top:14px;display:flex;flex-direction:column;gap:12px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:__I3__;">Stocked at</div>
        <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px;">__S__</div>
      </div>
    </div>
    <div style="position:relative;height:520px;border-radius:22px;background:#fff;border:1px solid __LN__;overflow:hidden;box-shadow:0 14px 34px rgba(27,22,20,.09);">
      <div style="position:absolute;inset:0;background-image:radial-gradient(__LN__ 1.4px, transparent 1.4px);background-size:22px 22px;"></div>
      <div style="position:absolute;left:64px;top:60px;width:300px;height:400px;border-radius:44% 56% 48% 52% / 38% 34% 66% 62%;background:__BL__1F;border:2px solid __BL__47;"></div>
      __PN__
      <div style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:#fff;border-top:1px solid __LN__;font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:__I3__;">Interactive stockist map</div>
    </div>
  </div>
</div>`,
    { P: PAPER, BL: BLUE, KICK: kicker("Where to buy", BLUE), I2: INK2, I3: INK3,
      LN: LINE, RE: RED, S: slots, PN: pins }
  );
}

// --- 10 footer ---------------------------------------------------------------
function footer() {
  let cols = "";
  for (const [t, items] of [
    ["The drink", ["Bubblegum cola", "What is inside", "Nutrition"]],
    ["The brand", ["Our story", "For families", "Press"]],
    ["Trade", ["Stock KiddoFizz", "Wholesale", "Contact"]],
    ["Legal", ["Privacy", "Cookies", "Terms"]],
  ]) {
    let links = "";
    for (const it of items) {
      links += R(`<a href="#" style="text-decoration:none;color:#FDFBF7;opacity:.62;font-size:14.5px;">__T__</a>`, { T: it });
    }
    cols += R(
      `<div style="display:flex;flex-direction:column;gap:12px;">
  <div style="font-size:11.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:__YE__;">__T__</div>
  <div style="display:flex;flex-direction:column;gap:9px;">__L__</div>
</div>`,
      { YE: YEL, T: t, L: links }
    );
  }
  let socials = "";
  for (const p of [
    "M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    "M17.5 6.5h.01M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3.5 7.5a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4z",
    "M21 7.5s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C15.4 4.3 12 4.3 12 4.3s-3.4 0-6.2.2c-.4.1-1.2.1-2 .9C3.2 6 3 7.5 3 7.5S2.8 9.2 2.8 11v1.9c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.8.8 2.2.9 1.6.2 6 .2 6 .2s3.4 0 6.2-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5V11c0-1.8-.2-3.5-.2-3.5zM10.2 14.6V9.4l4.4 2.6z",
  ]) {
    socials += R(
      `<a href="#" style="width:38px;height:38px;border-radius:50%;border:1.5px solid #FDFBF733;display:flex;align-items:center;justify-content:center;color:#FDFBF7;flex:none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="__P__"/></svg></a>`,
      { P: p }
    );
  }
  return R(
    `<div style="width:1280px;height:420px;position:relative;overflow:hidden;background:__IN__;padding:52px 66px 0;">
  <div style="position:absolute;right:-140px;top:-180px;width:420px;height:420px;border-radius:50%;background:#FDFBF70A;"></div>
  <div style="position:relative;display:grid;grid-template-columns:1.35fr repeat(4, minmax(0, 1fr));gap:36px;">
    <div style="display:flex;flex-direction:column;gap:16px;">
      __WM__
      <p style="font-size:14.5px;line-height:1.55;color:#FDFBF7;opacity:.62;max-width:270px;">Caffeine free, aspartame free, low calorie bubblegum cola. 250ml. Made for UK families.</p>
      <div style="display:flex;gap:10px;padding-top:4px;">__SO__</div>
    </div>
    __C__
  </div>
  <div style="position:relative;margin-top:44px;padding:22px 0;border-top:1px solid #FDFBF71F;display:flex;align-items:center;justify-content:space-between;">
    <div style="font-size:13px;color:#FDFBF7;opacity:.5;">&#169; 2026 KiddoFizz Ltd &#183; Registered in England &#183; [ COMPANY NO. ]</div>
    <div style="font-size:13px;color:#FDFBF7;opacity:.5;">[ REGISTERED ADDRESS ]</div>
  </div>
</div>`,
    { IN: INK, WM: wordmark(30, true), SO: socials, C: cols }
  );
}

// --- write everything --------------------------------------------------------
const FILES = {
  "Main.dc.html": [hero(), 1280, 800],
  "BeatCaffeine.dc.html": [beat({
    n: 1, deg: 0, accent: CYAN, kick: "01 &#183; What is not in it",
    head: "No caffeine.<br>Not a drop.",
    body: "Kids get the fizz, the fun and the cola they asked for. You skip the buzz, the crash and the bedtime negotiation.",
    extra: chip("0mg caffeine per 250ml bottle", CYAN), claim: "CAFFEINE FREE",
  }), 1280, 800],
  "BeatVitamins.dc.html": [beat({
    n: 2, deg: 90, accent: YEL, kick: "02 &#183; What is in it",
    head: "Vitamins B3, B5,<br>B6 and C.",
    body: "Four vitamins in every bottle, at levels worth putting on the front of the label rather than hiding on the back.",
    extra: claimBox(["Vitamin C contributes to the normal function of the immune system.",
                     "Vitamin B6 contributes to normal energy-yielding metabolism."], YEL),
    flip: true, claim: "B3 B5 B6 &amp; C",
  }), 1280, 800],
  "BeatAspartame.dc.html": [beat({
    n: 3, deg: 180, accent: GREEN, kick: "03 &#183; How it is sweetened",
    head: "Sweetened without<br>aspartame.",
    body: "Low calorie, and no aspartame anywhere in the recipe. The ingredients list is short enough to read in the aisle.",
    extra: chip("Low calorie &#183; Aspartame free", GREEN), claim: "ASPARTAME FREE",
  }), 1280, 800],
  "BeatBubblegum.dc.html": [beat({
    n: 4, deg: 270, accent: RED, kick: "04 &#183; How it tastes",
    head: "It tastes like<br>bubblegum.",
    body: "The cola bottle they recognise on the shelf, with the flavour they actually ask for. That is the whole idea.",
    extra: chip("Bubblegum flavour cola", RED), flip: true, claim: "BUBBLEGUM",
  }), 1280, 800],
  "Nutrition.dc.html": [nutrition(), 1280, 1180],
  "Family.dc.html": [family(), 1280, 820],
  "Range.dc.html": [range(), 1280, 800],
  "Stockists.dc.html": [stockists(), 1280, 760],
  "Footer.dc.html": [footer(), 1280, 420],
};

for (const [name, [body, w, h]] of Object.entries(FILES)) {
  writeFileSync(join(D, name), page(body, w, h), "utf8");
}

const CANVAS = {
  artboards: [
    { file: "Main.dc.html", title: "01 \u00b7 Hero", x: 0, y: 0, w: 1280, h: 800 },
    { file: "BeatCaffeine.dc.html", title: "02 \u00b7 Pinned \u2014 Caffeine free", x: 0, y: 920, w: 1280, h: 800 },
    { file: "BeatVitamins.dc.html", title: "03 \u00b7 Pinned \u2014 Vitamins", x: 1400, y: 920, w: 1280, h: 800 },
    { file: "BeatAspartame.dc.html", title: "04 \u00b7 Pinned \u2014 Aspartame free", x: 2800, y: 920, w: 1280, h: 800 },
    { file: "BeatBubblegum.dc.html", title: "05 \u00b7 Pinned \u2014 Bubblegum", x: 4200, y: 920, w: 1280, h: 800 },
    { file: "Nutrition.dc.html", title: "06 \u00b7 Label & nutrition", x: 0, y: 1840, w: 1280, h: 1180 },
    { file: "Family.dc.html", title: "07 \u00b7 For families", x: 1400, y: 1840, w: 1280, h: 820 },
    { file: "Range.dc.html", title: "08 \u00b7 The range", x: 2800, y: 1840, w: 1280, h: 800 },
    { file: "Stockists.dc.html", title: "09 \u00b7 Where to buy", x: 4200, y: 1840, w: 1280, h: 760 },
    { file: "Footer.dc.html", title: "10 \u00b7 Footer", x: 0, y: 3140, w: 1280, h: 420 },
  ],
  annotations: [
    { id: "note-placeholders", x: -400, y: 40, w: 320,
      text: "Everything on this canvas is ours, not KiddoFizz's:\n\n\u2022 Wordmark, label and bottle are placeholder artwork\n\u2022 Copy is drafted to fit the layout \u2014 swap it for the client's own wording\n\u2022 Photography and nutrition figures are left as empty slots on purpose" },
    { id: "note-sequence", x: -400, y: 960, w: 320,
      text: "These four frames are ONE scroll section, not four pages.\n\nThe bottle pins in the middle of the screen and turns a quarter rotation per beat while the background colour changes underneath it.\n\nThe live prototype shows this actually working." },
    { id: "note-colour", x: -400, y: 1880, w: 320,
      text: "Colour rule:\n\nNear-white base on every section, one accent colour dominant per section. The page reads colourful because you scroll through the palette \u2014 not because any one screen is crowded.\n\nBrand red is kept for the wordmark, the main button and the flavour beat. Nowhere else." },
  ],
  launch: { view: "canvas" },
};
writeFileSync(join(D, "canvas.json"), JSON.stringify(CANVAS, null, 2), "utf8");

console.log("wrote " + Object.keys(FILES).length + " artboards + canvas.json");
