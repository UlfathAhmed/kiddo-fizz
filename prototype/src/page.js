/* KiddoFizz Drinks — shared behaviour for the inner pages.
   One file rather than a copy per page, so the nav never behaves differently
   depending on which page you happen to be on. Each block no-ops if the markup
   it needs is not present. */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                location.search.indexOf("motion=reduced") !== -1;
  if (REDUCED) document.documentElement.classList.add("reduced");

  /* ------------------------------------------------------- content reveals */
  // Shared with every other page — see reveal.js. Also drives the footer bed.
  KF.reveal();

  /* ------------------------------------------- nav hides going down, returns up */
  var header = document.querySelector("header");
  if (header && !REDUCED) {
    var lastY = window.scrollY;
    var navHidden = false;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      var dy = y - lastY;
      if (Math.abs(dy) < 6) return;        // ignore jitter and rubber-banding
      lastY = y;
      // near the top it always shows, so the page never opens with a hidden nav
      var wantHidden = y > 90 && dy > 0;
      if (wantHidden === navHidden) return;
      navHidden = wantHidden;
      header.classList.toggle("nav-hidden", navHidden);
    }, { passive: true });
  }

  /* --------------------------------------------------------------- bubbles */
  var wrap = document.querySelector(".bubbles");

  function makeBubbles(n) {
    if (!wrap) return;
    wrap.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement("i");
      var size = 8 + Math.pow(Math.random(), 1.7) * 40;
      // outer thirds only, so nothing drifts across the headline
      var side = Math.random() < 0.5 ? 0 : 1;
      var x = side ? 70 + Math.random() * 28 : Math.random() * 26;
      b.style.width = size.toFixed(0) + "px";
      b.style.height = size.toFixed(0) + "px";
      b.style.left = x.toFixed(2) + "%";
      b.style.top = (50 + Math.random() * 48).toFixed(2) + "%";
      b.style.opacity = (0.20 + Math.random() * 0.34).toFixed(2);
      if (!REDUCED) {
        var dur = 13 + (size / 48) * 16 + Math.random() * 7;   // bigger rises slower
        b.style.animationDuration = dur.toFixed(1) + "s";
        b.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
      }
      frag.appendChild(b);
    }
    wrap.appendChild(frag);
  }

  function bubbleCount() {
    var w = window.innerWidth;
    return w < 760 ? 9 : w < 1200 ? 14 : 20;
  }

  if (wrap) {
    makeBubbles(bubbleCount());
    var last = bubbleCount(), rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var c = bubbleCount();
        if (c !== last) { last = c; makeBubbles(c); }
      }, 220);
    });
  }

  /* ------------------------------------------------------------------- FAQ */
  // Built on <details>, so it still opens and closes with JavaScript off and is
  // announced correctly by a screen reader. This only adds the one-open-at-a-time
  // behaviour on top.
  var faqs = [].slice.call(document.querySelectorAll(".faq details"));
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      faqs.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* --------------------------------------------------- pack format switcher */
  // gallery thumbnails swap the framed image; same shape as any product page
  var packs = [].slice.call(document.querySelectorAll(".p-thumb"));
  var panes = [].slice.call(document.querySelectorAll(".p-view"));

  // Thumbnails borrow the full image's src at runtime rather than carrying their
  // own copy. Every image on this page is an inlined data URI, so a second copy in
  // the markup is a second copy of the actual bytes - it put 600KB on the page.
  packs.forEach(function (tab) {
    var thumbImg = tab.querySelector("img");
    if (!thumbImg || thumbImg.getAttribute("src")) return;
    var view = document.querySelector('.p-view[data-view="' + tab.getAttribute("data-view") + '"] img');
    if (view) thumbImg.src = view.src;
  });
  packs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      packs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panes.forEach(function (p) {
        p.hidden = p.getAttribute("data-view") !== tab.getAttribute("data-view");
      });
    });
  });
})();
