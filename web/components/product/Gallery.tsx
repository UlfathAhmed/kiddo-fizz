"use client";

import { useState } from "react";
import { Picture } from "@/components/Picture";
import { product } from "@/content/product";

/**
 * Framed image with thumbnails beneath — one image visible at a time.
 *
 * In the prototype this was a `hidden` attribute toggled by hand, which had a
 * real bug: `[hidden]` only gets `display: none` from the UA stylesheet, and the
 * author `display: flex` on the view wrapper silently outranked it, so all four
 * images rendered at once squeezed into a flex row. React state removes the
 * class of problem entirely — the inactive views are simply not rendered.
 */
export function Gallery() {
  const [view, setView] = useState(product.gallery[0].view);
  const active = product.gallery.find((g) => g.view === view)!;

  return (
    <div className="p-gallery" data-reveal="now">
      <div className="p-frame">
        <div className="r-glow" aria-hidden="true" />
        <div className="p-view">
          {active.image ? (
            <Picture
              name={active.image}
              alt={active.alt}
              className={active.view === "case" ? "case" : active.view === "serve" ? "serve" : undefined}
              sizes="(max-width: 860px) 70vw, 420px"
            />
          ) : (
            <p className="p-empty">
              [ FURTHER PRODUCT PHOTOGRAPHY
              <br />
              TO BE SUPPLIED BY KIDDOFIZZ ]
            </p>
          )}
        </div>
      </div>

      <div className="p-thumbs" role="tablist" aria-label="Product images">
        {product.gallery.map((g) => {
          const on = g.view === view;
          return (
            <button
              key={g.view}
              type="button"
              role="tab"
              aria-selected={on}
              className={`p-thumb${on ? " on" : ""}${g.image ? "" : " empty"}`}
              onClick={() => setView(g.view)}
            >
              {g.image ? (
                <Picture name={g.image} alt="" sizes="60px" />
              ) : (
                <span className="p-thumb-slot" aria-hidden="true">
                  +
                </span>
              )}
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
