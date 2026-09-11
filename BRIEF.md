# KiddoFizz Cola — Brief & Pitch Decisions

_Captured 25 August 2026. This file is the reference for the build; the pitch plan lives alongside it._

## Brand

**KiddoFizz Cola** — a fun, modern, family-friendly soft drink brand. The hero product is a refreshing cola aimed especially at children and families.

- **Product:** KiddoFizz Cola, 250ml bottled carbonated soft drink
- **Audience:** children, parents, families
- **Market:** UK first, international expansion planned
- **Style:** fun, colourful, energetic, refreshing, premium — while staying trustworthy and family-friendly

### Product features
- Caffeine free
- Low calorie
- Contains Vitamins B3, B5, B6 and Vitamin C
- Bubblegum flavour
- Aspartame free
- Fun and refreshing cola concept

### Brand colours
Red, yellow, blue/cyan, green, black, white. Bright and colourful, but clean and professional.

### Client's stated priority
KiddoFizz must be the main focus and clearly visible. The design has to stand out on supermarket shelves and appeal to both children and parents.

---

## The design problem

Two audiences, opposite instincts. Too playful and parents don't trust the clean-label story; too clean and premium and kids scroll straight past.

**Resolution:** the 3D bottle and scroll motion carry the fun. The layout and typography carry the trust. Neither has to compromise the other.

---

## Decisions made

| Question | Decision |
|---|---|
| Pitch deliverable | Static mockups (design canvas) + one live animated section |
| Which section is live | The full pinned bottle sequence, not just the top fold |
| Mockup format | Design canvas artboards, published as a private link |
| 3D approach | Procedural `THREE.LatheGeometry` bottle now; swap for the client's real model at production |
| Production stack | Next.js + React Three Fiber + GSAP ScrollTrigger + Lenis |
| Brand assets | None exist — all placeholder, visibly marked as such |
| Copy | Client supplies. Placeholder sized to real slots |

### Why a 3D model and not a pre-rendered image sequence
An image sequence bakes in one fixed camera path. This bottle has to move position, tilt and scale independently across sections — that needs a separate sequence per section, and 120 frames at 1600px is ~25MB before the second angle. A mesh is a few hundred KB and GSAP tweens its transform freely.

At production, request the dieline or 3D file from the client's packaging supplier and swap the mesh. The animation code does not change.

---

## Colour rule

The brand has six colours. Used together they read as chaos, not premium.

1. **Near-white is the base canvas** on every section.
2. **One accent colour dominates per section** — the page becomes colourful by sequence, not by density.
3. **Brand red is reserved** for the wordmark and the primary CTA. Nothing else gets to be red.

This is the single decision that lets "bright and colourful" coexist with "clean and professional."

---

## Still needed from the client

- [ ] Logo files (vector preferred)
- [ ] Flat label artwork — this becomes the 3D bottle texture
- [ ] Brand fonts, if any are already licensed
- [ ] Bottle dieline or 3D file from the packaging supplier
- [ ] Final website copy
- [ ] Nutrition panel figures per 250ml bottle
- [ ] Stockist list for the UK launch

---

## Copy compliance (UK)

Flag to the client before copy is finalised — not a blocker for the pitch:

- **Health claims on food are regulated** under the GB Nutrition and Health Claims Register. Vitamin claims must use authorised wording, e.g. _"Vitamin C contributes to the normal function of the immune system"_ — not a freely written benefit statement.
- **CAP rules govern advertising food and drink to under-16s.** Low calorie likely keeps KiddoFizz clear of HFSS restrictions, but the client's own compliance team should confirm.

Placeholder copy follows the authorised wording pattern so layout is already sized correctly.
