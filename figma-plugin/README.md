# KiddoFizz Drinks — Figma design builder

A Figma plugin that builds the website design as native, editable Figma layers.
Nothing here is a screenshot: every frame is real geometry with auto-layout,
and the colour and type come in as actual Figma styles.

## Install and run

1. Unzip this folder anywhere.
2. In the Figma **desktop app**, open or create a file.
3. Menu → **Plugins → Development → Import plugin from manifest…**
4. Pick `manifest.json` from this folder.
5. Menu → **Plugins → Development → KiddoFizz Drinks — build design file**.

It runs for a few seconds and then closes itself, leaving a new page called
**KiddoFizz — Website design** with everything on it.

> The desktop app is required — importing a local plugin is not possible in the
> browser version of Figma.

## What it makes

- A **Read me** board explaining the file and what is still awaiting the client.
- **Five pages at 1440px**: Home, About, Products, Product detail, Contact.
- **The same five at 390px**, so the responsive decisions are on record.
- **14 colour styles** named to match the CSS custom properties in the prototype
  (`Brand / Red`, `Logo / Green`, `Surface / Red field`, and so on).
- **10 text styles** — `Display / Hero`, `Heading / H2`, `Label / Eyebrow`, etc.

Run it twice and you get two copies; it always builds onto a new page and never
edits what is already in the file.

## Fonts

The design uses **Anton**, **Fredoka** and **Plus Jakarta Sans** — all free from
Google Fonts. If any are missing, the plugin substitutes the closest thing it can
load rather than failing, and tells you what it swapped in the message when it
finishes. For an exact match, install those three first.

## Known limits

- **Scroll animation is not represented.** Figma holds the end state of each
  section. The motion lives in the HTML prototype.
- **Gradients are simplified.** The CSS red field is an off-centre radial; Figma
  gets a centred one. Visually very close, structurally simpler to edit.
- **The sunburst rays and the marquee** are approximated — the rays are omitted
  and the marquee is a single line of type rather than a scrolling loop.
- **Scalloped edges** are real half-circles in a clipped frame, so they can be
  restyled, but they are geometry rather than a repeating background.

## Editing and rebuilding

`code.js` is generated. Edit `src/code.src.js`, then:

```
node build.mjs
```

That injects the images from `img/` as base64 and writes `code.js`. Reload the
plugin in Figma to pick up changes.

`test/mock-run.mjs` runs the whole builder against a stand-in Figma API in Node.
It cannot tell you the design looks right, but it catches typos, bad API calls
and impossible geometry before Figma ever sees them:

```
node test/mock-run.mjs src/code.src.js
```

## Images

`img/` holds PNG and JPEG copies of the product shots. Figma's `createImage`
accepts PNG, JPEG and GIF only — **not WebP** — so the WebP assets used on the
site were converted and downsized for this purpose. They are the reason `code.js`
is a few megabytes.
