/* A stand-in for Figma's plugin API, good enough to run the builder end to end
   in Node. It cannot prove the file LOOKS right, but it catches every typo,
   undefined variable, bad method name and NaN coordinate before Figma sees it. */
import { readFileSync } from "node:fs";

const SRC = process.argv[2] || "G:/KiddoFizzCola/figma-plugin/src/code.src.js";

/* fonts the mock pretends to have installed — deliberately missing Fredoka so the
   fallback path gets exercised too */
const INSTALLED = [
  "Anton|Regular", "Inter|Regular", "Inter|Bold", "Inter|Semi Bold",
  "Plus Jakarta Sans|Regular", "Plus Jakarta Sans|SemiBold",
  "Plus Jakarta Sans|Bold", "Plus Jakarta Sans|ExtraBold",
  "Fredoka|Bold", "Fredoka|SemiBold"
];

let nodeCount = 0;
const allNodes = [];

function baseNode(type) {
  const n = {
    type, id: "n" + (++nodeCount), name: type,
    x: 0, y: 0, width: 100, height: 100, opacity: 1,
    fills: [], strokes: [], strokeWeight: 1, effects: [],
    children: [], parent: null,
    resize(w, h) {
      if (!isFinite(w) || !isFinite(h)) throw new Error(`resize(${w}, ${h}) on ${this.name}`);
      if (w < 0.01 || h < 0.01) throw new Error(`resize below Figma minimum: ${w}x${h} on ${this.name}`);
      this.width = w; this.height = h;
      bubble(this);
    },
    appendChild(c) {
      if (!c) throw new Error("appendChild(undefined) on " + this.name);
      c.parent = this;
      this.children.push(c);
      bubble(this);
    }
  };
  allNodes.push(n);
  return n;
}

function recompute(node) {
  if (!node.layoutMode || node.layoutMode === "NONE") return;
  const kids = node.children;
  const gap = node.itemSpacing || 0;
  let main = 0, cross = 0;
  for (const k of kids) {
    const w = k.width || 0, h = k.height || 0;
    if (node.layoutMode === "HORIZONTAL") { main += w; cross = Math.max(cross, h); }
    else { main += h; cross = Math.max(cross, w); }
  }
  if (kids.length > 1) main += gap * (kids.length - 1);
  const padH = (node.paddingLeft || 0) + (node.paddingRight || 0);
  const padV = (node.paddingTop || 0) + (node.paddingBottom || 0);
  if (node.layoutMode === "HORIZONTAL") {
    if (node.primaryAxisSizingMode !== "FIXED") node.width = main + padH;
    if (node.counterAxisSizingMode !== "FIXED") node.height = cross + padV;
  } else {
    if (node.primaryAxisSizingMode !== "FIXED") node.height = main + padV;
    if (node.counterAxisSizingMode !== "FIXED") node.width = cross + padH;
  }
}

function bubble(node) {
  let n = node;
  let guard = 0;
  while (n && guard++ < 200) { recompute(n); n = n.parent; }
}

function makeFrame() {
  const f = baseNode("FRAME");
  f.layoutMode = "NONE";
  f.itemSpacing = 0;
  f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = 0;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.clipsContent = false;
  return f;
}

function makeText() {
  const t = baseNode("TEXT");
  t._chars = "";
  t.fontSize = 12;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  Object.defineProperty(t, "characters", {
    get() { return this._chars; },
    set(v) {
      if (!this.fontName) throw new Error("characters set before fontName on " + this.id);
      this._chars = String(v);
      remeasure(this);
    }
  });
  Object.defineProperty(t, "fontSize", {
    get() { return this._size || 12; },
    set(v) { this._size = v; remeasure(this); }
  });
  return t;
}

function remeasure(t) {
  const lines = String(t._chars || "").split("\n");
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const size = t._size || 12;
  if (t.textAutoResize === "WIDTH_AND_HEIGHT") t.width = Math.max(1, longest * size * 0.55);
  t.height = Math.max(1, lines.length * size * 1.25);
  bubble(t);
}

const loadedFonts = new Set();

const figma = {
  createFrame: makeFrame,
  createText: makeText,
  createRectangle: () => baseNode("RECTANGLE"),
  createEllipse: () => baseNode("ELLIPSE"),
  createImage(bytes) {
    if (!(bytes instanceof Uint8Array)) throw new Error("createImage needs a Uint8Array, got " + typeof bytes);
    return { hash: "img" + Math.random().toString(36).slice(2, 10) };
  },
  createPage() {
    const p = baseNode("PAGE");
    p.appendChild = function (c) { c.parent = null; this.children.push(c); };
    return p;
  },
  createPaintStyle: () => ({ id: "S" + (++nodeCount), name: "", paints: [] }),
  createTextStyle: () => ({ id: "T" + (++nodeCount), name: "", fontName: null, fontSize: 0 }),
  async loadFontAsync(f) {
    const key = f.family + "|" + f.style;
    if (!INSTALLED.includes(key)) throw new Error("font not available: " + key);
    loadedFonts.add(key);
  },
  viewport: { scrollAndZoomIntoView(nodes) { if (!Array.isArray(nodes)) throw new Error("scrollAndZoomIntoView needs an array"); } },
  currentPage: null,
  closePlugin(msg) { figma.__closed = msg; }
};

const src = readFileSync(SRC, "utf8");
const run = new Function("figma", src + "\n//# sourceURL=code.src.js");

try {
  run(figma);
} catch (e) {
  console.error("THREW SYNCHRONOUSLY:", e.stack || e);
  process.exit(1);
}

/* main() is async; give the microtasks a chance to drain */
await new Promise((r) => setTimeout(r, 200));

if (!figma.__closed) {
  console.error("plugin never called closePlugin — it probably hung or threw silently");
  process.exit(1);
}
if (/failed/i.test(figma.__closed)) {
  console.error("PLUGIN REPORTED FAILURE:", figma.__closed);
  process.exit(1);
}

/* geometry sanity */
const bad = allNodes.filter((n) =>
  !isFinite(n.x) || !isFinite(n.y) || !isFinite(n.width) || !isFinite(n.height) ||
  n.width <= 0 || n.height <= 0
);

const frames = allNodes.filter((n) => n.type === "FRAME");
const texts = allNodes.filter((n) => n.type === "TEXT");
const emptyText = texts.filter((t) => !t._chars || !t._chars.trim());

console.log("closePlugin:", figma.__closed);
console.log("nodes:", allNodes.length, "| frames:", frames.length, "| text:", texts.length);
console.log("fonts actually loaded:", [...loadedFonts].join(", "));
console.log("bad geometry:", bad.length, bad.slice(0, 5).map((n) => n.name + " " + n.width + "x" + n.height));
console.log("empty text nodes:", emptyText.length);

if (bad.length) { console.error("FAIL: nodes with invalid geometry"); process.exit(1); }
console.log("\nMOCK RUN PASSED");
