"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The behaviour every page shares: content reveals, the footer product bed, the
 * nav hiding on scroll, the carbonation bubbles, and the FAQ accordion.
 *
 * Ported from the prototype's reveal.js / page.js. Two things differ because
 * this is now a routed app rather than five separate documents:
 *
 *  - everything re-runs on navigation, keyed on the pathname;
 *  - every listener and observer is torn down on the way out, which the
 *    prototype never had to do because it never navigated.
 */
export function SiteBehaviour() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.location.search.indexOf("motion=reduced") !== -1;
    if (reduced) document.documentElement.classList.add("reduced");
    else document.documentElement.classList.remove("reduced");

    const cleanups: Array<() => void> = [];

    /* ----------------------------------------------------------- reveals */
    const groups = document.querySelectorAll<HTMLElement>("[data-reveal-stagger]");
    groups.forEach((group) => {
      group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((kid, i) => {
        kid.style.setProperty("--i", String(i));
      });
    });

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const footer = document.querySelector<HTMLElement>("#site-footer");

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      footer?.classList.add("bed-in");
    } else {
      /* above-the-fold headers arrive on load, not on a scroll that may never come */
      const now = items.filter((el) => el.getAttribute("data-reveal") === "now");
      const timer = window.setTimeout(() => now.forEach((el) => el.classList.add("in")), 40);
      cleanups.push(() => window.clearTimeout(timer));

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            io.unobserve(e.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      items
        .filter((el) => el.getAttribute("data-reveal") !== "now")
        .forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());

      if (footer) {
        const bedIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              footer.classList.add("bed-in");
              bedIO.disconnect();
            });
          },
          { threshold: 0.14 }
        );
        bedIO.observe(footer);
        cleanups.push(() => bedIO.disconnect());
      }
    }

    /* ------------------------------- nav hides going down, returns going up */
    const header = document.querySelector<HTMLElement>("header");
    if (header && !reduced) {
      let lastY = window.scrollY;
      let hidden = false;
      const onScroll = () => {
        const y = window.scrollY;
        const dy = y - lastY;
        if (Math.abs(dy) < 6) return; // ignore jitter and rubber-banding
        lastY = y;
        const want = y > 90 && dy > 0; // near the top it always shows
        if (want === hidden) return;
        hidden = want;
        header.classList.toggle("nav-hidden", hidden);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        header.classList.remove("nav-hidden");
      });
    }

    /* ------------------------------------------------------------ bubbles */
    const wrap = document.querySelector<HTMLElement>(".bubbles");
    if (wrap) {
      const count = () => {
        const w = window.innerWidth;
        /* the hero carries far more than an inner page's header band */
        const dense = !!document.querySelector("#hero");
        if (dense) return w < 760 ? 24 : w < 1200 ? 42 : 58;
        return w < 760 ? 9 : w < 1200 ? 14 : 20;
      };
      const build = (n: number) => {
        wrap.textContent = "";
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
          const b = document.createElement("i");
          const size = 8 + Math.pow(Math.random(), 1.7) * 44;
          /* kept to the outer thirds so nothing drifts across the label */
          const side = Math.random() < 0.5 ? 0 : 1;
          const x = side ? 65 + Math.random() * 34 : Math.random() * 34;
          b.style.width = `${size.toFixed(0)}px`;
          b.style.height = `${size.toFixed(0)}px`;
          b.style.left = `${x.toFixed(2)}%`;
          b.style.top = `${(42 + Math.random() * 58).toFixed(2)}%`;
          b.style.opacity = (0.22 + Math.random() * 0.38).toFixed(2);
          if (!reduced) {
            const dur = 13 + (size / 52) * 16 + Math.random() * 7; // bigger rises slower
            b.style.animationDuration = `${dur.toFixed(1)}s`;
            b.style.animationDelay = `${(-Math.random() * dur).toFixed(1)}s`;
          }
          frag.appendChild(b);
        }
        wrap.appendChild(frag);
      };
      build(count());
      let last = count();
      let t: number | undefined;
      const onResize = () => {
        window.clearTimeout(t);
        t = window.setTimeout(() => {
          const c = count();
          if (c !== last) {
            last = c;
            build(c);
          }
        }, 220);
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => {
        window.removeEventListener("resize", onResize);
        window.clearTimeout(t);
      });
    }

    /* ---------------------------------------------------------------- FAQ */
    // Built on <details>, so it still opens and closes with JavaScript off and
    // is announced correctly. This only adds one-open-at-a-time on top.
    const faqs = Array.from(document.querySelectorAll<HTMLDetailsElement>(".faq details"));
    const onToggle = (d: HTMLDetailsElement) => () => {
      if (!d.open) return;
      faqs.forEach((other) => {
        if (other !== d) other.open = false;
      });
    };
    const handlers = faqs.map((d) => {
      const h = onToggle(d);
      d.addEventListener("toggle", h);
      return () => d.removeEventListener("toggle", h);
    });
    cleanups.push(...handlers);

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
