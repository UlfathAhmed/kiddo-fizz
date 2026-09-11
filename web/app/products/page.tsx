import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Picture } from "@/components/Picture";
import { BtnLine, BtnSolid, PageHead } from "@/components/ui";
import { products } from "@/content/pages";
import { product } from "@/content/product";

export const metadata: Metadata = {
  title: "Products",
  description: products.sub,
};

export default function ProductsPage() {
  return (
    <>
      <Header current="/products" />
      <main id="top">
        <PageHead id="r-head" eyebrow={products.eyebrow} heading={products.heading} sub={products.sub} />

        <section id="r-body">
          <div className="r-wrap">
            <article className="r-item">
              <div className="r-shot" data-reveal>
                <div className="r-glow" aria-hidden="true" />
                <Picture
                  name="feature-bottle"
                  alt={`KiddoFizz ${product.name}, 250ml bottle`}
                  sizes="(max-width: 860px) 240px, 340px"
                />
              </div>

              <div className="r-info" data-reveal>
                <p className="r-kicker">In stock now</p>
                <h2>{product.name}</h2>
                <p className="r-lede">{product.rangeLede}</p>

                <ul className="r-chips" data-reveal-stagger>
                  {product.chips.map((chip) => (
                    <li key={chip.label} data-reveal style={{ "--tint": chip.tint } as React.CSSProperties}>
                      {chip.label}
                    </li>
                  ))}
                </ul>

                <dl className="r-meta">
                  {product.specs.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="r-actions">
                  <BtnSolid href={`/products/${product.slug}`}>See full details</BtnSolid>
                  <BtnLine href="#">Find a stockist</BtnLine>
                </div>
              </div>
            </article>

            <article className="r-item soon">
              <div className="r-shot" data-reveal>
                <div className="r-ghost" aria-hidden="true" />
              </div>
              <div className="r-info" data-reveal>
                <p className="r-kicker muted">{products.soon.kicker}</p>
                <h2>{products.soon.title}</h2>
                <p className="r-lede">{products.soon.lede}</p>
                <div className="r-actions">
                  <BtnLine href="#" className="dark">
                    {products.soon.cta}
                  </BtnLine>
                </div>
              </div>
            </article>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
