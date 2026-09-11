# KiddoFizz Cola — client pitch

Two deliverables for the KiddoFizz Cola website pitch. Production build starts only if the client approves.

| | What | Where |
|---|---|---|
| **Design canvas** | All ten page sections as artboards | `design/` |
| **Motion prototype** | Hero + the pinned bottle scroll sequence, running for real | `prototype/` |

The brief, the decisions behind both, and the outstanding asks of the client are in [BRIEF.md](BRIEF.md).

---

## Requirements

Node 18+. That is the whole list — there is no package.json and no dependency install. Three.js and GSAP are vendored under `prototype/vendor/`.

## Design canvas

Artboards are **generated**, not hand-written. Edit the generator, never the `.dc.html` files — they are overwritten on every run.

```bash
node design/build_artboards.mjs
```

Writes ten `.dc.html` artboards plus `canvas.json` (layout, artboard titles, sticky notes).

To republish after a change, re-seed and publish `design/kiddofizz-cola-website.html` to the same artifact URL.

## Motion prototype

```bash
node prototype/build.mjs
```

Inlines `src/styles.css`, `src/page.html` and `src/app.js` together with the vendored libraries into two outputs:

- **`index.html`** — what gets published. No doctype: the artifact platform supplies one.
- **`preview.html`** — identical plus a doctype, for local testing.

Test against `preview.html`, never `index.html`. Without the doctype the browser drops into quirks mode, `body` becomes the scrolling element, and ScrollTrigger silently stops working — the bug will not reproduce in the published version.

Add `?motion=reduced` to any URL to force the reduced-motion build.

## Local server

```bash
node server.mjs
```

Serves the repo on <http://localhost:5178>. The design preview is at `/`, the prototype at `/prototype/preview.html`.

---

## How the bottle works

`prototype/src/app.js` builds it procedurally: a 2D profile curve (`PROFILE`) revolved around Y with `LatheGeometry`. The contour waist, the twin bulges and the long narrow neck are what make it read as a cola bottle rather than a generic one.

The label is a **lathe sliced out of the same profile**, not a cylinder — that is what keeps it sitting on the glass through the waist. Its texture is drawn in a 2D canvas at run time and printed **four times** around the bottle, because the sequence turns a quarter rotation per beat and every one of 0°/90°/180°/270° has to land on a design centre rather than a seam.

**Swapping in the real bottle:** replace `buildBottle()` with a loader for the client's `.glb`. Nothing in the scroll code depends on how the mesh was made.

## How the scroll works

Three `ScrollTrigger`s write to plain variables — `approach`, `seq`, `exit`. Nothing is tweened by GSAP directly. The render loop reads those, computes targets, and damps toward them frame-rate independently. Rotation, horizontal position, scale, page colour, panel cross-fades and the progress dots all derive from `seq`.

Two things worth knowing before editing:

- **Never put `overflow-x: hidden` on `body`.** It makes `body` a scroll container, which breaks both ScrollTrigger and `position: sticky`. Use `overflow-x: clip` on `html`.
- **The panel cross-fade window must overlap.** Adjacent beats sit on opposite sides of the screen, so overlap is invisible — but a window that reaches zero on both sides at the midpoint leaves a gap where no copy is on screen at all.

## Production build

Approved stack is Next.js + React Three Fiber + GSAP ScrollTrigger + Lenis. This prototype is vanilla on purpose — it had to publish as one self-contained file — but the profile curve, label texture routine, beat timings and colour logic all port across directly.
