"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The two pieces of the home page that GSAP actually earns:
 *
 *  - the feature section pops once at full speed (a pop should happen at its own
 *    pace, not at whatever rate the visitor turns the wheel);
 *  - the showcase carousel is scrubbed, because it IS a transition between two
 *    states and should track the scroll.
 *
 * The hero entrance is deliberately NOT here. It stays as CSS keyframes because
 * GSAP's clock is requestAnimationFrame, which never starts in a hidden or
 * embedded document — driving the hero with it would leave the page blank at
 * opacity 0 rather than merely unanimated.
 *
 * Everything is created inside a gsap.context() and reverted on unmount. The
 * prototype never navigated, so it never had to clean up; in a routed app,
 * leaving ScrollTriggers behind means they pile up and start firing against
 * stale elements.
 */
export function HomeMotion() {
  useEffect(() => {
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.location.search.indexOf("motion=reduced") !== -1;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Bundled as modules, so neither is on window any more. Behind ?debug=motion
       they are, which is how the route-change cleanup below can be checked:
       navigate away and back, and __motion.ScrollTrigger.getAll() must not grow. */
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __motion?: unknown }).__motion = { gsap, ScrollTrigger };
    }

    /* No scope element passed to gsap.context: selector strings inside would be
       resolved against it, and every target here lives out in the page, not in
       this component. Without a scope they resolve globally, as the prototype
       did — ctx.revert() still tears down everything created inside. */
    const ctx = gsap.context(() => {
      const bottle = document.querySelector<HTMLElement>(".feature-bottle");
      const body = document.querySelector<HTMLElement>(".feature-body");
      if (!bottle || !body) return;

      /* Leader lengths are measured, never set in vw: the bottle scales with
         viewport HEIGHT while the cards sit by WIDTH, so a fixed vw length
         drifts as the window aspect changes. offsetWidth is the untransformed
         layout size, so this is right even though the bottle starts scaled down. */
      const layoutLeads = () => {
        const r = body.getBoundingClientRect();
        const bw = bottle.offsetWidth;
        const left = r.left + (r.width - bw) / 2;
        const right = left + bw;
        document.querySelectorAll<HTMLElement>(".card").forEach((c) => {
          const cr = c.getBoundingClientRect();
          const gap = c.classList.contains("l") ? left - cr.right : cr.left - right;
          c.style.setProperty("--reach", `${Math.max(24, Math.round(gap + 14))}px`);
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 861px)", () => {
        layoutLeads();
        let t: number | undefined;
        const onResize = () => {
          window.clearTimeout(t);
          t = window.setTimeout(layoutLeads, 200);
        };
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
          window.clearTimeout(t);
        };
      });

      const tilts = [-2.2, 1.6, -1.4, 2, -1.8];

      gsap
        .timeline({ scrollTrigger: { trigger: "#feature", start: "top 62%", once: true } })
        .to(".rays", { opacity: 1, duration: 1.1, ease: "power1.out" }, 0)
        .to(".pop", { scale: 1, duration: 0.9, ease: "back.out(1.5)" }, 0.05)
        .to(bottle, { opacity: 1, scale: 1, duration: 0.85, ease: "back.out(1.7)" }, 0.12)
        .to(
          ".card",
          {
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
            stagger: 0.12,
            rotation: (i: number) => tilts[i % tilts.length],
          },
          0.55
        )
        .to(".card .lead", { scaleX: 1, duration: 0.45, ease: "power2.out", stagger: 0.12 }, 0.66);

      /* ------------------------------------- showcase: the text hands over */
      const track = document.querySelector<HTMLElement>(".track");
      /* Desktop only. Below the breakpoint the track is a static column and a
         horizontal offset meant for the carousel just shoves it sideways. */
      if (track) {
        mm.add("(min-width: 861px)", () => {
          gsap.set(track, { visibility: "visible" });
          gsap.set(".pcard.one", { rotation: -1.6 });
          gsap.set(".pcard.soon", { rotation: 2.2 });

          /* Cards travel THROUGH the panel: one centres, then the next. Offsets
             are measured because the card width and the gap are both clamps —
             there is no fixed number that stays right. */
          const stops = () => {
            /* No non-null assertion here. invalidateOnRefresh re-runs this on
               every ScrollTrigger refresh, including ones that fire while the
               router is swapping the page out — at which point .panel is gone
               and a `!` would throw inside GSAP's refresh loop. */
            const panelEl = document.querySelector(".panel");
            const cards = track.querySelectorAll<HTMLElement>(".pcard");
            if (!panelEl || cards.length < 2) return { enter: 0, list: [0, 0] };
            const panel = panelEl.getBoundingClientRect();
            const out: number[] = [];
            cards.forEach((c) => out.push(panel.width / 2 - (c.offsetLeft + c.offsetWidth / 2)));
            /* The first card only PEEKS in to start with. Measured against the
               CARD, not the panel, so the sliver is the same at any width. */
            const PEEK = 0.22;
            const first = cards[0];
            const enter = panel.width - (first.offsetLeft + first.offsetWidth * PEEK);
            return { enter, list: out };
          };

          gsap.set(track, { x: stops().enter });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: "#showcase",
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          /* outer lines leave first, the colour block last — the reference holds it longest */
          tl.to(".show-head .l1, .show-head .l3", { yPercent: -40, opacity: 0, ease: "power2.in", duration: 0.16 }, 0)
            .to(".show-head .l2", { scale: 0.82, opacity: 0, ease: "power2.in", duration: 0.16 }, 0.1)
            .fromTo(
              track,
              { x: () => stops().enter },
              { x: () => stops().list[0], ease: "none", duration: 0.34 },
              0.06
            )
            .to(track, { x: () => stops().list[1], ease: "none", duration: 0.4 }, 0.6);

          return () => {
            gsap.set(track, { clearProps: "transform,visibility" });
            gsap.set(".pcard", { clearProps: "transform" });
          };
        });
      }

      /* gentle idle bob so the section is not dead once it has landed */
      gsap.to(".confetti i", {
        y: () => -8 - Math.random() * 12,
        duration: () => 2.4 + Math.random() * 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.12, from: "random" },
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
