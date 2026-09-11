import images from "@/content/images.json";

type Manifest = Record<
  string,
  { sources: { src: string; width: number }[]; width: number; height: number; aspect: number }
>;

const manifest = images as Manifest;

export type PictureName = keyof typeof images;

type Props = {
  /* key in content/images.json, produced by scripts/gen-images.mjs */
  name: string;
  alt: string;
  /* the `sizes` attribute — how wide this renders, so the browser can pick */
  sizes?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

/**
 * Plain <img> with a generated srcset.
 *
 * Not next/image: the site builds with output: "export", which has no server to
 * resize on demand, so the widths are produced at build time by sharp instead.
 * This keeps the output deployable to any static host, which matters while
 * hosting is undecided.
 */
export function Picture({
  name,
  alt,
  sizes = "100vw",
  className,
  priority = false,
  width,
  height,
}: Props) {
  const entry = manifest[name];
  if (!entry) throw new Error(`Picture: no generated image named "${name}" — run npm run images`);

  const largest = entry.sources[entry.sources.length - 1];
  const srcSet = entry.sources.map((s) => `${s.src} ${s.width}w`).join(", ");

  return (
    <img
      src={largest.src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      /* intrinsic dimensions reserve the space, so nothing shifts as it loads */
      width={width ?? entry.width}
      height={height ?? entry.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
    />
  );
}
