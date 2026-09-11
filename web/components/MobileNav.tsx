"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { nav } from "@/content/site";

/**
 * The burger, and the menu it opens.
 *
 * Below 900px the stylesheet hides the inline nav and shows a burger. In the
 * prototype that burger was an <a href="#"> labelled "not wired up yet", which
 * meant phones had no navigation at all — the majority of visitors to a family
 * drinks brand, with no way to reach any other page.
 */
export function MobileNav({ current }: { current?: string }) {
  const pathname = usePathname();
  /* Derived, not stored: the sheet is open only while the route it was opened
     on is still the current one. Navigating closes it for free — resetting it
     from an effect instead would be a setState inside useEffect, which triggers
     a cascading render. */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenedOn(null);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpenedOn(null);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);

    /* hold the page still while the sheet is over it */
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* move focus into the sheet so a keyboard or screen reader lands there */
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn burger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className={`nav-sheet${open ? " open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Main">
          {nav.map((item) => {
            const on = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={on ? "on" : undefined}
                aria-current={on ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
