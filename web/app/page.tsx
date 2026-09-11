import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Picture } from "@/components/Picture";
import { Bubbles, Scallop } from "@/components/ui";
import { HomeMotion } from "@/components/home/HomeMotion";
import { home } from "@/content/pages";
import { product } from "@/content/product";

export default function HomePage() {
  return (
    <>
      <Header current="/" />
      <main>
        {/* ------------------------------------------------------------ hero */}
        <section id="hero">
          <Bubbles />

          <h1 className="hero-title">{home.heroTitle}</h1>

          <p className="hero-note">{home.heroNote}</p>

          <div className="hero-stage">
            <Picture
              name="hero-product"
              alt="KiddoFizz Bubblegum, 250ml bottle"
              className="hero-product"
              sizes="(max-width: 860px) 90vw, 700px"
              priority
            />
          </div>

          <a className="hero-cta" href="#feature">
            {home.heroCta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16M5 13l7 7 7-7" />
            </svg>
          </a>

          <Scallop />
        </section>

        {/* --------------------------------------------------------- feature */}
        <section id="feature">
          <div className="rays-clip" aria-hidden="true">
            <div className="rays" />
          </div>
          <div className="confetti" aria-hidden="true" />

          <div className="feature-head">
            <p className="eyebrow">{home.featureEyebrow}</p>
            <h2>{home.featureHeading}</h2>
            <p className="sub">{home.featureSub}</p>
          </div>

          <div className="feature-body">
            <div className="pop" aria-hidden="true" />
            <Picture
              name="feature-bottle"
              alt="KiddoFizz Bubblegum bottle, chilled"
              className="feature-bottle"
              sizes="(max-width: 860px) 150px, 200px"
            />

            <ul className="cards">
              {home.featureCards.map(([title, body, tint, onInk], i) => (
                <li
                  key={title}
                  className={`card c${i + 1} ${i < 3 ? "l" : "r"}`}
                  style={{ "--tint": tint, "--on": onInk ? "#1A1512" : "#fff" } as React.CSSProperties}
                >
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="lead" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------- showcase */}
        <section id="showcase">
          <div className="show-stage">
            <div className="panel">
              <div className="show-head">
                <h2>
                  <span className="l1">{home.showcase.l1}</span>
                  <span className="l2">{home.showcase.l2}</span>
                  <span className="l3">{home.showcase.l3}</span>
                </h2>
              </div>

              <a className="show-cta" href="#showcase">
                {home.showcase.cta}
              </a>

              <div className="track">
                <article className="pcard one">
                  <Picture
                    name="card-one"
                    alt={`KiddoFizz ${product.name}, 250ml bottle on ice`}
                    className="pcard-img"
                    sizes="(max-width: 860px) 90vw, 460px"
                  />
                </article>
                <article className="pcard soon">
                  <Picture name="card-two" alt="" className="pcard-img" sizes="(max-width: 860px) 90vw, 460px" />
                  <h3>Flavour two</h3>
                  <p className="soon-tag">Coming soon</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
      <HomeMotion />
    </>
  );
}
