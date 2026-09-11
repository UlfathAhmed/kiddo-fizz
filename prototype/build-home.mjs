// Inlines the home page into a single self-contained file.
// No Three.js: the product is 2D. GSAP is here for the scroll hand-off.
// Run:  node build-home.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(D, ...p), "utf8");

// split/join, never replace(): $& and $' in inlined content would be treated as
// substitution patterns and silently corrupt the output.
const put = (hay, needle, value) => {
  if (!hay.includes(needle)) throw new Error("placeholder not found: " + needle);
  return hay.split(needle).join(value);
};

const dataUri = (file, mime) =>
  "data:" + mime + ";base64," + readFileSync(join(D, "assets", file)).toString("base64");

let html = read("src", "home.html");
html = put(html, "/* @STYLES@ */", read("src", "home.css"));
// reveal.js first: it claims the js-reveal class before anything paints
html = put(html, "/* @APP@ */", read("src", "reveal.js") + "\n" + read("src", "home.js"));
html = put(html, "@LOGO@", dataUri("logo.webp", "image/webp"));
html = put(html, "@HERO@", dataUri("hero-product.webp", "image/webp"));
html = put(html, "@FEATBOTTLE@", dataUri("feature-bottle.webp", "image/webp"));
html = put(html, "@FOOTBED@", dataUri("foot-bed.webp", "image/webp"));
html = put(html, "@CARDONE@", dataUri("card-one.webp", "image/webp"));
html = put(html, "@CARDSOON@", dataUri("card-two.webp", "image/webp"));
// scroll choreography needs GSAP now; still no Three.js
html = put(html, "/* @GSAP@ */", readFileSync(join(D, "vendor", "gsap.min.js"), "utf8"));
html = put(html, "/* @SCROLLTRIGGER@ */", readFileSync(join(D, "vendor", "ScrollTrigger.min.js"), "utf8"));

writeFileSync(join(D, "home.html"), html, "utf8");
// The artifact platform supplies a doctype; locally we must add one or the browser
// drops into quirks mode and the behaviour under test is not the shipped behaviour.
writeFileSync(join(D, "home-preview.html"), "<!doctype html>\n" + html, "utf8");

const kb = (statSync(join(D, "home.html")).size / 1024).toFixed(0);
console.log("built home.html (" + kb + " KB) + home-preview.html");
