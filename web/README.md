# KiddoFizz Drinks — website

Next.js 16 (App Router, TypeScript), built as a **static export** so it deploys
anywhere while hosting is undecided.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Static export into `out/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run images` | Regenerate responsive images from `assets/` |
| `npm run brand` | Regenerate favicon, app icon, OG card and `public/_headers` |

Copy `.env.example` to `.env.local`. Both variables have safe defaults: the site
URL falls back to the intended domain, and with no form endpoint the contact form
disables itself rather than pretending to send.

`out/` is a plain folder of HTML, CSS, JS and images — upload it anywhere, or
point Netlify / Cloudflare Pages / Vercel at the repo.

## How it is arranged

| Path | What lives there |
|---|---|
| `app/` | Routes. `products/[slug]` is dynamic with one product today. |
| `components/` | `Header`, `Footer`, `Picture`, `Schema`, shared UI in `ui.tsx`, and the client components — `SiteBehaviour`, `MobileNav`, `home/HomeMotion`, `product/Gallery`. |
| `content/` | **All copy.** Nothing user-facing is hard-coded in a component. |
| `styles/` | The approved design, ported from the prototype unchanged. |
| `assets/` | Source images. `scripts/gen-images.mjs` turns these into `public/images/`. |

### `content/` is the CMS seam

Every string, claim, spec, nutrition row and FAQ is a typed export in `content/`.
When the CMS is chosen, these become fetches and **no component changes**.
Placeholders are data (`{ placeholder: "[ … ]" }`), not prose, so the outstanding
list can be generated rather than remembered.

### Styling

Plain global CSS, deliberately. The ~1,700 lines are hand-tuned — every
`clamp()`, the hero timing score, the optically-centred `SERIOUSLY` block. Class
names are already namespaced (`.hero-*`, `.foot-*`, `.p-*`, `.r-*`, `.c-*`), so
CSS Modules would mean renaming everything for no benefit on a site this size.

`styles/tokens.css` holds the design tokens, including `--in-*`: the hero
entrance as one legible score. Retime the whole sequence there.

### Motion

- **The hero entrance is CSS keyframes, on purpose.** GSAP's clock is
  `requestAnimationFrame`, which never starts in a hidden or embedded document.
  Driving the hero with it leaves the page blank at `opacity: 0` rather than
  merely unanimated. This was measured, not assumed.
- **GSAP earns its place twice**: the feature pop (fires once at full speed) and
  the showcase carousel (scrubbed, because it is a transition between two
  states). Both live in `HomeMotion`, inside a `gsap.context()` reverted on
  unmount — without that, ScrollTriggers accumulate on every navigation.
- **Reveals** are IntersectionObserver plus CSS transitions: `data-reveal` on
  anything that should arrive, `data-reveal-stagger` on a container whose
  children follow one another. The hiding rule is scoped to a `js-reveal` class
  set by an inline script in `<head>`, so a page whose JavaScript never runs
  shows everything rather than nothing.

Add `?debug=motion` to expose `window.__motion` for inspecting ScrollTriggers.
Add `?motion=reduced` to exercise the reduced-motion path.

## Production details

- **SEO** — per-page canonical URLs, Open Graph and Twitter cards, a generated
  `sitemap.xml` and `robots.txt`, and JSON-LD for the organisation and the
  product. The structured data deliberately omits `offers`, `nutrition` and
  `address`: those are factual claims about a real business and none of them is
  confirmed. An absent property costs nothing; a wrong one outlives the page.
- **Icons and the share card** are generated from the client's own logo and hero
  shot by `npm run brand`, so they cannot drift from the brand.
- **`public/_headers`** sets immutable caching for fingerprinted assets plus
  `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options`. Netlify and
  Cloudflare Pages read it; other hosts need the equivalent configured.
- **Accessibility** — a skip link, a real mobile menu with `aria-expanded`,
  Escape-to-close and focus return, 48px+ targets, and controls that do nothing
  kept out of the tab order rather than exposed as dead ends.
- **CI** (`.github/workflows/ci.yml`) runs lint, typecheck and build, then
  asserts the export contains every page, the sitemap, the OG image and all 17
  images — and **fails if placeholder wording reaches the output**. It caught
  "not wired up yet" shipping in the account icon and every social link.

## Known gaps

- **The privacy notice is a launch blocker.** The contact form collects a name,
  an email address and a message — personal data under UK GDPR. `/privacy` and
  `/terms` exist so the footer links are not dead, and each says plainly that
  the document is being prepared and lists what it must cover. No legal text is
  drafted: a privacy notice describes what a company actually does, and it has
  to come from KiddoFizz.
- **The contact form has no endpoint.** A static export has no API routes. Set
  `NEXT_PUBLIC_FORM_ENDPOINT` to a form service or a Laravel route.
- **No social URLs.** The icons render as plain marks until real links arrive.
- **No analytics or cookie consent.** If analytics is added, non-essential
  cookies need consent before they are set under PECR.
- **Link prefetching is disabled.** Next 16 requests segment payloads at
  `/about/__next.about.__PAGE__.txt` while the export writes them to
  `/about/__next.about/__PAGE__.txt` — a dot against a directory, so every
  prefetch 404s on a static host. Navigation is unaffected. Revisit on upgrade.
- **"Bubblegum Drink" is placeholder wording**, not the client's product name.
- Nutrition figures, ingredients, allergens, age guidance, About copy, the
  registered address and company number are deliberately blank and marked as
  such. They are legal declarations and are never invented.
