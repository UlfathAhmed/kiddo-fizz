import Link from "next/link";
import { footerNav, marquee, site } from "@/content/site";
import { Picture } from "./Picture";

const socialIcons = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H6v3h2v8h3v-8h2.5l.5-3H11V7.6c0-.6.4-1 1-1h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 3h2.6a5.4 5.4 0 0 0 4.4 4.3v2.7a8 8 0 0 1-4.4-1.4v6.2a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.8a3 3 0 1 0 2.1 2.9z" />
    </svg>
  ),
};

export function Footer() {
  /* the marquee is a loop, so the row is repeated to cover the travel */
  const run = Array.from({ length: 4 }, () => marquee).flat();

  return (
    <footer id="site-footer">
      <div className="foot-scallop" aria-hidden="true" />
      <div className="foot-rays" aria-hidden="true" />
      <div className="foot-bed" aria-hidden="true" />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-row">
          {run.map((word, i) => (
            <span key={i} className={i % 2 ? "dim" : undefined}>
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="foot-inner">
        <div className="foot-left">
          <Picture name="logo" alt="KiddoFizz" className="foot-logo" sizes="132px" width={132} height={48} />
          <nav className="foot-nav">
            {footerNav.map((item) => (
              <Link key={item.label} href={item.href} prefetch={false}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="foot-right">
          <p className="foot-tag">
            {site.tagline.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          <div className="socials">
            {(Object.keys(socialIcons) as Array<keyof typeof socialIcons>).map((key) => (
              <a key={key} href="#" aria-label={`${key[0].toUpperCase()}${key.slice(1)} (not wired up yet)`}>
                {socialIcons[key]}
              </a>
            ))}
          </div>
          <p className="foot-legal">
            <a href="#">Privacy policy</a> &middot; <a href="#">Terms of service</a>
          </p>
          <p className="foot-copy">
            &copy; {site.year} {site.legalName} &middot; {site.companyNumber} &middot; Made in the UK
          </p>
        </div>
      </div>
    </footer>
  );
}
