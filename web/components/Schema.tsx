import { site, siteUrl } from "@/content/site";
import { product } from "@/content/product";

/* Structured data, kept deliberately thin.
 *
 * Schema.org markup is read by search engines as factual claims about a real
 * business and a real product. Anything not confirmed by the client is simply
 * omitted rather than guessed — no `offers` (there is no price and no direct
 * checkout), no `nutrition` (the figures are blank), no `address` (the
 * registered address is still a placeholder). An absent property costs nothing;
 * a wrong one is a misrepresentation that outlives the page.
 */

function Json({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.legalName,
        alternateName: site.name,
        url: siteUrl,
        logo: `${siteUrl}/images/logo-400.webp`,
        description: site.description,
        /* country only — the registered address is not confirmed yet */
        areaServed: "GB",
      }}
    />
  );
}

export function ProductSchema() {
  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.lede,
        image: `${siteUrl}/images/hero-product-920.webp`,
        brand: { "@type": "Brand", name: site.name },
        url: `${siteUrl}/products/${product.slug}`,
      }}
    />
  );
}
