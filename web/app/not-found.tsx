import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BtnLine, BtnSolid, Bubbles, Scallop } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <section id="nf-head" className="page-head">
          <Bubbles />
          <div className="wrap" data-reveal="now">
            <p className="c-eyebrow">Error 404</p>
            <h1>
              Lost the
              <br />
              fizz.
            </h1>
            <p className="c-sub">
              That page is not here. It may have moved, or the link may have been mistyped.
            </p>
            <div className="p-actions">
              <BtnSolid href="/">Back to the start</BtnSolid>
              <BtnLine href="/products">See the drink</BtnLine>
            </div>
          </div>
          <Scallop />
        </section>
        <Footer />
      </main>
    </>
  );
}
