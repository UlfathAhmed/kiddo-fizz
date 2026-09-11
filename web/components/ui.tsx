import Link from "next/link";
import type { ReactNode } from "react";

/* Small shared pieces, all styling already in styles/pages.css. */

export function Scallop() {
  return <div className="scallop" aria-hidden="true" />;
}

export function Bubbles() {
  /* filled at runtime by SiteBehaviour — kept empty here so the markup that
     ships is not full of decorative <i> elements */
  return <div className="bubbles" aria-hidden="true" />;
}

type BtnProps = { href: string; children: ReactNode; className?: string };

export function BtnSolid({ href, children }: BtnProps) {
  const inner = <>{children}</>;
  return href.startsWith("/") ? (
    <Link className="btn-solid" href={href} prefetch={false}>{inner}</Link>
  ) : (
    <a className="btn-solid" href={href}>{inner}</a>
  );
}

export function BtnLine({ href, children, className }: BtnProps) {
  const cls = className ? `btn-line ${className}` : "btn-line";
  return href.startsWith("/") ? (
    <Link className={cls} href={href} prefetch={false}>{children}</Link>
  ) : (
    <a className={cls} href={href}>{children}</a>
  );
}

export function Notice({ strong, children }: { strong: string; children: ReactNode }) {
  return (
    <div className="notice" data-reveal>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 5v4M8 11.2v.1" />
      </svg>
      <p>
        <strong>{strong}</strong> {children}
      </p>
    </div>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <p className="placeholder">{children}</p>;
}

export function PanelCard({
  title,
  body,
  placeholder,
  fine,
}: {
  title: string;
  body?: string;
  placeholder?: string;
  fine?: string;
}) {
  return (
    <div className="panel-card" data-reveal>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {placeholder && <span className="placeholder">{placeholder}</span>}
      {fine && <p className="fine">{fine}</p>}
    </div>
  );
}

/* The red header used by About, Products and Contact. */
export function PageHead({
  id,
  eyebrow,
  heading,
  sub,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  sub: string;
}) {
  return (
    <section id={id} className="page-head">
      <Bubbles />
      <div className="wrap" data-reveal="now">
        <p className="c-eyebrow">{eyebrow}</p>
        <h1>
          {heading.split("\n").map((line, i, all) => (
            <span key={i}>
              {line}
              {i < all.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="c-sub">{sub}</p>
      </div>
      <Scallop />
    </section>
  );
}
