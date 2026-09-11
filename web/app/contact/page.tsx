import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Bubbles, Scallop } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { contact, faqs } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: contact.sub,
};

export default function ContactPage() {
  return (
    <>
      <Header current="/contact" />
      <main id="main">
        <section id="c-head">
          <Bubbles />
          <div className="c-bed" aria-hidden="true" />
          <div className="c-head-inner" data-reveal="now">
            <p className="c-eyebrow">{contact.eyebrow}</p>
            <h1>{contact.heading}</h1>
            <p className="c-sub">{contact.sub}</p>
          </div>
          <Scallop />
        </section>

        <section id="c-body">
          <div className="c-grid">
            <div className="c-form-head" data-reveal>
              <h2>{contact.formHeading}</h2>
              <p className="c-form-note">{contact.formNote}</p>
            </div>

            <ContactForm />

            <aside className="c-aside" data-reveal-stagger>
              {contact.cards.map((card) => (
                <article
                  key={card.title}
                  className="c-card"
                  data-reveal
                  style={{ "--tint": card.tint, "--on": card.onInk ? "#1A1512" : "#fff" } as React.CSSProperties}
                >
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <a href={`mailto:${card.email}`}>{card.email}</a>
                </article>
              ))}
              <div className="c-address" data-reveal>
                <h3>Registered office</h3>
                <p>
                  {site.legalName}
                  <br />
                  {site.registeredAddress}
                  <br />
                  {site.country}
                </p>
                <p className="c-co">Company no. {site.companyNumber.replace(/[[\]]/g, "").trim()}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* ------------------------------------------------------------- FAQ */}
        <section id="c-faq">
          <div className="wrap">
            <p className="eyebrow" data-reveal>
              {contact.faqEyebrow}
            </p>
            <h2 data-reveal>{contact.faqHeading}</h2>

            <div className="faq" data-reveal-stagger>
              {faqs.map((f, i) => (
                <details key={f.q} data-reveal open={i === 0}>
                  <summary>{f.q}</summary>
                  <div className="ans">
                    {f.placeholder ? (
                      <>
                        <p className="placeholder">{f.placeholder}</p>
                        {f.note && <p className="fine">{f.note}</p>}
                      </>
                    ) : (
                      <p>{f.a}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
