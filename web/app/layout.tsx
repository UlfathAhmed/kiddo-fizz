import type { Metadata } from "next";
import { Anton, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { SiteBehaviour } from "@/components/SiteBehaviour";
import { OrganizationSchema } from "@/components/Schema";
import { site, siteUrl } from "@/content/site";

import "@/styles/tokens.css";
import "@/styles/site.css";
import "@/styles/pages.css";
import "@/styles/contact.css";

/* Self-hosted by next/font, so there is no third-party request and no FOUT.
   Each family is exposed as a CSS variable that styles/tokens.css points at. */
const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const round = Fredoka({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-round", display: "swap" });
const body = Plus_Jakarta_Sans({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  /* Absolute URLs for canonical, Open Graph and Twitter come from here. Without
     it they resolve relative and are useless to a crawler or a link preview. */
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — ${site.strapline}`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: site.name,
    title: `${site.name} — ${site.strapline}`,
    description: site.description,
    url: "/",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: { index: true, follow: true },
  category: "food and drink",
};

/* The reveal system hides [data-reveal] only while .js-reveal is on <html>, so a
   page whose JavaScript never runs shows all of its content rather than none.
   This has to land before first paint, hence an inline script rather than an
   effect — an effect would let the content paint and then hide it. */
const REVEAL_CLASS = `document.documentElement.classList.add("js-reveal");`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${round.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_CLASS }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
        <OrganizationSchema />
        <SiteBehaviour />
      </body>
    </html>
  );
}
