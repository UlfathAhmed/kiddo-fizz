# KiddoFizz Drinks

Website for a caffeine-free bubblegum drink aimed at UK families.

| Path | What it is |
|---|---|
| `web/` | **The site.** Next.js 16, App Router, TypeScript, static export. See `web/README.md`. |
| `Images/` | The client's original artwork — the source of truth for every asset. |
| `tools/` | Browser-based image pipeline: background keyer, registration, inspection. Run `node server.mjs` and open <http://localhost:5178/tools/key.html>. |
| `figma-plugin/` | Builds the design as native, editable Figma layers. See its own README. |
| `server.mjs` | Tiny static server for `tools/`; writes results into `web/assets/`. |

## Getting started

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # static export into web/out/
```

## History

This began as a pitch prototype — five hand-built pages compiled into
self-contained HTML files with every image base64-inlined, made to email to the
client. That prototype and the original design-canvas artboards were removed once
the design was approved and the real codebase existed. Both are in the git
history at the initial commit if they are ever wanted back.

## Still waiting on the client

Marked as visible placeholders throughout, never invented — nutrition figures,
ingredients, allergen statement, age guidance, About copy, registered address
and company number, stockist list, label material, case-wrap disposal, and
confirmation of the product name (**"Bubblegum Drink" is placeholder wording**).

Nutrition and allergen data are legal declarations; a plausible-looking invented
figure is worse than an obvious gap because it can survive a review unnoticed.
