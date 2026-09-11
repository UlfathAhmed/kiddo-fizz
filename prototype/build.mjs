// Inlines the prototype into a single self-contained index.html.
// Artifacts enforce a strict CSP with no external scripts, so Three.js and GSAP
// have to ride along in the file rather than come from a CDN.
// Run:  node build.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(D, ...p), "utf8");

// split/join, never replace(): minified library source contains $& and $' which
// replace() would interpret as substitution patterns and silently corrupt.
const put = (haystack, needle, value) => {
  if (!haystack.includes(needle)) throw new Error("placeholder not found: " + needle);
  return haystack.split(needle).join(value);
};

const TICK =
  '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
  'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M13.5 4.5 6.5 11.5 3 8"/></svg>';

let three = read("vendor", "three.min.js");
// r160's UMD build opens with a deprecation console.warn spliced onto the module
// via a comma expression. Neutralise the call without breaking the expression, so
// the published page boots with a clean console.
const warnAt = three.indexOf("console.warn(");
if (warnAt !== -1 && warnAt < 400) {
  three = three.slice(0, warnAt) + "(function(){})(" + three.slice(warnAt + "console.warn(".length);
}

let html = read("src", "page.html");
html = put(html, "/* @STYLES@ */", read("src", "styles.css"));
html = put(html, "<!-- @TICK@ -->", TICK);
html = put(html, "/* @THREE@ */", three);
html = put(html, "/* @GSAP@ */", read("vendor", "gsap.min.js"));
html = put(html, "/* @SCROLLTRIGGER@ */", read("vendor", "ScrollTrigger.min.js"));
html = put(html, "/* @APP@ */", read("src", "app.js"));

const out = join(D, "index.html");
writeFileSync(out, html, "utf8");
writeFileSync(join(D, "preview.html"), "<!doctype html>\n" + html, "utf8");
const kb = (statSync(out).size / 1024).toFixed(0);
console.log("built index.html (" + kb + " KB, limit 16384 KB) + preview.html for local testing");
