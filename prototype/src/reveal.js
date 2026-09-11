/* KiddoFizz Drinks — shared reveal behaviour.
   Concatenated ahead of every page script by the three build files, so all five
   pages share one reveal vocabulary instead of three mechanisms doing the same
   job. Exposes KF.reveal(); each page script calls it once.

   Markup contract:
     data-reveal              arrives when it scrolls into view
     data-reveal="now"        arrives on load (above-the-fold headers)
     data-reveal-stagger      on a container: its [data-reveal] children follow
                              one another, via a --i index set here */
var KF = (function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                location.search.indexOf("motion=reduced") !== -1;

  /* Claimed before first paint. The page scripts are inlined at the end of
     <body>, and the only render-blocking resource is the fonts link in <head>,
     so this runs before anything is painted — nothing flashes visible and then
     hides. The hiding rule is scoped to this class precisely so that a page with
     no JavaScript is fully readable rather than blank. */
  document.documentElement.classList.add("js-reveal");
  if (REDUCED) document.documentElement.classList.add("reduced");

  function reveal() {
    var groups = document.querySelectorAll("[data-reveal-stagger]");
    for (var g = 0; g < groups.length; g++) {
      var kids = groups[g].querySelectorAll("[data-reveal]");
      for (var k = 0; k < kids.length; k++) kids[k].style.setProperty("--i", k);
    }

    var items = [].slice.call(document.querySelectorAll("[data-reveal]"));
    var footer = document.querySelector("#site-footer");

    function landAll() {
      for (var i = 0; i < items.length; i++) items[i].classList.add("in");
      if (footer) footer.classList.add("bed-in");
    }

    if (REDUCED || !("IntersectionObserver" in window)) { landAll(); return; }

    /* Above-the-fold headers arrive on load rather than waiting for a scroll
       that may never come. setTimeout rather than requestAnimationFrame: rAF is
       throttled to a standstill in some embedded/preview contexts, and this must
       not be the thing that leaves a header invisible. */
    var scrolled = [];
    for (var n = 0; n < items.length; n++) {
      if (items[n].getAttribute("data-reveal") === "now") continue;
      scrolled.push(items[n]);
    }
    setTimeout(function () {
      for (var i = 0; i < items.length; i++) {
        if (items[i].getAttribute("data-reveal") === "now") items[i].classList.add("in");
      }
    }, 40);

    /* One-shot: unobserve on arrival so nothing replays on the way back up. */
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add("in");
        io.unobserve(entries[i].target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    for (var s = 0; s < scrolled.length; s++) io.observe(scrolled[s]);

    /* the footer product bed, on the same one-shot principle */
    if (footer) {
      var bedIO = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          footer.classList.add("bed-in");
          bedIO.disconnect();
        }
      }, { threshold: 0.14 });
      bedIO.observe(footer);
    }
  }

  return { REDUCED: REDUCED, reveal: reveal };
})();
