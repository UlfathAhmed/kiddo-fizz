/* KiddoFizz Drinks — contact page.
   Same two behaviours the home page has, so the pages feel like one site: the nav
   hides going down and returns going up, and the red header carries carbonation.
   No GSAP here — this page has no scroll choreography to drive. */
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

  /* ------------------------------------------------------------------- FAQ */
  var faqs = [].slice.call(document.querySelectorAll('.faq details'));
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  makeBubbles(bubbleCount());
  var last = bubbleCount(), rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var c = bubbleCount();
      if (c !== last) { last = c; makeBubbles(c); }
    }, 220);
  });
})();
