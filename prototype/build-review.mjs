// Builds ONE standalone file containing all four pages, for sending to someone
// who has no Claude account and no web server — they open it from their desktop.
//
// Each page is embedded whole (doctype and all) and rendered in an iframe via
// srcdoc. That isolation is the point: every page keeps its own <header>, its own
// footer, its own .bubbles and its own scripts. Merging four pages into one
// document would have home.js grabbing the first .bubbles it finds and the other
// three pages sitting there empty.
//
// Run:  node build-review.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const D = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(D, f), "utf8");

const PAGES = [
  { id: "home",     file: "home-preview.html",     label: "Home" },
  { id: "about",    file: "about-preview.html",    label: "About" },
  { id: "products", file: "products-preview.html", label: "Products" },
  { id: "product",  file: "product-preview.html",  label: "Product detail" },
  { id: "contact",  file: "contact-preview.html",  label: "Contact" },
];

// Injected into every page. Turns the site's own nav links into route changes,
// so the pill nav, the breadcrumb and "See full details" all work as designed
// instead of dead-ending the way they do in an isolated artifact.
const SHIM = `
<style>
  /* On narrow screens the preview switcher becomes a full-width bar along the
     bottom, which is exactly where the page's own "Prototype" badge lives.
     Lift the badge clear of it — only inside this preview shell. */
  @media (max-width: 620px) { .badge { bottom: 74px !important; } }
</style>
<script>(function(){
  var MAP={"home.html":"home","about.html":"about","products.html":"products","product.html":"product","contact.html":"contact"};
  document.addEventListener("click",function(e){
    var t=e.target, a=(t&&t.closest)?t.closest("a"):null;
    if(!a)return;
    var m=(a.getAttribute("href")||"").match(/^([a-z]+\\.html)(#.*)?$/);
    if(!m||!MAP[m[1]])return;
    e.preventDefault();
    parent.postMessage({kf:"go",page:MAP[m[1]],hash:m[2]||""},"*");
  },true);
  // the parent hands us the hash after load, since a fresh srcdoc has no URL
  window.addEventListener("message",function(e){
    var d=e.data||{};
    if(d.kf!=="hash"||!d.hash)return;
    var el=null; try{ el=document.querySelector(d.hash); }catch(_){}
    // instant, not smooth: this is a page load arriving at an anchor, and a smooth
    // scroll here depends on rAF being healthy in whatever context this opens in
    if(el)el.scrollIntoView({block:"start"});
  });
})();<\/script>
`;

const docs = {};
for (const p of PAGES) docs[p.id] = read(p.file) + SHIM;

const tabs = PAGES.map(
  (p, i) =>
    `<button class="tab${i === 0 ? " on" : ""}" data-page="${p.id}">${p.label}</button>`
).join("\n      ");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>KiddoFizz Drinks — website preview</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; height: 100%; background: #17110f; }
  #stage { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; display: block; }

  #switch {
    position: fixed;
    left: 16px; bottom: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px;
    border-radius: 999px;
    background: rgba(251, 242, 230, .94);
    box-shadow: 0 10px 30px rgba(0, 0, 0, .38);
    backdrop-filter: blur(6px);
    font: 600 12.5px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    max-width: calc(100vw - 32px);
    overflow-x: auto;
    scrollbar-width: none;
  }
  #switch::-webkit-scrollbar { display: none; }
  #switch .lab {
    padding: 0 10px 0 8px;
    color: #9b8b80;
    letter-spacing: .12em;
    text-transform: uppercase;
    font-size: 9.5px;
    font-weight: 800;
    white-space: nowrap;
  }
  .tab {
    -webkit-appearance: none; appearance: none;
    border: 0;
    cursor: pointer;
    font: inherit;
    color: #1A1512;
    background: transparent;
    padding: 10px 14px;
    min-height: 38px;
    border-radius: 999px;
    white-space: nowrap;
    transition: background-color .16s ease, color .16s ease;
  }
  .tab:hover { background: rgba(26, 21, 18, .08); }
  .tab.on { background: #C8121A; color: #fff; }
  .tab:focus-visible { outline: 3px solid #0660C8; outline-offset: 2px; }

  @media (max-width: 620px) {
    #switch { left: 10px; right: 10px; bottom: 10px; justify-content: flex-start; }
    #switch .lab { display: none; }
    .tab { padding: 10px 12px; font-size: 12px; min-height: 44px; }
  }
</style>
</head>
<body>

<iframe id="stage" title="KiddoFizz Drinks website preview"></iframe>

<nav id="switch" aria-label="Preview pages">
  <span class="lab">Preview</span>
  ${tabs}
</nav>

<script>
(function () {
  // Every "<" is escaped, not just the dangerous ones. The pages themselves end
  // in a closing script tag, and an unescaped one inside this string literal would
  // close THIS script tag and leave the shell dead with no error worth the name.
  // (Which is why the words above are spelled out rather than written as markup.)
  var DOCS = ${JSON.stringify(docs).split("<").join("\\u003c")};
  var stage = document.getElementById("stage");
  var tabs = [].slice.call(document.querySelectorAll(".tab"));
  var pendingHash = "";

  function show(page, hash) {
    if (!DOCS[page]) return;
    pendingHash = hash || "";
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-page") === page;
      t.classList.toggle("on", on);
      t.setAttribute("aria-current", on ? "page" : "false");
    });
    stage.srcdoc = DOCS[page];
  }

  stage.addEventListener("load", function () {
    if (!pendingHash) return;
    // one frame of slack so the page's own layout settles before we jump
    var h = pendingHash; pendingHash = "";
    setTimeout(function () {
      try { stage.contentWindow.postMessage({ kf: "hash", hash: h }, "*"); } catch (e) {}
    }, 120);
  });

  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.kf === "go") show(d.page, d.hash);
  });

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { show(t.getAttribute("data-page"), ""); });
  });

  show("home", "");
})();
</script>

</body>
</html>
`;

const out = join(D, "KiddoFizz-Drinks-Preview.html");
writeFileSync(out, html, "utf8");
console.log(
  "built KiddoFizz-Drinks-Preview.html (" +
    (statSync(out).size / 1024 / 1024).toFixed(2) +
    " MB) — " + PAGES.length + " pages"
);
