// Builds the inner pages (products range, product detail) into self-contained files.
//
// Each inlines home.css FIRST, then pages.css. Sharing the home stylesheet rather
// than copying its nav, footer and tokens is what keeps every page from drifting —
// a duplicated palette is a palette that eventually disagrees with itself.
// Run:  node build-pages.mjs
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
// optional: not every page uses every asset
const maybe = (hay, needle, value) => (hay.includes(needle) ? put(hay, needle, value) : hay);

const dataUri = (file, mime) =>
  "data:" + mime + ";base64," + readFileSync(join(D, "assets", file)).toString("base64");

let css = read("src", "home.css") + "\n" + read("src", "pages.css");
css = put(css, "@FOOTBED@", dataUri("foot-bed.webp", "image/webp"));

// reveal.js first: it claims the js-reveal class before anything paints
const app = read("src", "reveal.js") + "\n" + read("src", "page.js");

function build(name) {
  let html = read("src", name + ".html");
  html = put(html, "/* @STYLES@ */", css);
  html = put(html, "/* @APP@ */", app);
  html = put(html, "@LOGO@", dataUri("logo.webp", "image/webp"));
  html = maybe(html, "@BOTTLE@", dataUri("feature-bottle.webp", "image/webp"));
  html = maybe(html, "@CASE@", dataUri("case.webp", "image/webp"));
  html = maybe(html, "@HERO@", dataUri("hero-product.webp", "image/webp"));

  writeFileSync(join(D, name + ".html"), html, "utf8");
  // The artifact platform supplies a doctype; locally we must add one or the
  // browser drops into quirks mode and what we test is not what ships.
  writeFileSync(join(D, name + "-preview.html"), "<!doctype html>\n" + html, "utf8");

  const kb = (statSync(join(D, name + ".html")).size / 1024).toFixed(0);
  console.log("built " + name + ".html (" + kb + " KB) + " + name + "-preview.html");
}

build("products");
build("product");
build("about");
