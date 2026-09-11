import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export: hosting is not decided yet, so the build has to produce plain
     files that work on Netlify, Cloudflare Pages, Vercel or a cPanel box alike.
     Consequences worth remembering:
       - no API routes, so the contact form needs a third-party endpoint (or a
         Laravel route later) before launch;
       - no on-demand image optimisation, which is why scripts/gen-images.mjs
         pre-generates widths and components/Picture.tsx writes its own srcset. */
  output: "export",

  /* /about -> /about/index.html, so the output works on hosts that do not
     rewrite extensionless URLs. */
  trailingSlash: true,

  images: {
    /* nothing here uses next/image; this keeps the export honest if anything does */
    unoptimized: true,
  },
};

export default nextConfig;
