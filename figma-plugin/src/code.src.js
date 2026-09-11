/* KiddoFizz Drinks — Figma design builder.
   Run from Figma: Plugins → Development → Import plugin from manifest…

   Builds the five pages at desktop (1440) and mobile (390) as native frames with
   auto-layout, plus the colour and text styles as a real library. Everything is
   editable Figma geometry — no flattened screenshots.

   Built from src/code.src.js by build.mjs, which swaps @IMG_*@ for base64 image
   data. Edit the source, not the built file. */

/* ------------------------------------------------------------------ tokens */
var C = {
  red: "C8121A", redDeep: "8E0A10", redLift: "E0342C",
  cream: "FBF2E6", ink: "1A1512", inkSoft: "6B5F58",
  brandRed: "EE0A1E", brandOrange: "FB8C0B", brandGreen: "0AA838",
  brandBlue: "0660C8", brandYellow: "FFC72C",
  white: "FFFFFF", line: "E7DCCB"
};

function rgb(hex) {
  var h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255
  };
}
function solid(hex, opacity) {
  var p = { type: "SOLID", color: rgb(hex) };
  if (opacity != null) p.opacity = opacity;
  return p;
}
function rgba(hex, a) { var c = rgb(hex); return { r: c.r, g: c.g, b: c.b, a: a }; }

/* Radial, centred. The CSS uses an off-centre origin; Figma needs a gradient
   transform matrix for that and the difference is not worth the fragility. */
function redField() {
  return {
    type: "GRADIENT_RADIAL",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      { position: 0, color: rgba(C.redLift, 1) },
      { position: 0.45, color: rgba(C.red, 1) },
      { position: 1, color: rgba(C.redDeep, 1) }
    ]
  };
}
function glowField() {
  return {
    type: "GRADIENT_RADIAL",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      { position: 0, color: rgba(C.brandYellow, 0.55) },
      { position: 0.62, color: rgba(C.brandOrange, 0.28) },
      { position: 1, color: rgba(C.brandOrange, 0) }
    ]
  };
}

function shadow(y, blur, hex, a) {
  return [{
    type: "DROP_SHADOW", color: rgba(hex || "3C1E0A", a == null ? 0.14 : a),
    offset: { x: 0, y: y }, radius: blur, spread: 0,
    visible: true, blendMode: "NORMAL"
  }];
}

/* ------------------------------------------------------------------- fonts */
/* Anton, Fredoka and Plus Jakarta Sans are Google fonts. If the file does not
   have them the plugin falls back rather than dying, and says so at the end. */
var missingFonts = [];

async function pickFont(label, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    try {
      await figma.loadFontAsync(candidates[i]);
      if (i > 0) missingFonts.push(label + " → " + candidates[i].family + " " + candidates[i].style);
      return candidates[i];
    } catch (e) { /* try the next one */ }
  }
  throw new Error("No usable font for " + label);
}

var F = {};

async function loadFonts() {
  F.display = await pickFont("Anton", [
    { family: "Anton", style: "Regular" },
    { family: "Archivo Black", style: "Regular" },
    { family: "Inter", style: "Bold" }
  ]);
  F.roundBold = await pickFont("Fredoka Bold", [
    { family: "Fredoka", style: "Bold" },
    { family: "Fredoka", style: "SemiBold" },
    { family: "Fredoka One", style: "Regular" },
    { family: "Baloo 2", style: "Bold" },
    { family: "Inter", style: "Bold" }
  ]);
  F.roundMed = await pickFont("Fredoka SemiBold", [
    { family: "Fredoka", style: "SemiBold" },
    { family: "Fredoka", style: "Medium" },
    { family: "Fredoka One", style: "Regular" },
    { family: "Inter", style: "Semi Bold" },
    { family: "Inter", style: "Bold" }
  ]);
  F.body = await pickFont("Jakarta Regular", [
    { family: "Plus Jakarta Sans", style: "Regular" },
    { family: "Inter", style: "Regular" }
  ]);
  F.bodySemi = await pickFont("Jakarta SemiBold", [
    { family: "Plus Jakarta Sans", style: "SemiBold" },
    { family: "Plus Jakarta Sans", style: "Semi Bold" },
    { family: "Inter", style: "Semi Bold" }
  ]);
  F.bodyBold = await pickFont("Jakarta Bold", [
    { family: "Plus Jakarta Sans", style: "Bold" },
    { family: "Inter", style: "Bold" }
  ]);
  F.bodyExtra = await pickFont("Jakarta ExtraBold", [
    { family: "Plus Jakarta Sans", style: "ExtraBold" },
    { family: "Plus Jakarta Sans", style: "Extra Bold" },
    { family: "Plus Jakarta Sans", style: "Bold" },
    { family: "Inter", style: "Bold" }
  ]);
}

/* ------------------------------------------------------------- style setters
   Newer API versions want the async setters and warn on direct assignment; older
   ones only have the property. Try async, fall back. */
async function setFillStyle(node, id) {
  if (!id) return;
  try {
    if (node.setFillStyleIdAsync) await node.setFillStyleIdAsync(id);
    else node.fillStyleId = id;
  } catch (e) { /* style application is a nicety, never fatal */ }
}
async function setTextStyle(node, id) {
  if (!id) return;
  try {
    if (node.setTextStyleIdAsync) await node.setTextStyleIdAsync(id);
    else node.textStyleId = id;
  } catch (e) { /* same */ }
}

/* ------------------------------------------------------------------ helpers */
function frame(name, w, h) {
  var f = figma.createFrame();
  f.name = name;
  f.fills = [];
  f.clipsContent = false;
  if (w != null && h != null) f.resize(w, h);
  return f;
}

/* vertical / horizontal auto-layout frame */
function stack(name, dir, gap, pad) {
  var f = frame(name);
  f.layoutMode = dir;
  f.itemSpacing = gap || 0;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  pad = pad || {};
  f.paddingTop = pad.t || 0;
  f.paddingRight = pad.r || 0;
  f.paddingBottom = pad.b || 0;
  f.paddingLeft = pad.l || 0;
  return f;
}

function lockSize(node, w, h) {
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'FIXED';
  node.resize(w, h);
  return node;
}

function fixedWidth(node, w) {
  if (node.layoutMode === "HORIZONTAL") node.primaryAxisSizingMode = "FIXED";
  else node.counterAxisSizingMode = "FIXED";
  node.resize(w, node.height);
  return node;
}

function text(chars, opt) {
  opt = opt || {};
  var t = figma.createText();
  t.fontName = opt.font || F.body;
  t.characters = chars;
  t.fontSize = opt.size || 15;
  t.fills = [solid(opt.color || C.ink, opt.opacity)];
  if (opt.lh) t.lineHeight = { value: opt.lh, unit: "PIXELS" };
  if (opt.ls != null) t.letterSpacing = { value: opt.ls, unit: "PERCENT" };
  if (opt.align) t.textAlignHorizontal = opt.align;
  if (opt.width) {
    t.textAutoResize = "HEIGHT";
    t.resize(opt.width, t.height);
  } else {
    t.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  t.name = chars.length > 40 ? chars.slice(0, 40) + "…" : chars;
  return t;
}

/* uppercase label: the eyebrows and button text all share this shape */
function label(chars, opt) {
  opt = opt || {};
  return text(chars.toUpperCase(), {
    font: opt.font || F.bodyExtra,
    size: opt.size || 11.5,
    color: opt.color || C.inkSoft,
    opacity: opt.opacity,
    ls: opt.ls == null ? 18 : opt.ls,
    align: opt.align,
    width: opt.width
  });
}

function rect(name, w, h, fill, radius) {
  var r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = fill ? [fill] : [];
  if (radius) r.cornerRadius = radius;
  return r;
}

function ellipse(name, w, h, fill) {
  var e = figma.createEllipse();
  e.name = name;
  e.resize(w, h);
  e.fills = fill ? [fill] : [];
  return e;
}

function imageNode(name, hash, w, h, mode, radius) {
  var r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = [{ type: "IMAGE", scaleMode: mode || "FIT", imageHash: hash }];
  if (radius) r.cornerRadius = radius;
  return r;
}

/* A scalloped edge: half-circles along one edge, clipped to the visible half.
   dir "up"   → domes point up   (bottom of the red hero, cream below)
   dir "down" → domes point down (top of a red section, cream above) */
function scallop(w, dir, tile) {
  tile = tile || 30;
  var half = tile / 2;
  var f = frame("Scallop / " + dir, w, half);
  f.clipsContent = true;
  var n = Math.ceil(w / tile) + 1;
  for (var i = 0; i < n; i++) {
    var e = ellipse("dome", tile, tile, solid(C.cream));
    e.x = i * tile;
    e.y = dir === "up" ? 0 : -half;
    f.appendChild(e);
  }
  return f;
}

/* ----------------------------------------------------------- shared pieces */
function navPill(w, mobile) {
  var pad = mobile ? 12 : 24;
  var f = frame("Nav / pill", w - (mobile ? 20 : 68), 70);
  f.fills = [solid(C.cream)];
  f.cornerRadius = 999;
  f.strokes = [solid(C.ink, 0.07)];
  f.strokeWeight = 1;
  f.effects = shadow(10, 30, "3C0608", 0.18);
  f.layoutMode = "HORIZONTAL";
  lockSize(f, w - (mobile ? 20 : 68), 70);
  f.primaryAxisAlignItems = "SPACE_BETWEEN";
  f.counterAxisAlignItems = "CENTER";
  f.paddingLeft = pad;
  f.paddingRight = 10;
  f.clipsContent = true;

  f.appendChild(imageNode("Logo", IMG.logo, mobile ? 88 : 104, 34, "FIT"));

  if (!mobile) {
    var nav = stack("Links", "HORIZONTAL", 34);
    nav.counterAxisAlignItems = "CENTER";
    var items = ["Home", "About Us", "Product", "Contact"];
    for (var i = 0; i < items.length; i++) {
      nav.appendChild(text(items[i], {
        font: i === 0 ? F.bodyExtra : F.bodySemi,
        size: 15, color: C.ink, opacity: i === 0 ? 1 : 0.72
      }));
    }
    f.appendChild(nav);
  }

  var acts = stack("Actions", "HORIZONTAL", 8);
  acts.counterAxisAlignItems = "CENTER";
  var icons = mobile ? ["Basket", "Menu"] : ["Basket", "Account"];
  for (var j = 0; j < icons.length; j++) {
    var b = frame("Icon / " + icons[j], 50, 50);
    b.fills = [solid(C.ink, 0.07)];
    b.cornerRadius = 999;
    acts.appendChild(b);
  }
  f.appendChild(acts);
  return f;
}

function btnSolid(labelText) {
  var f = stack("Button / solid", "HORIZONTAL", 0, { t: 15, b: 15, l: 30, r: 30 });
  f.cornerRadius = 999;
  f.fills = [solid(C.brandOrange)];
  f.effects = shadow(12, 26, "8C4604", 0.26);
  f.counterAxisAlignItems = "CENTER";
  f.appendChild(label(labelText, { size: 12.5, color: C.ink, ls: 13 }));
  return f;
}

function btnLine(labelText, onRed) {
  var f = stack("Button / outline", "HORIZONTAL", 0, { t: 15, b: 15, l: 30, r: 30 });
  f.cornerRadius = 999;
  f.fills = [];
  f.strokes = [onRed ? solid(C.white, 0.55) : solid(C.ink, 0.28)];
  f.strokeWeight = 1.5;
  f.counterAxisAlignItems = "CENTER";
  f.appendChild(label(labelText, { size: 12.5, color: onRed ? C.white : C.ink, ls: 13 }));
  return f;
}

/* the glass treatment: brand colour as a tint and an edge, never a flood */
function glassCard(labelText, tint, w) {
  var f = stack("Chip / " + labelText, "HORIZONTAL", 9, { t: 12, b: 12, l: 14, r: 14 });
  f.cornerRadius = 14;
  f.fills = [solid(tint, 0.11)];
  f.strokes = [solid(tint, 0.34)];
  f.strokeWeight = 1;
  f.counterAxisAlignItems = "CENTER";
  if (w) fixedWidth(f, w);
  f.appendChild(ellipse("dot", 9, 9, solid(tint)));
  var t = text(labelText, { font: F.bodyBold, size: 12.5, color: C.ink, lh: 16 });
  f.appendChild(t);
  return f;
}

function claimCard(num, labelText, note, tint, w) {
  var f = stack("Claim / " + labelText, "HORIZONTAL", 12, { t: 16, b: 16, l: 14, r: 16 });
  f.cornerRadius = 16;
  f.fills = [solid(tint, 0.11)];
  f.strokes = [solid(tint, 0.34)];
  f.strokeWeight = 1;
  f.counterAxisAlignItems = "MIN";
  if (w) fixedWidth(f, w);

  var badge = frame("no.", 26, 26);
  badge.fills = [solid(tint, 0.26)];
  badge.cornerRadius = 8;
  badge.layoutMode = "HORIZONTAL";
  lockSize(badge, 26, 26);
  badge.primaryAxisAlignItems = "CENTER";
  badge.counterAxisAlignItems = "CENTER";
  badge.appendChild(text(num, { font: F.bodyExtra, size: 11, color: C.ink }));
  f.appendChild(badge);

  var col = stack("copy", "VERTICAL", 3);
  col.appendChild(text(labelText, { font: F.bodyExtra, size: 14.5, color: C.ink, lh: 19 }));
  if (note) col.appendChild(text(note, { font: F.bodySemi, size: 12.5, color: C.ink, opacity: 0.88, lh: 17 }));
  f.appendChild(col);
  return f;
}

function panelCard(title, bodyText, placeholder, fine, w) {
  var f = stack("Panel / " + title, "VERTICAL", 10, { t: 20, b: 20, l: 20, r: 20 });
  f.cornerRadius = 18;
  f.fills = [solid(C.white)];
  f.effects = shadow(12, 28, "3C1E0A", 0.09);
  fixedWidth(f, w);
  var inner = w - 40;
  f.appendChild(text(title, { font: F.roundMed, size: 17, color: C.ink, width: inner }));
  if (bodyText) f.appendChild(text(bodyText, { size: 13.5, color: C.inkSoft, lh: 21, width: inner }));
  if (placeholder) {
    var ph = stack("Placeholder", "HORIZONTAL", 0, { t: 11, b: 11, l: 13, r: 13 });
    ph.cornerRadius = 11;
    ph.fills = [solid(C.ink, 0.05)];
    ph.strokes = [solid(C.ink, 0.22)];
    ph.strokeWeight = 1.5;
    ph.dashPattern = [5, 4];
    fixedWidth(ph, inner);
    ph.appendChild(label(placeholder, { size: 12, color: C.inkSoft, ls: 6 }));
    f.appendChild(ph);
  }
  if (fine) f.appendChild(text(fine, { size: 12, color: C.inkSoft, opacity: 0.85, lh: 18, width: inner }));
  return f;
}

function noticeBox(strongText, restText, w) {
  var f = stack("Notice", "HORIZONTAL", 12, { t: 15, b: 15, l: 18, r: 18 });
  f.cornerRadius = 14;
  f.fills = [solid(C.brandYellow, 0.22)];
  f.strokes = [solid(C.brandYellow, 0.6)];
  f.strokeWeight = 1;
  f.counterAxisAlignItems = "MIN";
  fixedWidth(f, w);
  f.appendChild(ellipse("!", 18, 18, solid(C.ink, 0.5)));
  var col = stack("copy", "VERTICAL", 4);
  col.appendChild(text(strongText, { font: F.bodyExtra, size: 13.5, color: C.ink, lh: 21, width: w - 78 }));
  col.appendChild(text(restText, { size: 13.5, color: C.ink, lh: 21, width: w - 78 }));
  f.appendChild(col);
  return f;
}

/* the confetti and bubble fields — decorative, kept few and named so they are
   easy to delete or multiply by hand */
function bubbleField(host, w, h, count, seedOffset) {
  var s = seedOffset || 0;
  for (var i = 0; i < count; i++) {
    // deterministic scatter, so re-running the plugin gives the same file
    var rx = ((i * 73 + s * 31) % 100) / 100;
    var ry = ((i * 41 + s * 17) % 100) / 100;
    var size = 10 + (((i * 29 + s) % 40));
    var e = ellipse("bubble", size, size, null);
    e.strokes = [solid(C.white, 0.34)];
    e.strokeWeight = 1.5;
    e.opacity = 0.25 + ((i * 13) % 35) / 100;
    // kept to the outer thirds so nothing sits over the label
    e.x = (rx < 0.5 ? rx * 0.62 : 0.68 + (rx - 0.5) * 0.62) * w;
    e.y = 0.12 * h + ry * h * 0.8;
    host.appendChild(e);
  }
}

function footer(w, mobile) {
  var f = frame("Footer", w, mobile ? 620 : 700);
  f.fills = [redField()];
  f.clipsContent = true;

  var sc = scallop(w, "down");
  sc.x = 0; sc.y = 0;
  f.appendChild(sc);

  var marquee = text("BIG FIZZ.  ZERO CAFFEINE.  BIG FIZZ.  ZERO CAFFEINE.", {
    font: F.display, size: mobile ? 46 : 92, color: C.white, ls: -1
  });
  marquee.name = "Marquee";
  marquee.x = mobile ? -30 : -40;
  marquee.y = mobile ? 60 : 96;
  marquee.opacity = 0.9;
  f.appendChild(marquee);

  var pad = mobile ? 22 : 76;
  var left = stack("Footer / left", "VERTICAL", 22);
  left.appendChild(imageNode("Logo", IMG.logo, 132, 43, "FIT"));
  var fnav = stack("Links", "VERTICAL", 12);
  var items = ["Home", "Product", "About Us", "FAQs", "Contact"];
  for (var i = 0; i < items.length; i++) {
    fnav.appendChild(text("[ " + items[i].toUpperCase() + " ]", {
      font: F.bodyExtra, size: 12.5, color: C.white, ls: 10
    }));
  }
  left.appendChild(fnav);
  left.x = pad;
  left.y = mobile ? 190 : 250;
  f.appendChild(left);

  var right = stack("Footer / right", "VERTICAL", 16);
  right.counterAxisAlignItems = mobile ? "MIN" : "MAX";
  right.appendChild(text("Skip the caffeine.\nKeep the fizz.", {
    font: F.roundBold, size: mobile ? 22 : 28, color: C.white, lh: mobile ? 28 : 34,
    align: mobile ? "LEFT" : "RIGHT"
  }));
  var socials = stack("Socials", "HORIZONTAL", 10);
  for (var s = 0; s < 3; s++) {
    var b = frame("social", 38, 38);
    b.fills = [solid(C.white, 0.16)];
    b.cornerRadius = 10;
    socials.appendChild(b);
  }
  right.appendChild(socials);
  right.appendChild(text("Privacy policy  ·  Terms of service", {
    font: F.bodySemi, size: 12, color: C.white, opacity: 0.8
  }));
  right.appendChild(text("© 2026 KiddoFizz Ltd  ·  [ COMPANY NO. ]  ·  Made in the UK", {
    font: F.body, size: 11.5, color: C.white, opacity: 0.66
  }));
  if (mobile) {
    right.x = pad;
    right.y = 400;
  } else {
    right.x = w - pad - right.width;
    right.y = 268;
  }
  f.appendChild(right);
  return f;
}

/* red page header used by About, Products and Contact */
function pageHead(w, mobile, eyebrow, heading, sub) {
  var h = mobile ? 400 : 520;
  var f = frame("Section / page header", w, h);
  f.fills = [redField()];
  f.clipsContent = true;
  bubbleField(f, w, h, mobile ? 8 : 14, 3);

  var pad = mobile ? 22 : 76;
  var col = stack("Header copy", "VERTICAL", 0);
  col.appendChild(label(eyebrow, { size: 11.5, color: C.brandYellow, ls: 22 }));

  var head = text(heading, {
    font: F.display, size: mobile ? 54 : 108, color: C.white,
    lh: mobile ? 50 : 98, ls: -1.5
  });
  head.name = "H1";
  var wrapH = stack("h1 wrap", "VERTICAL", 0, { t: 14, b: 20 });
  wrapH.appendChild(head);
  col.appendChild(wrapH);

  col.appendChild(text(sub, {
    size: mobile ? 14 : 17, color: C.white, opacity: 0.88, lh: 27,
    width: mobile ? w - pad * 2 : 540
  }));
  col.x = pad;
  col.y = mobile ? 150 : 190;
  f.appendChild(col);

  var sc = scallop(w, "up");
  sc.x = 0;
  sc.y = h - sc.height;
  f.appendChild(sc);
  return f;
}

/* a cream content section that hugs its children */
function creamSection(name, w, mobile, padTop, padBottom) {
  var f = stack(name, "VERTICAL", 0, {
    t: padTop, b: padBottom, l: mobile ? 22 : 76, r: mobile ? 22 : 76
  });
  f.fills = [solid(C.cream)];
  f.counterAxisSizingMode = "FIXED";
  f.resize(w, f.height);
  return f;
}

function sectionHeading(eyebrow, heading, sub, w, mobile) {
  var col = stack("Section heading", "VERTICAL", 12);
  if (eyebrow) col.appendChild(label(eyebrow, { size: 11.5, color: C.brandRed, ls: 22 }));
  col.appendChild(text(heading, {
    font: F.roundBold, size: mobile ? 30 : 46, color: C.ink, lh: mobile ? 34 : 50, ls: -2,
    width: mobile ? w : Math.min(w, 760)
  }));
  if (sub) col.appendChild(text(sub, { size: 15, color: C.inkSoft, lh: 24, width: mobile ? w : 560 }));
  return col;
}

/* rows of equal-width cards, wrapped by hand: layoutWrap is not in every API
   version, and a fixed grid is easier for a designer to rearrange anyway */
function grid(name, nodes, perRow, gap) {
  var g = stack(name, "VERTICAL", gap);
  var row = null;
  for (var i = 0; i < nodes.length; i++) {
    if (i % perRow === 0) {
      row = stack("row", "HORIZONTAL", gap);
      row.counterAxisAlignItems = "MIN";
      g.appendChild(row);
    }
    row.appendChild(nodes[i]);
  }
  return g;
}

/* =========================================================================
   Page builders
   ========================================================================= */

function featureCard(title, body, tint, onInk, w) {
  var f = stack("Card / " + title, "VERTICAL", 0, { t: 13, b: 13, l: 13, r: 13 });
  f.cornerRadius = 20;
  f.fills = [solid(tint)];
  f.effects = shadow(12, 26, "3C1E0A", 0.18);
  fixedWidth(f, w);

  var head = stack("title", "VERTICAL", 0, { t: 1, b: 10, l: 5, r: 5 });
  head.appendChild(text(title, {
    font: F.roundMed, size: 16, lh: 19,
    color: onInk ? C.ink : C.white, width: w - 36
  }));
  f.appendChild(head);

  var p = stack("body", "VERTICAL", 0, { t: 11, b: 11, l: 12, r: 12 });
  p.cornerRadius = 12;
  p.fills = [solid(C.white)];
  fixedWidth(p, w - 26);
  p.appendChild(text(body, { size: 12.5, color: C.ink, lh: 19, width: w - 50 }));
  f.appendChild(p);
  return f;
}

function productCard(title, tag, imgHash, withBottle, w, h) {
  var f = frame("Product card / " + title, w, h);
  f.cornerRadius = 24;
  f.clipsContent = true;
  f.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: imgHash }];
  f.effects = shadow(22, 46, "320406", 0.28);

  var wash = rect("wash", w, h, solid(C.ink, 0.18), 24);
  f.appendChild(wash);

  if (withBottle) {
    var bw = Math.round(h * 0.42);
    var bh = Math.round(bw * 1095 / 340);
    var b = imageNode("Bottle", IMG.bottle, bw, bh, "FIT");
    b.x = (w - bw) / 2;
    b.y = h - bh + Math.round(h * 0.12);
    f.appendChild(b);
  }

  var t = text(title, { font: F.display, size: Math.round(h * 0.115), color: C.white, ls: -1 });
  t.x = 22;
  t.y = h - 22 - t.height;
  f.appendChild(t);

  if (tag) {
    var badge = stack("tag", "HORIZONTAL", 0, { t: 8, b: 8, l: 14, r: 14 });
    badge.cornerRadius = 999;
    badge.fills = [solid(C.white, 0.9)];
    badge.appendChild(label(tag, { size: 10.5, color: C.ink, ls: 12 }));
    badge.x = 22;
    badge.y = 22;
    f.appendChild(badge);
  }
  return f;
}

function buildHome(w, mobile) {
  var page = frame(mobile ? "Home / mobile" : "Home / desktop", w, 100);
  page.layoutMode = "VERTICAL";
  page.counterAxisSizingMode = "FIXED";
  page.primaryAxisSizingMode = "AUTO";
  page.itemSpacing = 0;
  page.fills = [solid(C.cream)];
  page.clipsContent = true;

  /* ---- hero */
  var hh = mobile ? 720 : 900;
  var hero = frame("Section / hero", w, hh);
  hero.fills = [redField()];
  hero.clipsContent = true;
  hero.layoutAlign = "STRETCH";
  bubbleField(hero, w, hh, mobile ? 12 : 22, 1);

  var nav = navPill(w, mobile);
  nav.x = mobile ? 10 : 34;
  nav.y = 18;

  var title = text("STAY FIZZY", {
    font: F.display, size: mobile ? 62 : 220, color: C.white,
    lh: mobile ? 58 : 190, ls: -1.5, align: "CENTER", width: w
  });
  title.name = "STAY FIZZY";
  title.x = 0;
  title.y = mobile ? 150 : 160;
  hero.appendChild(title);

  var bw = mobile ? 310 : 690;
  var bh = Math.round(bw * 857 / 820);
  var shot = imageNode("Hero bottle + splash", IMG.hero, bw, bh, "FIT");
  shot.x = (w - bw) / 2;
  shot.y = hh - bh - (mobile ? 190 : 30);
  hero.appendChild(shot);

  var note = text(
    "A BUBBLEGUM DRINK MADE FOR KIDS. NO CAFFEINE, NO ASPARTAME, LOW CALORIE — WITH SUGARS FROM APPLE JUICE.",
    { font: F.bodyBold, size: mobile ? 13 : 16, color: C.white, opacity: 0.92, lh: mobile ? 21 : 26, ls: 7,
      width: mobile ? w - 44 : 340, align: mobile ? "CENTER" : "LEFT" });
  note.name = "Hero note";
  var cta = btnLine("See what’s inside", true);
  if (mobile) {
    note.x = 22; note.y = hh - 150;
    cta.x = (w - 220) / 2; cta.y = hh - 78;
  } else {
    note.x = 62; note.y = 420;
    cta.x = w - 62 - 250; cta.y = 420;
  }
  hero.appendChild(note);
  hero.appendChild(cta);
  hero.appendChild(nav);

  var hsc = scallop(w, "up", 34);
  hsc.x = 0;
  hsc.y = hh - hsc.height;
  hero.appendChild(hsc);
  page.appendChild(hero);

  /* ---- feature */
  var feat = creamSection("Section / product feature", w, mobile, mobile ? 60 : 92, mobile ? 64 : 104);
  feat.layoutAlign = "STRETCH";
  feat.counterAxisAlignItems = "CENTER";
  feat.itemSpacing = mobile ? 34 : 48;

  var fh = stack("heading", "VERTICAL", 12);
  fh.counterAxisAlignItems = "CENTER";
  fh.appendChild(label("What is inside", { size: 11.5, color: C.brandRed, ls: 22 }));
  fh.appendChild(text("A Fun, Refreshing Drink.", {
    font: F.roundBold, size: mobile ? 32 : 62, color: C.ink, lh: mobile ? 36 : 64, ls: -2, align: "CENTER"
  }));
  fh.appendChild(text("And a back label that holds up to a proper read.", {
    size: mobile ? 14 : 17, color: C.inkSoft, align: "CENTER"
  }));
  feat.appendChild(fh);

  var cards = [
    ["Caffeine free", "None at all. The fizz without the buzz, or the bedtime negotiation.", C.brandGreen, false],
    ["Low calorie", "Light enough to be an everyday drink rather than a treat.", C.brandOrange, true],
    ["Aspartame free", "Sweetened without it. The sugars come from apple juice.", C.brandBlue, false],
    ["Vitamins B3, B5, B6 & C", "Niacin, pantothenic acid, B6 with folic acid, and vitamin C.", C.brandRed, false],
    ["Bubblegum flavour", "The bottle they recognise, with the flavour they ask for.", C.brandYellow, true]
  ];

  if (mobile) {
    var mb = imageNode("Feature bottle", IMG.bottle, 150, Math.round(150 * 1095 / 340), "FIT");
    feat.appendChild(mb);
    var col = stack("Claim cards", "VERTICAL", 14);
    for (var i = 0; i < cards.length; i++) {
      col.appendChild(featureCard(cards[i][0], cards[i][1], cards[i][2], cards[i][3], w - 44));
    }
    feat.appendChild(col);
  } else {
    var body = frame("Feature body", w - 152, 640);
    body.clipsContent = false;
    var glow = ellipse("Pop glow", 430, 430, glowField());
    glow.x = (body.width - 430) / 2;
    glow.y = 640 - 430 + 40;
    body.appendChild(glow);

    var fbw = 200;
    var fbh = Math.round(fbw * 1095 / 340);
    var fb = imageNode("Feature bottle", IMG.bottle, fbw, fbh, "FIT");
    fb.x = (body.width - fbw) / 2;
    fb.y = 640 - fbh;
    fb.effects = shadow(26, 34, "3C1E0A", 0.30);
    body.appendChild(fb);

    // three down the left, two down the right — the layout the leader lines serve
    var pos = [[190, 10], [158, 232], [202, 454], [null, 62], [null, 330]];
    for (var j = 0; j < cards.length; j++) {
      var card = featureCard(cards[j][0], cards[j][1], cards[j][2], cards[j][3], 258);
      if (pos[j][0] === null) card.x = body.width - 190 - 258;
      else card.x = pos[j][0];
      card.y = pos[j][1];
      body.appendChild(card);

      var lead = rect("leader", 120, 2, solid(cards[j][2]));
      lead.y = card.y + 34;
      lead.x = pos[j][0] === null ? card.x - 130 : card.x + 258 + 10;
      body.appendChild(lead);
    }
    feat.appendChild(body);
  }
  page.appendChild(feat);

  /* ---- showcase */
  var sh = mobile ? 900 : 940;
  var show = frame("Section / product showcase", w, sh);
  show.fills = [redField()];
  show.clipsContent = true;
  show.layoutAlign = "STRETCH";

  var ssc = scallop(w, "down");
  ssc.x = 0; ssc.y = 0;
  show.appendChild(ssc);

  var padS = mobile ? 14 : 30;
  var panel = frame("Panel", w - padS * 2, sh - padS * 2);
  panel.x = padS; panel.y = padS;
  panel.cornerRadius = mobile ? 24 : 30;
  panel.fills = [solid(C.cream)];
  panel.clipsContent = true;
  panel.effects = shadow(30, 70, "320406", 0.34);
  panel.layoutMode = "VERTICAL";
  lockSize(panel, w - padS * 2, sh - padS * 2);
  panel.itemSpacing = mobile ? 34 : 46;
  panel.paddingTop = mobile ? 44 : 62;
  panel.paddingLeft = mobile ? 18 : 56;
  panel.paddingRight = mobile ? 18 : 56;
  panel.paddingBottom = mobile ? 44 : 56;
  panel.counterAxisAlignItems = "CENTER";

  var hl = stack("Headline", "VERTICAL", 6);
  hl.counterAxisAlignItems = "CENTER";
  hl.appendChild(text("WE HAVE ONE", {
    font: F.display, size: mobile ? 36 : 68, color: C.ink, lh: mobile ? 36 : 66, align: "CENTER"
  }));
  var hlBox = stack("seriously", "HORIZONTAL", 0, { t: 6, b: 4, l: 18, r: 18 });
  hlBox.fills = [solid(C.brandRed)];
  hlBox.appendChild(text("SERIOUSLY", {
    font: F.display, size: mobile ? 36 : 68, color: C.cream, lh: mobile ? 36 : 66
  }));
  hl.appendChild(hlBox);
  hl.appendChild(text("GOOD FLAVOUR", {
    font: F.display, size: mobile ? 36 : 68, color: C.ink, lh: mobile ? 36 : 66, align: "CENTER"
  }));
  panel.appendChild(hl);

  var cw = mobile ? w - 72 : 460;
  var ch = Math.round(cw * 0.75);
  var row = stack("Cards", mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 70 : 40);
  row.counterAxisAlignItems = "CENTER";
  row.appendChild(productCard("Bubblegum Drink", null, IMG.cardOne, true, cw, ch));
  row.appendChild(productCard("Flavour two", "Coming soon", IMG.cardSoon, false, cw, ch));
  panel.appendChild(row);

  panel.appendChild(btnSolid("Find a stockist"));
  show.appendChild(panel);
  page.appendChild(show);

  page.appendChild(footer(w, mobile));
  return page;
}

function buildAbout(w, mobile) {
  var page = frame(mobile ? "About / mobile" : "About / desktop", w, 100);
  page.layoutMode = "VERTICAL";
  page.counterAxisSizingMode = "FIXED";
  page.primaryAxisSizingMode = "AUTO";
  page.fills = [solid(C.cream)];
  page.clipsContent = true;

  var head = pageHead(w, mobile, "About us", "About KiddoFizz.",
    "The page is built and sits in the navigation. The words that go on it have to come from KiddoFizz.");
  head.layoutAlign = "STRETCH";
  var nav = navPill(w, mobile);
  nav.x = mobile ? 10 : 34; nav.y = 18;
  head.appendChild(nav);
  page.appendChild(head);

  var body = creamSection("Section / about body", w, mobile, mobile ? 56 : 92, mobile ? 64 : 110);
  body.layoutAlign = "STRETCH";
  body.itemSpacing = 28;
  var inner = w - (mobile ? 44 : 152);

  body.appendChild(noticeBox("Awaiting direction from the client.",
    "A company’s own account of itself — who founded it, why, and what it stands for — is the one part of a website that cannot be drafted on the client’s behalf.",
    inner));
  body.appendChild(sectionHeading(null, "What the page needs",
    "Each item below is a section already accounted for in the layout. As the client supplies them, they drop in without any rework to the design.",
    inner, mobile));

  var items = [
    ["1. Company background", "Who founded KiddoFizz, when the company was formed, and what prompted it."],
    ["2. Mission and positioning", "The case the brand wants to make to parents, in the client’s own words."],
    ["3. Production and sourcing", "Where the drink is made and bottled, and any certifications worth naming."],
    ["4. The people", "Names, roles and a short line each for anyone the client wants named."],
    ["5. Packaging and sustainability", "Any commitments the client is prepared to state publicly."],
    ["6. Proof points", "Retail listings, awards, press coverage or trade accreditations."]
  ];
  var per = mobile ? 1 : 3;
  var cardW = Math.floor((inner - (per - 1) * 14) / per);
  var nodes = [];
  for (var i = 0; i < items.length; i++) {
    nodes.push(panelCard(items[i][0], items[i][1], "Client to supply", null, cardW));
  }
  body.appendChild(grid("Requirements", nodes, per, 14));
  page.appendChild(body);

  page.appendChild(footer(w, mobile));
  return page;
}

function buildProducts(w, mobile) {
  var page = frame(mobile ? "Products / mobile" : "Products / desktop", w, 100);
  page.layoutMode = "VERTICAL";
  page.counterAxisSizingMode = "FIXED";
  page.primaryAxisSizingMode = "AUTO";
  page.fills = [solid(C.cream)];
  page.clipsContent = true;

  var head = pageHead(w, mobile, "Our range", "One drink.\nDone properly.",
    "Bubblegum flavour, caffeine free, in a 250ml bottle. A second flavour is on the way — this is where it will live.");
  head.layoutAlign = "STRETCH";
  var nav = navPill(w, mobile);
  nav.x = mobile ? 10 : 34; nav.y = 18;
  head.appendChild(nav);
  page.appendChild(head);

  var body = creamSection("Section / range", w, mobile, mobile ? 56 : 96, mobile ? 64 : 116);
  body.layoutAlign = "STRETCH";
  body.itemSpacing = mobile ? 48 : 80;
  var inner = w - (mobile ? 44 : 152);

  /* the one product */
  var item = stack("Range item / Bubblegum Drink", mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 24 : 56);
  item.counterAxisAlignItems = "CENTER";

  var shotW = mobile ? inner : Math.round(inner * 0.36);
  var shotBox = frame("Shot", shotW, mobile ? 340 : 470);
  var glow = ellipse("glow", 320, 320, glowField());
  glow.x = (shotW - 320) / 2;
  glow.y = (shotBox.height - 320) / 2;
  shotBox.appendChild(glow);
  var pbW = mobile ? 110 : 136;
  var pb = imageNode("Bottle", IMG.bottle, pbW, Math.round(pbW * 1095 / 340), "FIT");
  pb.x = (shotW - pbW) / 2;
  pb.y = (shotBox.height - pb.height) / 2;
  pb.effects = shadow(24, 32, "3C1E0A", 0.28);
  shotBox.appendChild(pb);
  item.appendChild(shotBox);

  var infoW = mobile ? inner : inner - shotW - 56;
  var info = stack("Info", "VERTICAL", 0);
  fixedWidth(info, infoW);
  info.appendChild(label("In stock now", { size: 11, color: C.brandGreen, ls: 18 }));
  var h2wrap = stack("h2", "VERTICAL", 0, { t: 10, b: 14 });
  h2wrap.appendChild(text("Bubblegum Drink", {
    font: F.roundBold, size: mobile ? 34 : 54, color: C.ink, lh: mobile ? 38 : 56, ls: -2, width: infoW
  }));
  info.appendChild(h2wrap);
  info.appendChild(text("The bottle they recognise on the shelf, with the flavour they actually ask for — and a back label that holds up to a proper read.",
    { size: 16, color: C.inkSoft, lh: 26, width: Math.min(infoW, 460) }));

  var chipData = [
    ["No caffeine", C.brandGreen], ["Low calories", C.brandOrange],
    ["Apple juice sugars", C.brandRed], ["Aspartame free", C.brandBlue],
    ["Vitamins B3, B5, B6 & C", C.brandGreen], ["Bubblegum flavour", C.brandOrange]
  ];
  var perRow = mobile ? 2 : 3;
  var chipW = Math.floor((Math.min(infoW, 560) - (perRow - 1) * 10) / perRow);
  var chips = [];
  for (var c = 0; c < chipData.length; c++) chips.push(glassCard(chipData[c][0], chipData[c][1], chipW));
  var chipWrap = stack("chips wrap", "VERTICAL", 0, { t: 20 });
  chipWrap.appendChild(grid("Claim chips", chips, perRow, 10));
  info.appendChild(chipWrap);

  var metaWrap = stack("meta wrap", "VERTICAL", 0, { t: 24 });
  var meta = stack("Specs", "HORIZONTAL", 28);
  var specs = [["Size", "250ml"], ["Formats", "Single · case of 12"], ["Bottle", "Recyclable PET"]];
  for (var m = 0; m < specs.length; m++) {
    var col = stack("spec", "VERTICAL", 5);
    col.appendChild(label(specs[m][0], { size: 10.5, color: C.inkSoft, ls: 16 }));
    col.appendChild(text(specs[m][1], { font: F.bodyBold, size: 15, color: C.ink }));
    meta.appendChild(col);
  }
  metaWrap.appendChild(meta);
  info.appendChild(metaWrap);

  var actWrap = stack("actions wrap", "VERTICAL", 0, { t: 28 });
  var acts = stack("Actions", "HORIZONTAL", 12);
  acts.appendChild(btnSolid("See full details"));
  acts.appendChild(btnLine("Find a stockist", false));
  actWrap.appendChild(acts);
  info.appendChild(actWrap);
  item.appendChild(info);
  body.appendChild(item);

  /* the empty slot */
  var soon = stack("Range item / Flavour two", mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 24 : 56);
  soon.counterAxisAlignItems = "CENTER";
  soon.opacity = 0.92;
  var ghostBox = frame("Ghost", shotW, mobile ? 300 : 400);
  var ghost = rect("ghost bottle", mobile ? 96 : 130, mobile ? 260 : 360, solid(C.ink, 0.03), 40);
  ghost.strokes = [solid(C.ink, 0.24)];
  ghost.strokeWeight = 3;
  ghost.dashPattern = [8, 7];
  ghost.x = (shotW - ghost.width) / 2;
  ghost.y = (ghostBox.height - ghost.height) / 2;
  ghostBox.appendChild(ghost);
  soon.appendChild(ghostBox);

  var sInfo = stack("Info", "VERTICAL", 0);
  fixedWidth(sInfo, infoW);
  sInfo.appendChild(label("Coming soon", { size: 11, color: C.inkSoft, ls: 18 }));
  var sh2 = stack("h2", "VERTICAL", 0, { t: 10, b: 14 });
  sh2.appendChild(text("Flavour two", {
    font: F.roundBold, size: mobile ? 34 : 54, color: C.inkSoft, lh: mobile ? 38 : 56, ls: -2, width: infoW
  }));
  sInfo.appendChild(sh2);
  sInfo.appendChild(text("The range is built for more than one. When the second flavour lands it slots in here, same format, same label rules.",
    { size: 16, color: C.inkSoft, lh: 26, width: Math.min(infoW, 460) }));
  var sAct = stack("actions wrap", "VERTICAL", 0, { t: 28 });
  sAct.appendChild(btnLine("Tell me when it lands", false));
  sInfo.appendChild(sAct);
  soon.appendChild(sInfo);
  body.appendChild(soon);

  page.appendChild(body);
  page.appendChild(footer(w, mobile));
  return page;
}

function buildProduct(w, mobile) {
  var page = frame(mobile ? "Product detail / mobile" : "Product detail / desktop", w, 100);
  page.layoutMode = "VERTICAL";
  page.counterAxisSizingMode = "FIXED";
  page.primaryAxisSizingMode = "AUTO";
  page.fills = [solid(C.cream)];
  page.clipsContent = true;

  var inner = w - (mobile ? 44 : 152);

  /* ---- red hero with the gallery */
  var hh = mobile ? 900 : 760;
  var hero = frame("Section / product hero", w, hh);
  hero.fills = [redField()];
  hero.clipsContent = true;
  hero.layoutAlign = "STRETCH";
  bubbleField(hero, w, hh, mobile ? 8 : 14, 5);

  var galleryW = mobile ? inner : Math.round(inner * 0.42);
  var gallery = stack("Gallery", "VERTICAL", 12);
  fixedWidth(gallery, galleryW);

  var frameBox = frame("Framed image", galleryW, mobile ? 330 : 440);
  frameBox.cornerRadius = 22;
  frameBox.fills = [solid(C.white, 0.07)];
  frameBox.strokes = [solid(C.white, 0.3)];
  frameBox.strokeWeight = 1;
  frameBox.clipsContent = true;
  var gbW = mobile ? 110 : 132;
  var gb = imageNode("Bottle — single", IMG.bottle, gbW, Math.round(gbW * 1095 / 340), "FIT");
  gb.x = (galleryW - gbW) / 2;
  gb.y = (frameBox.height - gb.height) / 2;
  gb.effects = shadow(26, 36, "280406", 0.45);
  frameBox.appendChild(gb);
  gallery.appendChild(frameBox);

  var thumbs = stack("Thumbnails", "HORIZONTAL", 10);
  var thumbW = Math.floor((galleryW - 30) / 4);
  var thumbData = [["Single", IMG.bottle, true], ["Case of 12", IMG.case_, false],
                   ["Chilled", IMG.hero, false], ["To come", null, false]];
  for (var t = 0; t < thumbData.length; t++) {
    var th = stack("Thumb / " + thumbData[t][0], "VERTICAL", 7, { t: 10, b: 9, l: 6, r: 6 });
    th.cornerRadius = 14;
    th.counterAxisAlignItems = "CENTER";
    fixedWidth(th, thumbW);
    if (thumbData[t][2]) {
      th.fills = [solid(C.white, 0.96)];
      th.strokes = [solid(C.white)];
    } else {
      th.fills = [solid(C.white, 0.06)];
      th.strokes = [solid(C.white, 0.26)];
      if (thumbData[t][1] === null) th.dashPattern = [5, 4];
    }
    th.strokeWeight = 1;
    if (thumbData[t][1]) {
      var tw = thumbData[t][0] === "Single" ? 16 : 44;
      th.appendChild(imageNode("img", thumbData[t][1], tw, 46, "FIT"));
    } else {
      th.appendChild(text("+", { size: 20, color: C.white, opacity: 0.5, lh: 46 }));
    }
    th.appendChild(label(thumbData[t][0], {
      size: 9.5, ls: 6, color: thumbData[t][2] ? C.ink : C.white, align: "CENTER"
    }));
    thumbs.appendChild(th);
  }
  gallery.appendChild(thumbs);

  var infoW = mobile ? inner : inner - galleryW - 60;
  var info = stack("Info", "VERTICAL", 0);
  fixedWidth(info, infoW);
  info.appendChild(label("Home / Products / Bubblegum Drink", { size: 11.5, color: C.white, opacity: 0.7, ls: 12 }));
  var h1w = stack("h1", "VERTICAL", 0, { t: 18, b: 16 });
  h1w.appendChild(text("BUBBLEGUM DRINK", {
    font: F.display, size: mobile ? 46 : 78, color: C.white, lh: mobile ? 46 : 76, ls: -1.5, width: infoW
  }));
  info.appendChild(h1w);
  info.appendChild(text("A caffeine-free bubblegum drink in a 250ml bottle. The shape they recognise on the shelf, with a back label that holds up to a proper read.",
    { size: 16, color: C.white, opacity: 0.88, lh: 26, width: Math.min(infoW, 460) }));

  var pmWrap = stack("meta wrap", "VERTICAL", 0, { t: 24 });
  var pmeta = stack("Specs", "HORIZONTAL", 28);
  var pspecs = [["Size", "250ml"], ["Formats", "Single · case of 12"], ["Bottle", "Recyclable PET"]];
  for (var pm = 0; pm < pspecs.length; pm++) {
    var pcol = stack("spec", "VERTICAL", 5);
    pcol.appendChild(label(pspecs[pm][0], { size: 10.5, color: C.white, opacity: 0.7, ls: 16 }));
    pcol.appendChild(text(pspecs[pm][1], { font: F.bodyBold, size: 15, color: C.white }));
    pmeta.appendChild(pcol);
  }
  pmWrap.appendChild(pmeta);
  info.appendChild(pmWrap);

  var paWrap = stack("actions wrap", "VERTICAL", 12, { t: 26 });
  var pacts = stack("Actions", "HORIZONTAL", 12);
  pacts.appendChild(btnSolid("Find a stockist"));
  pacts.appendChild(btnLine("See nutrition", true));
  paWrap.appendChild(pacts);
  paWrap.appendChild(label("Sold through retailers — there is no direct checkout.",
    { size: 11.5, color: C.white, opacity: 0.66, ls: 9 }));
  info.appendChild(paWrap);

  var heroRow = stack("Hero content", mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 26 : 60);
  heroRow.counterAxisAlignItems = "CENTER";
  if (mobile) { heroRow.appendChild(info); heroRow.appendChild(gallery); }
  else { heroRow.appendChild(gallery); heroRow.appendChild(info); }
  heroRow.x = mobile ? 22 : 76;
  heroRow.y = mobile ? 130 : 150;
  hero.appendChild(heroRow);

  var nav2 = navPill(w, mobile);
  nav2.x = mobile ? 10 : 34; nav2.y = 18;
  hero.appendChild(nav2);
  var psc = scallop(w, "up", 34);
  psc.x = 0; psc.y = hh - psc.height;
  hero.appendChild(psc);
  page.appendChild(hero);

  /* ---- nutrition, first */
  var nut = creamSection("Section / nutrition", w, mobile, mobile ? 56 : 92, mobile ? 44 : 68);
  nut.layoutAlign = "STRETCH";
  nut.itemSpacing = 26;
  nut.appendChild(sectionHeading("Nutrition", "Per 100ml and per bottle.", null, inner, mobile));

  var tbl = stack("Nutrition table", "VERTICAL", 0);
  tbl.cornerRadius = 18;
  tbl.clipsContent = true;
  tbl.fills = [solid(C.white)];
  tbl.effects = shadow(12, 28, "3C1E0A", 0.09);
  var tblW = mobile ? inner : Math.min(inner, 900);
  fixedWidth(tbl, tblW);
  var colW = [Math.round(tblW * 0.4), Math.round(tblW * 0.2), Math.round(tblW * 0.24), Math.round(tblW * 0.16)];

  function tRow(cells, kind) {
    var r = stack("row", "HORIZONTAL", 0, { t: 13, b: 13, l: 16, r: 16 });
    r.primaryAxisSizingMode = "FIXED";
    r.resize(tblW, r.height);
    if (kind === "head") r.fills = [solid(C.ink)];
    else if (kind === "group") r.fills = [solid(C.ink, 0.05)];
    else r.fills = [];
    for (var i = 0; i < cells.length; i++) {
      // a blank cell still has to hold its column, but an empty TEXT layer is
      // clutter in the layers panel — use an invisible spacer instead
      if (!cells[i]) {
        r.appendChild(rect("empty cell", colW[i], 1, null));
        continue;
      }
      var isHead = kind === "head";
      var t = text(cells[i], {
        font: isHead ? F.bodyExtra : (i === 0 ? F.bodyBold : F.body),
        size: isHead ? 11 : 13.5,
        ls: isHead ? 10 : 0,
        color: isHead ? C.cream : (i === 0 ? C.ink : C.inkSoft),
        align: i === 0 ? "LEFT" : "RIGHT",
        width: colW[i] - (i === 0 ? 0 : 8)
      });
      if (kind === "sub" && i === 0) t.fills = [solid(C.inkSoft)];
      r.appendChild(t);
    }
    return r;
  }

  tbl.appendChild(tRow(["TYPICAL VALUES", "PER 100ML", "PER BOTTLE (250ML)", "%NRV*"], "head"));
  var rows = [
    ["Energy", 0], ["Fat", 0], ["of which saturates", 1], ["Carbohydrate", 0],
    ["of which sugars", 1], ["Protein", 0], ["Salt", 0]
  ];
  for (var r0 = 0; r0 < rows.length; r0++) {
    tbl.appendChild(tRow([(rows[r0][1] ? "    " : "") + rows[r0][0], "—", "—", ""], rows[r0][1] ? "sub" : null));
  }
  tbl.appendChild(tRow(["VITAMINS", "", "", ""], "group"));
  var vits = ["Vitamin C", "Niacin (B3)", "Pantothenic acid (B5)", "Vitamin B6", "Folic acid"];
  for (var v = 0; v < vits.length; v++) tbl.appendChild(tRow([vits[v], "—", "—", "—"], null));
  nut.appendChild(tbl);

  nut.appendChild(noticeBox("Every figure is deliberately blank.",
    "Nutrition data is a legal declaration and will be filled in from KiddoFizz’s own certified figures. Nothing on this page is estimated or invented.",
    inner));
  page.appendChild(nut);

  /* ---- claims, second */
  var ins = creamSection("Section / on the label", w, mobile, mobile ? 44 : 68, mobile ? 44 : 68);
  ins.layoutAlign = "STRETCH";
  ins.itemSpacing = 28;
  ins.appendChild(sectionHeading("On the label", "Everything it claims, in its own words.",
    "These are the nine claims printed on the bottle, transcribed exactly.", inner, mobile));

  var claims = [
    ["01", "No caffeine", null, C.brandGreen], ["02", "Low calories", null, C.brandOrange],
    ["03", "Apple juice", "— sugars from apple juice", C.brandRed],
    ["04", "Aspartame free", null, C.brandBlue], ["05", "Vitamin C", null, C.brandYellow],
    ["06", "Vitamin B3", "(niacin)", C.brandGreen],
    ["07", "Vitamin B5", "(pantothenic acid)", C.brandBlue],
    ["08", "Vitamin B6", "& folic acid", C.brandOrange],
    ["09", "Bubble gum flavour", null, C.brandRed]
  ];
  var cPer = mobile ? 1 : 3;
  var cW = Math.floor((inner - (cPer - 1) * 12) / cPer);
  var cNodes = [];
  for (var cc = 0; cc < claims.length; cc++) {
    cNodes.push(claimCard(claims[cc][0], claims[cc][1], claims[cc][2], claims[cc][3], cW));
  }
  ins.appendChild(grid("Label claims", cNodes, cPer, 12));

  var twoPer = mobile ? 1 : 2;
  var twoW = Math.floor((inner - (twoPer - 1) * 14) / twoPer);
  ins.appendChild(grid("Ingredients + allergens", [
    panelCard("Ingredients", null, "[ FULL INGREDIENTS LIST TO BE SUPPLIED BY KIDDOFIZZ ]",
      "Taken verbatim from the printed label once supplied. Nothing here is paraphrased.", twoW),
    panelCard("Allergens", null, "[ ALLERGEN STATEMENT TO BE CONFIRMED ]",
      "Allergen information is a legal declaration, so it goes on the page exactly as it appears on the pack.", twoW)
  ], twoPer, 14));
  page.appendChild(ins);

  /* ---- FAQ */
  var faq = creamSection("Section / FAQ", w, mobile, mobile ? 44 : 68, mobile ? 64 : 110);
  faq.layoutAlign = "STRETCH";
  faq.itemSpacing = 26;
  faq.appendChild(sectionHeading(null, "The questions we actually get.", null, inner, mobile));

  var qs = [
    ["Is it really caffeine free?",
     "Yes. The bottle carries a “no caffeine” claim on the front label — there is none in the recipe, so there is no buzz before bedtime and no crash after it."],
    ["Where does the sweetness come from?", null],
    ["What age is it suitable for?", null],
    ["What vitamins are in it, and how much?", null],
    ["Is the bottle recyclable?", null],
    ["Where can I buy it?", null]
  ];
  var list = stack("FAQ list", "VERTICAL", 10);
  for (var q = 0; q < qs.length; q++) {
    var row = stack("FAQ / " + qs[q][0], "VERTICAL", 12, { t: 17, b: qs[q][1] ? 18 : 17, l: 20, r: 20 });
    row.cornerRadius = 16;
    row.fills = [solid(C.white)];
    row.effects = shadow(10, 24, "3C1E0A", 0.08);
    fixedWidth(row, inner);
    var top = stack("q", "HORIZONTAL", 12);
    top.primaryAxisSizingMode = "FIXED";
    top.resize(inner - 40, top.height);
    top.primaryAxisAlignItems = "SPACE_BETWEEN";
    top.counterAxisAlignItems = "CENTER";
    top.appendChild(text(qs[q][0], { font: F.roundMed, size: 16, color: C.ink, width: inner - 90 }));
    var chev = rect("chevron", 11, 11, null);
    chev.strokes = [solid(C.brandRed)];
    chev.strokeWeight = 2.5;
    top.appendChild(chev);
    row.appendChild(top);
    if (qs[q][1]) row.appendChild(text(qs[q][1], { size: 13.5, color: C.inkSoft, lh: 22, width: inner - 40 }));
    list.appendChild(row);
  }
  faq.appendChild(list);
  page.appendChild(faq);

  page.appendChild(footer(w, mobile));
  return page;
}

function buildContact(w, mobile) {
  var page = frame(mobile ? "Contact / mobile" : "Contact / desktop", w, 100);
  page.layoutMode = "VERTICAL";
  page.counterAxisSizingMode = "FIXED";
  page.primaryAxisSizingMode = "AUTO";
  page.fills = [solid(C.cream)];
  page.clipsContent = true;

  var head = pageHead(w, mobile, "Contact", "Say hello.",
    "Questions about what is in the bottle, where to buy it, or getting KiddoFizz onto your shelves — this is the place.");
  head.layoutAlign = "STRETCH";
  var nav = navPill(w, mobile);
  nav.x = mobile ? 10 : 34; nav.y = 18;
  head.appendChild(nav);
  page.appendChild(head);

  var body = creamSection("Section / contact body", w, mobile, mobile ? 56 : 92, mobile ? 64 : 116);
  body.layoutAlign = "STRETCH";
  var inner = w - (mobile ? 44 : 152);

  var cols = stack("Columns", mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 34 : 64);
  cols.counterAxisAlignItems = "MIN";

  var formW = mobile ? inner : Math.round(inner * 0.58);
  var left = stack("Form column", "VERTICAL", 26);
  fixedWidth(left, formW);

  var fhead = stack("Heading", "VERTICAL", 8);
  fhead.appendChild(text("Send us a message", {
    font: F.roundBold, size: mobile ? 30 : 44, color: C.ink, lh: mobile ? 34 : 46, ls: -2, width: formW
  }));
  fhead.appendChild(text("We answer within two working days.", { size: 14.5, color: C.inkSoft }));
  left.appendChild(fhead);

  var card = stack("Form card", "VERTICAL", 16, { t: 32, b: 32, l: 32, r: 32 });
  card.cornerRadius = 22;
  card.fills = [solid(C.white)];
  card.effects = shadow(16, 40, "3C1E0A", 0.10);
  fixedWidth(card, formW);
  var fieldW = formW - 64;

  function field(name, placeholder, w2, h2) {
    var f = stack("Field / " + name, "VERTICAL", 7);
    fixedWidth(f, w2);
    f.appendChild(label(name, { size: 11.5, color: C.inkSoft, ls: 11 }));
    var box = stack("input", "VERTICAL", 0, { t: 13, b: 13, l: 15, r: 15 });
    box.cornerRadius = 13;
    box.fills = [solid(C.cream)];
    box.strokes = [solid(C.line)];
    box.strokeWeight = 1.5;
    lockSize(box, w2, h2 || 48);
    box.appendChild(text(placeholder, { size: 15, color: "A99C92" }));
    f.appendChild(box);
    return f;
  }

  var two = stack("row", "HORIZONTAL", 16);
  var halfW = Math.floor((fieldW - 16) / 2);
  two.appendChild(field("First name", "Jamie", halfW));
  two.appendChild(field("Last name", "Whitfield", halfW));
  card.appendChild(two);
  card.appendChild(field("Email", "you@example.co.uk", fieldW));
  card.appendChild(field("What is this about?", "Ingredients and allergens", fieldW));
  card.appendChild(field("Message", "Tell us what you need…", fieldW, 118));
  var sendWrap = stack("send", "VERTICAL", 10, { t: 4 });
  sendWrap.appendChild(btnSolid("Send message"));
  sendWrap.appendChild(text("Prototype — this form is not connected to anything and sends nothing.",
    { size: 12, color: C.inkSoft, width: fieldW }));
  card.appendChild(sendWrap);
  left.appendChild(card);
  cols.appendChild(left);

  var asideW = mobile ? inner : inner - formW - 64;
  var aside = stack("Aside", "VERTICAL", 14);
  fixedWidth(aside, asideW);
  /* aligned with the form card, not the heading above it — the same two-row
     arrangement the built page uses */
  if (!mobile) {
    // holds the aside level with the form card rather than the heading above it
    aside.appendChild(frame("align to form card", asideW, 92));
  }

  var contacts = [
    ["For families", "Ingredients, allergens, vitamins, or anything else on the label.", "hello@kiddofizz.co.uk", C.brandGreen, false],
    ["For retailers", "Wholesale, cases of 12 × 250ml, and trade enquiries.", "trade@kiddofizz.co.uk", C.brandBlue, false],
    ["Press", "Samples, images and interview requests.", "press@kiddofizz.co.uk", C.brandOrange, true]
  ];
  for (var i = 0; i < contacts.length; i++) {
    var cc2 = stack("Contact card / " + contacts[i][0], "VERTICAL", 12, { t: 18, b: 18, l: 18, r: 18 });
    cc2.cornerRadius = 20;
    cc2.fills = [solid(contacts[i][3])];
    fixedWidth(cc2, asideW);
    cc2.appendChild(text(contacts[i][0], {
      font: F.roundMed, size: 17, color: contacts[i][4] ? C.ink : C.white
    }));
    var inbox = stack("body", "VERTICAL", 0, { t: 12, b: 12, l: 14, r: 14 });
    inbox.cornerRadius = 12;
    inbox.fills = [solid(C.white)];
    fixedWidth(inbox, asideW - 36);
    inbox.appendChild(text(contacts[i][1], { size: 13.5, color: C.ink, lh: 21, width: asideW - 64 }));
    cc2.appendChild(inbox);
    cc2.appendChild(text(contacts[i][2], {
      font: F.bodyExtra, size: 13.5, color: contacts[i][4] ? C.ink : C.white
    }));
    aside.appendChild(cc2);
  }

  var addr = stack("Registered office", "VERTICAL", 8, { t: 18, b: 18, l: 18, r: 18 });
  addr.cornerRadius = 20;
  addr.fills = [];
  addr.strokes = [solid(C.ink, 0.2)];
  addr.strokeWeight = 1.5;
  addr.dashPattern = [6, 5];
  fixedWidth(addr, asideW);
  addr.appendChild(text("Registered office", { font: F.bodyExtra, size: 14, color: C.ink }));
  addr.appendChild(text("KiddoFizz Ltd\n[ REGISTERED ADDRESS ]\nUnited Kingdom",
    { size: 13.5, color: C.inkSoft, lh: 21 }));
  addr.appendChild(label("Company no. [ TBC ]", { size: 12, color: C.inkSoft, ls: 6 }));
  aside.appendChild(addr);

  cols.appendChild(aside);
  body.appendChild(cols);
  page.appendChild(body);

  page.appendChild(footer(w, mobile));
  return page;
}

/* Image bytes. build.mjs replaces this line with the real base64 payload — the
   source keeps empty strings so it can be checked and mock-run as-is. */
var B64 = { logo: "", bottle: "", hero: "", case_: "", cardOne: "", cardSoon: "" };

/* =========================================================================
   Styles, images, and the run itself
   ========================================================================= */

/* Figma's sandbox has no atob, and figma.base64Decode only exists on newer
   API versions — so carry a decoder. */
function b64ToBytes(s) {
  if (typeof figma.base64Decode === "function") {
    try { return figma.base64Decode(s); } catch (e) { /* fall through */ }
  }
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  var len = s.length;
  var pad = s.charAt(len - 1) === "=" ? (s.charAt(len - 2) === "=" ? 2 : 1) : 0;
  var n = (len / 4) * 3 - pad;
  var bytes = new Uint8Array(n);
  var p = 0;
  for (var j = 0; j < len; j += 4) {
    var e1 = lookup[s.charCodeAt(j)], e2 = lookup[s.charCodeAt(j + 1)];
    var e3 = lookup[s.charCodeAt(j + 2)], e4 = lookup[s.charCodeAt(j + 3)];
    if (p < n) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < n) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < n) bytes[p++] = ((e3 & 3) << 6) | e4;
  }
  return bytes;
}

var IMG = {};

function loadImages() {
  IMG.logo = figma.createImage(b64ToBytes(B64.logo)).hash;
  IMG.bottle = figma.createImage(b64ToBytes(B64.bottle)).hash;
  IMG.hero = figma.createImage(b64ToBytes(B64.hero)).hash;
  IMG.case_ = figma.createImage(b64ToBytes(B64.case_)).hash;
  IMG.cardOne = figma.createImage(b64ToBytes(B64.cardOne)).hash;
  IMG.cardSoon = figma.createImage(b64ToBytes(B64.cardSoon)).hash;
}

var STYLE = { paint: {}, text: {} };

function makePaintStyles() {
  var defs = [
    ["Brand / Red", C.red], ["Brand / Red deep", C.redDeep], ["Brand / Red lift", C.redLift],
    ["Brand / Cream", C.cream], ["Brand / Ink", C.ink], ["Brand / Ink soft", C.inkSoft],
    ["Logo / Red", C.brandRed], ["Logo / Orange", C.brandOrange], ["Logo / Green", C.brandGreen],
    ["Logo / Blue", C.brandBlue], ["Logo / Yellow", C.brandYellow],
    ["Surface / White", C.white], ["Surface / Field line", C.line]
  ];
  for (var i = 0; i < defs.length; i++) {
    var s = figma.createPaintStyle();
    s.name = defs[i][0];
    s.paints = [solid(defs[i][1])];
    STYLE.paint[defs[i][0]] = s;
  }
  var g = figma.createPaintStyle();
  g.name = "Surface / Red field";
  g.paints = [redField()];
  STYLE.paint["Surface / Red field"] = g;
}

function makeTextStyles() {
  var defs = [
    ["Display / Hero", F.display, 220, 190, -1.5],
    ["Display / H1", F.display, 108, 98, -1.5],
    ["Heading / H2", F.roundBold, 46, 50, -2],
    ["Heading / H3", F.roundMed, 17, 22, 0],
    ["Body / Lede", F.body, 17, 27, 0],
    ["Body / Default", F.body, 15, 24, 0],
    ["Body / Small", F.body, 13.5, 21, 0],
    ["Label / Eyebrow", F.bodyExtra, 11.5, 16, 22],
    ["Label / Button", F.bodyExtra, 12.5, 16, 13],
    ["Label / Meta", F.bodyExtra, 10.5, 14, 16]
  ];
  for (var i = 0; i < defs.length; i++) {
    var s = figma.createTextStyle();
    s.name = defs[i][0];
    s.fontName = defs[i][1];
    s.fontSize = defs[i][2];
    s.lineHeight = { value: defs[i][3], unit: "PIXELS" };
    s.letterSpacing = { value: defs[i][4], unit: "PERCENT" };
    STYLE.text[defs[i][0]] = s;
  }
}

/* A cover board so whoever opens the file knows what it is and what is still
   waiting on the client. */
function buildCover() {
  var f = stack("00 — Read me", "VERTICAL", 22, { t: 56, b: 56, l: 56, r: 56 });
  f.fills = [solid(C.cream)];
  fixedWidth(f, 720);
  f.name = "00 — Read me";

  f.appendChild(text("KIDDOFIZZ DRINKS", { font: F.display, size: 64, color: C.ink, lh: 62, ls: -1 }));
  f.appendChild(text("Website design — pitch stage", { font: F.roundMed, size: 22, color: C.inkSoft }));

  var notes = [
    ["Built by plugin", "Generated from the working prototype, so the type scale, spacing and colour match the live build exactly rather than being redrawn by eye."],
    ["Styles", "Colour and text styles are real Figma styles — change one and it propagates. Named to match the CSS custom properties in the prototype."],
    ["What is deliberately blank", "Nutrition figures, ingredients, allergens, age guidance, registered address and company number. These are legal declarations and are never invented — they come from KiddoFizz."],
    ["Product name", "“Bubblegum Drink” is placeholder wording pending the client's real product name."],
    ["Not represented", "Scroll animation. Figma holds the end state of each section; the motion lives in the HTML prototype."]
  ];
  for (var i = 0; i < notes.length; i++) {
    var row = stack("note", "VERTICAL", 6);
    fixedWidth(row, 608);
    row.appendChild(label(notes[i][0], { size: 11.5, color: C.brandRed, ls: 20 }));
    row.appendChild(text(notes[i][1], { size: 15, color: C.ink, lh: 24, width: 608 }));
    f.appendChild(row);
  }

  var sw = stack("Palette", "HORIZONTAL", 10, { t: 12 });
  var pal = [C.brandRed, C.brandOrange, C.brandGreen, C.brandBlue, C.brandYellow, C.red, C.cream, C.ink];
  for (var p = 0; p < pal.length; p++) {
    var chip = rect("swatch", 62, 62, solid(pal[p]), 14);
    if (pal[p] === C.cream) { chip.strokes = [solid(C.ink, 0.15)]; chip.strokeWeight = 1; }
    sw.appendChild(chip);
  }
  f.appendChild(sw);
  return f;
}

async function main() {
  await loadFonts();
  loadImages();
  makePaintStyles();
  makeTextStyles();

  var page = figma.createPage();
  page.name = "KiddoFizz — Website design";
  figma.currentPage = page;

  var made = [];
  var cover = buildCover();
  cover.x = 0; cover.y = 0;
  page.appendChild(cover);
  made.push(cover);

  var builders = [
    ["Home", buildHome], ["About", buildAbout], ["Products", buildProducts],
    ["Product detail", buildProduct], ["Contact", buildContact]
  ];

  var x = 900;
  for (var i = 0; i < builders.length; i++) {
    var d = builders[i][1](1440, false);
    d.x = x; d.y = 0;
    page.appendChild(d);
    made.push(d);

    var m = builders[i][1](390, true);
    m.x = x + 1440 + 90;
    m.y = 0;
    page.appendChild(m);
    made.push(m);

    x += 1440 + 90 + 390 + 220;
  }

  figma.viewport.scrollAndZoomIntoView(made);

  var msg = "Built " + (made.length - 1) + " page frames, " +
    Object.keys(STYLE.paint).length + " colour styles and " +
    Object.keys(STYLE.text).length + " text styles.";
  if (missingFonts.length) msg += " Substituted fonts: " + missingFonts.join(", ") + ".";
  figma.closePlugin(msg);
}

main().catch(function (e) {
  figma.closePlugin("KiddoFizz builder failed: " + (e && e.message ? e.message : String(e)));
});
