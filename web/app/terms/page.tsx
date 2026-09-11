import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHead, PanelCard } from "@/components/ui";
import { legal } from "@/content/legal";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms of service",
  description: legal.terms.sub,
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  const p = legal.terms;
  return (
    <>
      <Header />
      <main id="main">
        <PageHead id="a-head" eyebrow={p.eyebrow} heading={p.heading} sub={p.sub} />
        <section id="a-body">
          <div className="wrap">
            <div className="notice" data-reveal>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5v4M8 11.2v.1" />
              </svg>
              <p>
                <strong>{p.notice.strong}</strong> {p.notice.body}
              </p>
            </div>

            <h2 data-reveal>{p.needsHeading}</h2>
            <p className="sec-sub" data-reveal>
              {p.needsSub}
            </p>

            <div className="two-col" data-reveal-stagger>
              {p.needs.map(([title, body]) => (
                <PanelCard key={title} title={title} body={body} placeholder="To be drafted" />
              ))}
            </div>

            <p className="fine" data-reveal>
              {p.fine}
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
