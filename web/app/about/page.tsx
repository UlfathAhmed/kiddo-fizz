import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHead, PanelCard } from "@/components/ui";
import { about } from "@/content/pages";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us",
  description: about.sub,
};

export default function AboutPage() {
  return (
    <>
      <Header current="/about" />
      <main id="main">
        <PageHead id="a-head" eyebrow={about.eyebrow} heading={about.heading} sub={about.sub} />

        <section id="a-body">
          <div className="wrap">
            <div className="notice" data-reveal>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8h.01M11 12h1v4h1" />
              </svg>
              <p>
                <strong>{about.notice.strong}</strong> {about.notice.body}
              </p>
            </div>

            <h2 data-reveal>{about.needsHeading}</h2>
            <p className="sec-sub" data-reveal>
              {about.needsSub}
            </p>

            <div className="two-col" data-reveal-stagger>
              {about.needs.map(([title, body]) => (
                <PanelCard key={title} title={title} body={body} placeholder="Client to supply" />
              ))}
            </div>

            <p className="fine" data-reveal>
              {about.fine}
            </p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
