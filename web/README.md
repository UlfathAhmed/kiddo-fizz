# KiddoFizz Drinks — website

Next.js 16 (App Router, TypeScript), built as a **static export** so it deploys
anywhere while hosting is undecided.

## Running it

```bash
npm install
npm run images   # regenerate responsive images from ../prototype/assets
npm run dev      # http://localhost:3000
npm run build    # static export into out/
```

`out/` is a plain folder of HTML, CSS, JS and images — upload it anywhere, or
point Netlify / Cloudflare Pages / Vercel at the repo.

## How it is arranged

| Path | What lives there |
|---|---|
| `app/` | Routes. One file per page; `products/[slug]` is a dynamic route with one product today. |
| `components/` | `Header`, `Footer`, `Picture`, shared UI in `ui.tsx`, and the two client components — `SiteBehaviour` and `home/HomeMotion`. |
| `content/` | **All copy.** Nothing user-facing is hard-coded in a component. |
| `styles/` | The approved design, ported from the prototype unchanged. |
| `scripts/gen-images.mjs` | Builds the responsive images and `content/images.json`. |

### `content/` is the CMS seam

Every string, claim, spec, nutrition row and FAQ is a typed export in `content/`.
When the CMS is chosen, these become fetches and **no component changes**.
Placeholders are data (`{ placeholder: "[ … ]" }`), not prose, so the outstanding
list can be generated rather than remembered.

### Styling

Plain global CSS, deliberately. The prototype's ~1,700 lines are hand-tuned —
every `clamp()`, the hero timing score, the optically-centred `SERIOUSLY` block.
Class names are already namespaced (`.hero-*`, `.foot-*`, `.p-*`, `.r-*`, `.c-*`),
so CSS Modules would mean renaming everything for no benefit on a five-page site.

`styles/tokens.css` holds the design tokens, including `--in-*`: the hero
entrance as one legible score. Retime the whole sequence there.

### Motion

- **Hero entrance is CSS keyframes, on purpose.** GSAP's clock is
  `requestAnimationFrame`, which never starts in a hidden or embedded document.
  Driving the hero with it leaves the page blank at `opacity: 0` rather than
  merely unanimated. This was measured, not assumed.
- **GSAP earns its place twice**: the feature pop (fires once at full speed) and
  the showcase carousel (scrubbed, because it is a transition between two states).
  Both live in `HomeMotion`, inside a `gsap.context()` reverted on unmount —
  without that, ScrollTriggers accumulate on every navigation.
- **Reveals** are IntersectionObserver plus CSS transitions: `data-reveal` on
  anything that should arrive, `data-reveal-stagger` on a container whose
  children follow one another. The hiding rule is scoped to a `js-reveal` class
  set by an inline script in `<head>`, so a page whose JavaScript never runs
  shows everything rather than nothing.

Add `?debug=motion` to expose `window.__motion` for inspecting ScrollTriggers.
Add `?motion=reduced` to exercise the reduced-motion path.

## Known gaps

- **The contact form has no endpoint.** A static export has no API routes; it
  needs a form service or a Laravel route before launch. It currently prevents
  submission rather than pretending to send.
- **Link prefetching is disabled.** Next 16 requests segment payloads at
  `/about/__next.about.__PAGE__.txt` while the export writes them to
  `/about/__next.about/__PAGE__.txt` — a dot against a directory, so every
  prefetch 404s on a static host. Navigation is unaffected. Revisit on a Next
  upgrade; on a five-page site the cost is negligible.
- **"Bubblegum Drink" is placeholder wording**, not the client's product name.
- Nutrition figures, ingredients, allergens, age guidance, About copy, the
  registered address and company number are all deliberately blank and marked as
  such. They are legal declarations and are never invented.
