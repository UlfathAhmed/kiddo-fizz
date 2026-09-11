import type { Metadata } from "next";
import { Anton, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { SiteBehaviour } from "@/components/SiteBehaviour";
import { site } from "@/content/site";

import "@/styles/tokens.css";
import "@/styles/site.css";
import "@/styles/pages.css";
import "@/styles/contact.css";

/* Self-hosted by next/font. The prototype pulled these from Google over a
   render-blocking <link>; this removes the third-party request entirely and
   exposes each family as a CSS variable that styles/tokens.css points at. */
const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const round = Fredoka({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-round",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

/* The reveal system hides [data-reveal] only while .js-reveal is on <html>, so a
   page whose JavaScript never runs shows all of its content rather than none.
   This has to land before first paint, which is why it is an inline script in
   <head> and not an effect — an effect would let the content paint, then hide. */
const REVEAL_CLASS = `document.documentElement.classList.add("js-reveal");`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${round.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_CLASS }} />
      </head>
      <body>
        {children}
        <div className="badge">
          Prototype<span className="badge-long"> &middot; placeholder copy</span>
        </div>
        <SiteBehaviour />
      </body>
    </html>
  );
}
