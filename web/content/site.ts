/* Site-wide content. Everything here was hard-coded in the prototype's markup.
   Keeping it as data is the seam a CMS plugs into later: these exports become
   fetches, and no component changes. */

/* Where the site will live. Hosting is not settled, so it comes from the
   environment with the intended domain as the default — metadataBase, the
   sitemap and every canonical URL are built from this one value. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiddofizz.co.uk"
).replace(/\/+$/, "");

export const site = {
  name: "KiddoFizz Drinks",
  strapline: "Skip the caffeine, keep the fizz",
  /* Placeholder wording, not the client's. Confirm before launch. */
  productName: "Bubblegum Drink",
  tagline: "Skip the caffeine.\nKeep the fizz.",
  description:
    "A caffeine-free bubblegum drink for UK families. No aspartame, low calorie, " +
    "with sugars from apple juice and added vitamins B3, B5, B6 and C.",
  legalName: "KiddoFizz Ltd",
  companyNumber: "[ COMPANY NO. ]",
  registeredAddress: "[ REGISTERED ADDRESS ]",
  country: "United Kingdom",
  year: 2026,
} as const;

export type NavLink = { label: string; href: string };

export const nav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Product", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export const legalNav: NavLink[] = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];

export const footerNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "/contact#c-faq" },
  { label: "Contact", href: "/contact" },
];

/* Social accounts. A null url means the client has not supplied one, and the
   icon renders as a plain mark rather than a link to nowhere — a dead link is
   worse than no link, and "not wired up yet" should never reach a visitor. */
export type Social = { name: string; url: string | null };
export const socials: Social[] = [
  { name: "Facebook", url: null },
  { name: "Instagram", url: null },
  { name: "TikTok", url: null },
];

/* There is no account system yet. The icon stays in the design, but it is kept
   out of the accessibility tree and the tab order until it does something —
   a focusable control that goes nowhere is a trap for keyboard and screen
   reader users. */
export const accountReady = false;

export const marquee = ["Big fizz.", "Zero caffeine."];

/* The basket is hidden for now — the product pages say plainly that the drink is
   sold through retailers with no direct checkout, so a basket icon would promise
   something that does not exist. The account icon stays. */
export const showBasket = false;
