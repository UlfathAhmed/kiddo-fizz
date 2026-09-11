import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/product/Gallery";
import { BtnLine, BtnSolid, Bubbles, PanelCard, Scallop } from "@/components/ui";
import { ProductSchema } from "@/components/Schema";
import { nutrition, nutritionNotice, product } from "@/content/product";

/* One product today, and the range page already has a slot for the second — so
   the route is a dynamic segment from the start rather than a rename later. */
export function generateStaticParams() {
  return [{ slug: product.slug }];
}

export const metadata: Metadata = {
  alternates: { canonical: "/products/bubblegum-drink" },
  title: product.name,
  description: product.lede,
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== product.slug) notFound();

  return (
    <>
      <Header current="/products" />
      <main id="main">
        {/* ------------------------------------------------------------ hero */}
        <section id="p-hero">
          <Bubbles />
          <div className="wrap p-hero-grid">
            <Gallery />

            <div className="p-info" data-reveal="now">
              <nav className="crumbs" aria-label="Breadcrumb">
                <Link href="/" prefetch={false}>Home</Link>
                <span aria-hidden="true">/</span>
                <Link href="/products" prefetch={false}>Products</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{product.name}</span>
              </nav>

              <h1>{product.name}</h1>
              <p className="p-lede">{product.lede}</p>

              <dl className="r-meta">
                {product.specs.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="p-actions">
                <BtnSolid href="/contact">Find a stockist</BtnSolid>
                <BtnLine href="#nutrition">See nutrition</BtnLine>
              </div>

              <p className="p-noprice">Sold through retailers &mdash; there is no direct checkout.</p>
            </div>
          </div>
          <Scallop />
        </section>

        {/* ------------------------------------------------------- nutrition */}
        <section id="nutrition">
          <div className="wrap">
            <p className="eyebrow" data-reveal>
              Nutrition
            </p>
            <h2 data-reveal>Per 100ml and per bottle.</h2>

            <div className="table-wrap" data-reveal>
              <table className="nutri">
                <caption className="visually-hidden">
                  Nutrition information per 100ml and per 250ml bottle
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Typical values</th>
                    <th scope="col">Per 100ml</th>
                    <th scope="col">Per bottle (250ml)</th>
                    <th scope="col">%NRV*</th>
                  </tr>
                </thead>
                <tbody>
                  {nutrition.map((row) =>
                    row.kind === "group" ? (
                      <tr key={row.label} className="group">
                        <th scope="row" colSpan={4}>
                          {row.label}
                        </th>
                      </tr>
                    ) : (
                      <tr key={row.label} className={row.kind === "sub" ? "sub" : undefined}>
                        <th scope="row">{row.label}</th>
                        <td>{row.per100}</td>
                        <td>{row.perBottle}</td>
                        <td>{row.nrv}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="notice" data-reveal>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5v4M8 11.2v.1" />
              </svg>
              <p>
                <strong>{nutritionNotice.strong}</strong> {nutritionNotice.body}
              </p>
            </div>
            <p className="fine">{nutritionNotice.footnote}</p>
          </div>
        </section>

        {/* ---------------------------------------------------- label claims */}
        <section id="p-inside">
          <div className="wrap">
            <p className="eyebrow" data-reveal>
              On the label
            </p>
            <h2 data-reveal>Everything it claims, in its own words.</h2>
            <p className="sec-sub">
              These are the nine claims printed on the bottle, transcribed exactly.
            </p>

            <ul className="claim-grid" data-reveal-stagger>
              {product.claims.map((c) => (
                <li key={c.no} data-reveal style={{ "--tint": c.tint } as React.CSSProperties}>
                  <span>{c.no}</span>
                  {c.label}
                  {c.note && <em>{c.note}</em>}
                </li>
              ))}
            </ul>

            <div className="two-col" data-reveal-stagger>
              <PanelCard
                title="Ingredients"
                placeholder={product.ingredients.placeholder}
                fine={product.ingredients.note}
              />
              <PanelCard
                title="Allergens"
                placeholder={product.allergens.placeholder}
                fine={product.allergens.note}
              />
            </div>
          </div>
        </section>

        <Footer />
      </main>
      <ProductSchema />
    </>
  );
}
