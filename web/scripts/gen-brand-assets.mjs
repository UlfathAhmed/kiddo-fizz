/* Favicon, app icon and the Open Graph card.
 *
 * All three are generated from the client's logo and the hero shot rather than
 * hand-made, so they cannot drift from the brand as the artwork changes. Run
 * again after any logo change.
 *
 * Run:  npm run brand
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, "..", "assets");
const APP = join(HERE, "..", "app");
const PUBLIC = join(HERE, "..", "public");

const CREAM = { r: 251, g: 242, b: 230, alpha: 1 };
const RED = { r: 200, g: 18, b: 26, alpha: 1 };

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  /* --- favicon / app icons: the logo on the brand cream, padded so it is not
     clipped by the circular masks some platforms apply */
  for (const [file, size, dir] of [
    ["icon.png", 512, APP],
    ["apple-icon.png", 180, APP],
  ]) {
    const pad = Math.round(size * 0.16);
    const logo = await sharp(join(ASSETS, "logo.webp"))
      .resize({ width: size - pad * 2, fit: "inside" })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: CREAM },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(join(dir, file));
    console.log(file.padEnd(18) + size + "x" + size);
  }

  /* --- Open Graph card: 1200x630, the bottle on the brand red. This is the
     image that represents the site in every share and link preview. */
  const W = 1200;
  const H = 630;
  const bottle = await sharp(join(ASSETS, "hero-product.webp"))
    .resize({ height: Math.round(H * 0.92), fit: "inside" })
    .toBuffer();
  const logo = await sharp(join(ASSETS, "logo.webp"))
    .resize({ width: 300, fit: "inside" })
    .toBuffer();

  await sharp({ create: { width: W, height: H, channels: 4, background: RED } })
    .composite([
      { input: bottle, left: Math.round(W * 0.52), top: Math.round(H * 0.08) },
      { input: logo, left: 72, top: 72 },
    ])
    .png()
    .toFile(join(APP, "opengraph-image.png"));
  console.log("opengraph-image.png  " + W + "x" + H);

  /* --- a note for whoever deploys, in the export root */
  await writeFile(
    join(PUBLIC, "_headers"),
    [
      "# Netlify / Cloudflare Pages read this. Long-cache the fingerprinted",
      "# build output; never cache the HTML, so a deploy is visible immediately.",
      "/_next/static/*",
      "  Cache-Control: public, max-age=31536000, immutable",
      "/images/*",
      "  Cache-Control: public, max-age=31536000, immutable",
      "/*",
      "  X-Content-Type-Options: nosniff",
      "  Referrer-Policy: strict-origin-when-cross-origin",
      "  X-Frame-Options: DENY",
      "",
    ].join("\n"),
    "utf8"
  );
  console.log("_headers             cache + security headers");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
