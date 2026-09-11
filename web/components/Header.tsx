import Link from "next/link";
import { accountReady, nav, showBasket, site } from "@/content/site";
import { Picture } from "./Picture";
import { MobileNav } from "./MobileNav";

/* The icon set, inline rather than as files: five small paths that never change
   and would otherwise be five more requests. */
const icons = {
  basket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3.5h2.8l2.6 11.7a1.7 1.7 0 0 0 1.7 1.3h8a1.7 1.7 0 0 0 1.7-1.3L21 7.5H6" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  ),
};

export function Header({ current }: { current?: string }) {
  return (
    <header>
      <div className="pill">
        <Link className="brand" href="/" prefetch={false} aria-label={`${site.name} home`}>
          <Picture name="logo" alt="KiddoFizz" sizes="104px" priority width={104} height={38} />
        </Link>

        <nav>
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

        <div className="actions">
          {showBasket && (
            <a className="icon-btn" href="/basket" aria-label="Basket">
              {icons.basket}
            </a>
          )}
          {accountReady ? (
            <a className="icon-btn" href="/account" aria-label="Your account">
              {icons.account}
            </a>
          ) : (
            <span className="icon-btn" aria-hidden="true">
              {icons.account}
            </span>
          )}
          <MobileNav current={current} />
        </div>
      </div>
    </header>
  );
}
