/* Site-wide content. Everything here was hard-coded in the prototype's markup.
   Keeping it as data is the seam a CMS plugs into later: these exports become
   fetches, and no component changes. */

export const site = {
  name: "KiddoFizz Drinks",
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

export const footerNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "/contact#c-faq" },
  { label: "Contact", href: "/contact" },
];

export const socials = ["facebook", "instagram", "tiktok"] as const;
export type Social = (typeof socials)[number];

export const marquee = ["Big fizz.", "Zero caffeine."];

/* The basket is hidden for now — the product pages say plainly that the drink is
   sold through retailers with no direct checkout, so a basket icon would promise
   something that does not exist. The account icon stays. */
export const showBasket = false;
