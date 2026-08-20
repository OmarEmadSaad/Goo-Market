import { describe, expect, it } from "vitest";

import {
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
  organizationSchema,
  productDescription,
  productSchema,
  websiteSchema,
} from "@/lib/seo/jsonld";
import { getUnitPrice } from "@/lib/pricing";
import { makeProduct } from "./fixtures";

/**
 * Structured data has to describe exactly what the page shows. Inventing a
 * rating or a brand - which the old product page did on every request - is
 * what gets rich results pulled, so several of these assert an absence.
 */

describe("productSchema", () => {
  const product = makeProduct();

  it("emits a Product with an Offer built from catalog data", () => {
    const schema = productSchema(product) as Record<string, any>;

    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Fan");
    expect(schema.sku).toBe("el01");
    expect(schema.productID).toBe("el01");
    expect(schema.category).toBe("Electronics");
    expect(schema.url).toBe("https://goomarket.test/product/fan-el01");
    expect(schema.image).toEqual([product.image]);
  });

  it("prices the Offer at the price the shopper actually pays", () => {
    const schema = productSchema(product) as Record<string, any>;
    expect(schema.offers.price).toBe("630.00");
    expect(schema.offers.price).toBe(getUnitPrice(product.price).toFixed(2));
    expect(schema.offers.priceCurrency).toBe("EGP");
  });

  it("reports availability from real stock", () => {
    expect(
      (productSchema(product) as any).offers.availability
    ).toBe("https://schema.org/InStock");

    expect(
      (productSchema(makeProduct({ stock: 0, inStock: false })) as any).offers
        .availability
    ).toBe("https://schema.org/OutOfStock");
  });

  it("omits brand when the catalog has no brand", () => {
    // Regression: every card claimed `Brand: Essence` and every product page
    // claimed `Brand: Generic`.
    expect(productSchema(product)).not.toHaveProperty("brand");
  });

  it("includes brand only when the record genuinely carries one", () => {
    const schema = productSchema(makeProduct({ brand: "Zanussi" })) as any;
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Zanussi" });
  });

  it("never emits aggregateRating or review", () => {
    // Regression: the product page defaulted `rating` to 4.5 for everything.
    const schema = productSchema(product);
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });

  it("uses the same description the page renders", () => {
    const schema = productSchema(product) as any;
    expect(schema.description).toBe(productDescription(product));
  });

  it("omits the image array when there is no image", () => {
    expect(productSchema(makeProduct({ image: "" }))).not.toHaveProperty("image");
  });
});

describe("productDescription", () => {
  it("prefers a stored description", () => {
    const product = makeProduct({ description: "A quiet desk fan." });
    expect(productDescription(product)).toBe("A quiet desk fan.");
  });

  it("otherwise states category, stock and both prices, all factual", () => {
    const text = productDescription(makeProduct());
    expect(text).toContain("Fan");
    expect(text).toContain("Electronics");
    expect(text).toContain("In stock, 7 available");
    expect(text).toContain("EGP 630.00");
    expect(text).toContain("EGP 700.00");
  });

  it("says out of stock when stock is zero", () => {
    const text = productDescription(makeProduct({ stock: 0, inStock: false }));
    expect(text).toContain("Currently out of stock");
  });
});

describe("breadcrumbSchema", () => {
  it("numbers positions from 1 and makes every item absolute", () => {
    const schema = breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Electronics", url: "/category/electronics" },
    ]) as any;

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: "https://goomarket.test/",
    });
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[1].item).toBe(
      "https://goomarket.test/category/electronics"
    );
  });

  it("handles an empty trail", () => {
    expect((breadcrumbSchema([]) as any).itemListElement).toEqual([]);
  });
});

describe("itemListSchema", () => {
  it("lists products in order with absolute URLs", () => {
    const schema = itemListSchema(
      [makeProduct(), makeProduct({ id: "el02", slug: "washing-machine-el02" })],
      { name: "Electronics", url: "/category/electronics" }
    ) as any;

    expect(schema.numberOfItems).toBe(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].url).toBe(
      "https://goomarket.test/product/washing-machine-el02"
    );
  });
});

describe("site-level schemas", () => {
  it("declares the organization once, with a stable @id", () => {
    const schema = organizationSchema() as any;
    expect(schema["@type"]).toBe("Organization");
    expect(schema["@id"]).toBe("https://goomarket.test/#organization");
  });

  it("declares a WebSite with a SearchAction pointing at the real route", () => {
    const schema = websiteSchema() as any;
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
    expect(schema.potentialAction.target.urlTemplate).toBe(
      "https://goomarket.test/search?query={search_term_string}"
    );
    expect(schema.potentialAction["query-input"]).toBe(
      "required name=search_term_string"
    );
  });

  it("builds a CollectionPage tied to the website node", () => {
    const schema = collectionPageSchema(
      {
        slug: "electronics",
        name: "electronics",
        label: "Electronics",
        count: 8,
        image: "",
      },
      "/category/electronics"
    ) as any;

    expect(schema["@type"]).toBe("CollectionPage");
    expect(schema.isPartOf["@id"]).toBe("https://goomarket.test/#website");
  });
});
