/* KiddoFizz Drinks — home page.
   Hero motion is CSS (it runs on load). The feature section is scroll-triggered and
   plays once rather than scrubbing: a pop wants to happen at full speed, not at
   whatever rate the visitor happens to be turning the wheel. */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                location.search.indexOf("motion=reduced") !== -1;
  if (REDUCED) document.documentElement.classList.add("reduced");

  var BRAND = ["#EE0A1E", "#FB8C0B", "#0AA838", "#0660C8", "#FFC72C"];

  /* ------------------------------------------- nav hides going down, returns up */
  // Plain scroll listener rather than rAF: it is a single class toggle, and it keeps
  // working in contexts where rAF is throttled. Left alone under reduced motion,
  // where a nav that moves on its own is unwelcome rather than helpful.
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

  /* -------------------------------------------------- carbonation, in the hero */
  var bubbleWrap = document.querySelector(".bubbles");

  function makeBubbles(n) {
    if (!bubbleWrap) return;
    bubbleWrap.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement("i");
      var size = 8 + Math.pow(Math.random(), 1.7) * 44;
      // kept to the outer thirds so nothing drifts across the label. The columns
      // widen a little with the higher count, or the extra bubbles just stack up
      // in the same two narrow strips.
      var side = Math.random() < 0.5 ? 0 : 1;
      var x = side ? 65 + Math.random() * 34 : Math.random() * 34;
      b.style.width = size.toFixed(0) + "px";
      b.style.height = size.toFixed(0) + "px";
      b.style.left = x.toFixed(2) + "%";
      b.style.top = (42 + Math.random() * 58).toFixed(2) + "%";
      b.style.opacity = (0.22 + Math.random() * 0.38).toFixed(2);
      if (!REDUCED) {
        var dur = 13 + (size / 52) * 16 + Math.random() * 7;   // bigger rises slower
        b.style.animationDuration = dur.toFixed(1) + "s";
        b.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
      }
      frag.appendChild(b);
    }
    bubbleWrap.appendChild(frag);
  }

  function bubbleCount() {
    var w = window.innerWidth;
    return w < 760 ? 24 : w < 1200 ? 42 : 58;
  }

  makeBubbles(bubbleCount());
  var lastCount = bubbleCount(), rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var c = bubbleCount();
      if (c !== lastCount) { lastCount = c; makeBubbles(c); }
    }, 220);
  });

  /* ------------------------------------------------- confetti, in the feature */
  var confetti = document.querySelector(".confetti");
  if (confetti) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 22; i++) {
      var d = document.createElement("i");
      var s = 6 + Math.random() * 14;
      d.style.width = s.toFixed(0) + "px";
      d.style.height = s.toFixed(0) + "px";
      d.style.background = BRAND[i % BRAND.length];
      // kept out of the middle column, where the bottle and the copy live
      var side = Math.random() < 0.5;
      d.style.left = (side ? Math.random() * 26 : 74 + Math.random() * 24).toFixed(1) + "%";
      d.style.top = (6 + Math.random() * 88).toFixed(1) + "%";
      frag.appendChild(d);
    }
    confetti.appendChild(frag);
  }


  /* ------------------------------------------------------- content reveals */
  // Shared with every other page — see reveal.js. Also drives the footer bed.
  KF.reveal();

  /* ----------------------------------------------------------------- motion */
  if (typeof gsap === "undefined" || REDUCED) return;
  gsap.registerPlugin(ScrollTrigger);

  var bottle = document.querySelector(".feature-bottle");
  var body = document.querySelector(".feature-body");
  if (!bottle || !body) return;

  // Leader lengths are measured, never set in vw: the bottle scales with viewport
  // HEIGHT while the cards sit by WIDTH, so a fixed vw length drifts away from the
  // bottle as the window aspect changes. offsetWidth is the untransformed layout
  // size, so this is correct even though the bottle starts scaled down.
  function layoutLeads() {
    var r = body.getBoundingClientRect();
    var bw = bottle.offsetWidth;
    var left = r.left + (r.width - bw) / 2;
    var right = left + bw;
    [].forEach.call(document.querySelectorAll(".card"), function (c) {
      var cr = c.getBoundingClientRect();
      var gap = c.classList.contains("l") ? left - cr.right : cr.left - right;
      c.style.setProperty("--reach", Math.max(24, Math.round(gap + 14)) + "px");
    });
  }

  var mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", function () {
    layoutLeads();
    var lt;
    var onResize = function () { clearTimeout(lt); lt = setTimeout(layoutLeads, 200); };
    window.addEventListener("resize", onResize);
    return function () { window.removeEventListener("resize", onResize); };
  });

  var tilts = [-2.2, 1.6, -1.4, 2, -1.8];

  gsap.timeline({ scrollTrigger: { trigger: "#feature", start: "top 62%", once: true } })
    .to(".rays", { opacity: 1, duration: 1.1, ease: "power1.out" }, 0)
    .to(".pop", { scale: 1, duration: 0.9, ease: "back.out(1.5)" }, 0.05)
    .to(bottle, { opacity: 1, scale: 1, duration: 0.85, ease: "back.out(1.7)" }, 0.12)
    .to(".card", {
      opacity: 1,
      duration: 0.5,
      ease: "back.out(2)",
      stagger: 0.12,
      rotation: function (i) { return tilts[i % tilts.length]; }
    }, 0.55)
    .to(".card .lead", { scaleX: 1, duration: 0.45, ease: "power2.out", stagger: 0.12 }, 0.66);

  /* ------------------------------------------------- showcase: text hands over */
  // Scrubbed, not played once: this one IS a transition between two states, so it
  // should track the wheel rather than fire and finish on its own.
  var track = document.querySelector(".track");
  // Desktop only. Below the breakpoint the track is a static column, and a
  // horizontal offset meant for the carousel just shoves the stacked cards sideways.
  if (track) mm.add("(min-width: 861px)", function () {
    gsap.set(track, { visibility: "visible" });

    // Cards travel THROUGH the panel rather than arriving and stopping: one centres,
    // then the next. Offsets are measured, because the card width is a vw clamp and
    // the gap is a clamp too - there is no fixed number that stays right.
    function stops() {
      var panel = document.querySelector(".panel").getBoundingClientRect();
      var cards = track.querySelectorAll(".pcard");
      var out = [];
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        out.push(panel.width / 2 - (c.offsetLeft + c.offsetWidth / 2));
      }
      // The first card should only PEEK in before the scroll starts. As a fraction
      // of the PANEL (the old 0.72) it was arriving 53% revealed, which leaves the
      // reveal nothing to reveal. Measured against the CARD instead, so the peek is
      // the same sliver whatever the panel and card widths clamp to.
      var PEEK = 0.22;
      var first = cards[0];
      var enter = panel.width - (first.offsetLeft + first.offsetWidth * PEEK);
      return { enter: enter, list: out };
    }

    var S = stops();
    gsap.set(track, { x: S.enter });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#showcase", start: "top top", end: "bottom bottom", scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
    // outer lines leave first, the colour block last - the reference holds it longest
    tl.to(".show-head .l1, .show-head .l3", { yPercent: -40, opacity: 0, ease: "power2.in", duration: 0.16 }, 0)
      .to(".show-head .l2", { scale: .82, opacity: 0, ease: "power2.in", duration: 0.16 }, 0.1)
      .fromTo(track, { x: function () { return stops().enter; } },
                     { x: function () { return stops().list[0]; }, ease: "none", duration: 0.34 }, 0.06)
      .to(track, { x: function () { return stops().list[1]; }, ease: "none", duration: 0.4 }, 0.6);

    return function () {
      gsap.set(track, { clearProps: "transform,visibility" });
    };
  });

  // gentle idle bob so the section is not dead once it has landed
  gsap.to(".confetti i", {
    y: function () { return -8 - Math.random() * 12; },
    duration: function () { return 2.4 + Math.random() * 2.2; },
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.12, from: "random" }
  });
})();
