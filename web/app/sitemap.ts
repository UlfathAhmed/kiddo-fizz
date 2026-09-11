import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { product } from "@/content/product";

/* output: "export" requires metadata routes to declare themselves static. */
export const dynamic = "force-static";

/* Emitted as a static sitemap.xml by the export. Priorities reflect what the
   site is actually for: the product is the point, About is a stub until the
   client writes it. */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/products/`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/products/${product.slug}/`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${siteUrl}/contact/`, lastModified: updated, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/about/`, lastModified: updated, changeFrequency: "yearly", priority: 0.4 },
  ];
}
