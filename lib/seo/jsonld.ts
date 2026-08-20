import { CURRENCY, formatPriceValue, getUnitPrice } from "../pricing";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../site";
import { productPath, titleCase } from "../catalog";
import type { Breadcrumb, Category, Product } from "../types";

export type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(trail: readonly Breadcrumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.url),
    })),
  };
}

export function productDescription(product: Product): string {
  if (product.description) return product.description;

  const availability = product.inStock
    ? `In stock, ${product.stock} available`
    : "Currently out of stock";

  return `${product.name} from the ${titleCase(
    product.category
  )} range at ${SITE_NAME}. ${availability}. Priced at ${CURRENCY} ${formatPriceValue(
    getUnitPrice(product.price)
  )}, reduced from ${CURRENCY} ${formatPriceValue(product.price)}.`;
}

export function productSchema(product: Product): JsonLd {
  const url = absoluteUrl(productPath(product));

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    sku: product.sku || product.id,
    productID: product.id,
    category: titleCase(product.category),
    description: productDescription(product),
    offers: {
      "@type": "Offer",
      url,
      price: formatPriceValue(getUnitPrice(product.price)),
      priceCurrency: CURRENCY,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  if (product.image) schema.image = [product.image];
  if (product.brand) schema.brand = { "@type": "Brand", name: product.brand };

  return schema;
}

export function itemListSchema(
  products: readonly Product[],
  { name, url }: { name: string; url: string }
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(url),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(productPath(product)),
      name: product.name,
    })),
  };
}

export function collectionPageSchema(category: Category, url: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.label} at ${SITE_NAME}`,
    url: absoluteUrl(url),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@type": "Thing", name: category.label },
  };
}
