// Builds the shippable plugin: src/code.src.js with the image bytes injected.
// Run:  node build.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));
const b64 = (f) => readFileSync(join(D, "img", f)).toString("base64");

const IMAGES = {
  logo: "fg-logo.png",
  bottle: "fg-bottle.png",
  hero: "fg-hero.png",
  case_: "fg-case.jpg",
  cardOne: "fg-card-one.jpg",
  cardSoon: "fg-card-soon.jpg"
};

let src = readFileSync(join(D, "src", "code.src.js"), "utf8");

// split/join, never replace(): base64 cannot contain $ patterns, but the habit is
// what keeps this project's builds from corrupting themselves.
const MARKER = 'var B64 = { logo: "", bottle: "", hero: "", case_: "", cardOne: "", cardSoon: "" };';
if (!src.includes(MARKER)) throw new Error("B64 slot not found in src/code.src.js");

const parts = Object.keys(IMAGES).map((k) => k + ': "' + b64(IMAGES[k]) + '"');
src = src.split(MARKER).join("var B64 = {\n  " + parts.join(",\n  ") + "\n};");

const out = join(D, "code.js");
writeFileSync(out, src, "utf8");
console.log(
  "built code.js (" + (statSync(out).size / 1024 / 1024).toFixed(2) + " MB) — " +
  Object.keys(IMAGES).length + " images inlined"
);
