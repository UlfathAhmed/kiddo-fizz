// Builds the contact page as one self-contained file.
//
// It inlines home.css FIRST and then contact.css. Sharing the home stylesheet
// rather than copying its nav, footer and tokens is what keeps the two pages from
// drifting apart — a duplicated palette is a palette that eventually disagrees.
// The home-only rules that come along are dead weight of about 15KB, which is far
// cheaper than the divergence.
// Run:  node build-contact.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(D, ...p), "utf8");

// split/join, never replace(): $& and $' in inlined content would be read as
// substitution patterns and silently corrupt the output.
const put = (hay, needle, value) => {
  if (!hay.includes(needle)) throw new Error("placeholder not found: " + needle);
  return hay.split(needle).join(value);
};

const dataUri = (file, mime) =>
  "data:" + mime + ";base64," + readFileSync(join(D, "assets", file)).toString("base64");

let css = read("src", "home.css") + "\n" + read("src", "contact.css");
css = put(css, "@FOOTBED@", dataUri("foot-bed.webp", "image/webp"));

let html = read("src", "contact.html");
html = put(html, "/* @STYLES@ */", css);
// reveal.js first: it claims the js-reveal class before anything paints
html = put(html, "/* @APP@ */", read("src", "reveal.js") + "\n" + read("src", "contact.js"));
html = put(html, "@LOGO@", dataUri("logo.webp", "image/webp"));

writeFileSync(join(D, "contact.html"), html, "utf8");
// The artifact platform supplies a doctype; locally we must add one or the browser
// drops into quirks mode and the behaviour under test is not the shipped behaviour.
writeFileSync(join(D, "contact-preview.html"), "<!doctype html>\n" + html, "utf8");

const kb = (statSync(join(D, "contact.html")).size / 1024).toFixed(0);
console.log("built contact.html (" + kb + " KB) + contact-preview.html");
