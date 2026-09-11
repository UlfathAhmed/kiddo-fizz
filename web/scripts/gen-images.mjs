/* Responsive image generation.
 *
 * The prototype inlined every image as a base64 data URI, which is why its pages
 * were 340KB–1.1MB each and nothing ever cached. Here the originals live in
 * ../prototype/assets and this emits real files at several widths so <Picture>
 * can hand the browser a srcset.
 *
 * Done at build time with sharp rather than by next/image, because the site is
 * built with output: "export" — a static export has no server to resize on
 * demand, and hosting is not decided yet.
 *
 * Run:  npm run images
 */
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "..", "prototype", "assets");
const OUT = join(HERE, "..", "public", "images");

/* Only the seven assets the design actually uses. The others in prototype/assets
   are superseded experiments and are not carried across. */
const ASSETS = {
  "logo.webp":            { name: "logo",           widths: [200, 400] },
  "hero-product.webp":    { name: "hero-product",   widths: [480, 768, 920] },
  "feature-bottle.webp":  { name: "feature-bottle", widths: [200, 340, 560] },
  "foot-bed.webp":        { name: "foot-bed",       widths: [768, 1200, 1500] },
  "card-one.webp":        { name: "card-one",       widths: [480, 750] },
  "card-two.webp":        { name: "card-two",       widths: [480, 750] },
  "case.webp":            { name: "case",           widths: [400, 620, 760] },
};

async function main() {
  if (!existsSync(SRC)) throw new Error("source assets not found at " + SRC);
  await mkdir(OUT, { recursive: true });

  const manifest = {};
  for (const [file, spec] of Object.entries(ASSETS)) {
    const input = join(SRC, file);
    if (!existsSync(input)) throw new Error("missing asset: " + input);

    const meta = await sharp(input).metadata();
    const widths = spec.widths.filter((w) => w <= meta.width);
    if (!widths.length) widths.push(meta.width);

    const sources = [];
    for (const w of widths) {
      const out = `${spec.name}-${w}.webp`;
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        // effort 5 is the sweet spot: near-max compression without a slow build
        .webp({ quality: 84, effort: 5 })
        .toFile(join(OUT, out));
      sources.push({ src: `/images/${out}`, width: w });
    }

    manifest[spec.name] = {
      sources,
      width: meta.width,
      height: meta.height,
      /* intrinsic ratio, so layout can reserve space and nothing shifts */
      aspect: +(meta.width / meta.height).toFixed(4),
    };
    console.log(
      spec.name.padEnd(16) + meta.width + "x" + meta.height +
      "  ->  " + widths.join(", ")
    );
  }

  await writeFile(
    join(HERE, "..", "content", "images.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );

  const files = (await readdir(OUT)).length;
  console.log("\nwrote " + files + " files to public/images and content/images.json");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
