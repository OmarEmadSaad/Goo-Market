import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SIZE,
  categoryPath,
  collectCategories,
  getRelatedProducts,
  groupByCategory,
  isValidSort,
  normalizeProduct,
  normalizeProducts,
  paginate,
  parseSort,
  productIdFromSlug,
  productPath,
  searchProducts,
  slugify,
  sortProducts,
  titleCase,
} from "@/lib/catalog";
import {
  RAW_ARRAY_CATALOG,
  RAW_OBJECT_CATALOG,
  makeProduct,
} from "./fixtures";

describe("slugify", () => {
  it("produces a URL-safe slug", () => {
    expect(slugify("Washing Machine")).toBe("washing-machine");
    expect(slugify("  Rice & Beans  ")).toBe("rice-beans");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Crème")).toBe("cafe-creme");
  });

  it("collapses runs of separators and trims the edges", () => {
    expect(slugify("--a///b--")).toBe("a-b");
  });

  it("handles empty and non-string input", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
    expect(slugify(undefined)).toBe("");
    expect(slugify(123)).toBe("123");
  });

  it("caps the length so a long name cannot produce an unbounded URL", () => {
    expect(slugify("a".repeat(200)).length).toBe(80);
  });
});

describe("titleCase", () => {
  it("capitalises each word", () => {
    expect(titleCase("home")).toBe("Home");
    expect(titleCase("home and kitchen")).toBe("Home And Kitchen");
  });

  it("returns an empty string for nothing", () => {
    expect(titleCase("")).toBe("");
    expect(titleCase(null)).toBe("");
  });
});

describe("normalizeProduct", () => {
  it("derives slug, categorySlug and stock state", () => {
    const product = normalizeProduct(RAW_ARRAY_CATALOG[1]);
    expect(product).toMatchObject({
      id: "el02",
      name: "Washing Machine",
      slug: "washing-machine-el02",
      categorySlug: "electronics",
      price: 3000,
      stock: 5,
      inStock: true,
    });
  });

  it("marks zero stock as out of stock", () => {
    expect(normalizeProduct(RAW_ARRAY_CATALOG[2])?.inStock).toBe(false);
  });

  it("never invents a brand, description, sku or rating", () => {
    // Regression: the old code set `brand: "Generic"` and `rating: 4.5` on
    // every product, which then flowed into the page and its structured data.
    const product = normalizeProduct(RAW_ARRAY_CATALOG[0])!;
    expect(product).not.toHaveProperty("brand");
    expect(product).not.toHaveProperty("description");
    expect(product).not.toHaveProperty("sku");
    expect(product).not.toHaveProperty("rating");
  });

  it("keeps optional attributes when the record genuinely has them", () => {
    const product = normalizeProduct({
      ...RAW_ARRAY_CATALOG[0],
      brand: "Zanussi",
      description: "A quiet desk fan.",
      sku: "ZAN-001",
    })!;
    expect(product.brand).toBe("Zanussi");
    expect(product.description).toBe("A quiet desk fan.");
    expect(product.sku).toBe("ZAN-001");
  });

  it("rejects records with no id or no name", () => {
    expect(normalizeProduct({ name: "No id", price: 1 })).toBeNull();
    expect(normalizeProduct({ id: "x", price: 1 })).toBeNull();
  });

  it("rejects non-objects", () => {
    for (const value of [null, undefined, "product", 42, []]) {
      expect(normalizeProduct(value)).toBeNull();
    }
  });

  it("coerces a bad price or stock to a safe number", () => {
    const product = normalizeProduct({
      id: "x1",
      name: "Odd",
      price: "-40",
      stock: "abc",
    })!;
    expect(product.price).toBe(0);
    expect(product.stock).toBe(0);
    expect(product.inStock).toBe(false);
  });

  it("drops a non-string image rather than passing it to next/image", () => {
    const product = normalizeProduct({
      id: "x1",
      name: "Odd",
      image: { url: "x" },
    })!;
    expect(product.image).toBe("");
  });
});

describe("normalizeProducts", () => {
  it("reads the array shape the database currently uses", () => {
    const products = normalizeProducts(RAW_ARRAY_CATALOG);
    expect(products).toHaveLength(3);
    expect(products.map((p) => p.id)).toEqual(["el01", "el02", "ho01"]);
  });

  it("reads the category-keyed object shape as well", () => {
    const products = normalizeProducts(RAW_OBJECT_CATALOG);
    expect(products.map((p) => p.id).sort()).toEqual(["el03", "fo01"]);
  });

  it("skips the null holes Firebase leaves in a sparse array", () => {
    const products = normalizeProducts([null, RAW_ARRAY_CATALOG[0], null]);
    expect(products).toHaveLength(1);
  });

  it("de-duplicates repeated ids", () => {
    const products = normalizeProducts([
      RAW_ARRAY_CATALOG[0],
      RAW_ARRAY_CATALOG[0],
    ]);
    expect(products).toHaveLength(1);
  });

  it("returns an empty list for anything unusable", () => {
    for (const value of [null, undefined, "", 0, "products"]) {
      expect(normalizeProducts(value)).toEqual([]);
    }
  });
});

describe("URL helpers", () => {
  it("builds the canonical product path from the slug", () => {
    expect(productPath(makeProduct())).toBe("/product/fan-el01");
  });

  it("falls back to the id when a slug is missing", () => {
    expect(productPath({ slug: "", id: "el01" })).toBe("/product/el01");
  });

  it("builds a category path", () => {
    expect(categoryPath("electronics")).toBe("/category/electronics");
  });

  it("recovers the id from a slug so legacy links keep resolving", () => {
    expect(productIdFromSlug("washing-machine-el02")).toBe("el02");
    expect(productIdFromSlug("el02")).toBe("el02");
    expect(productIdFromSlug("")).toBe("");
  });

  it("survives a malformed percent-encoded slug", () => {
    expect(() => productIdFromSlug("%E0%A4%A")).not.toThrow();
  });
});

describe("collectCategories", () => {
  it("counts products per category and sorts alphabetically", () => {
    const categories = collectCategories(normalizeProducts(RAW_ARRAY_CATALOG));
    expect(categories.map((c) => c.slug)).toEqual(["electronics", "home"]);
    expect(categories[0]).toMatchObject({
      slug: "electronics",
      label: "Electronics",
      count: 2,
    });
  });

  it("returns nothing for an empty catalog", () => {
    expect(collectCategories([])).toEqual([]);
  });
});

describe("groupByCategory", () => {
  it("groups products and preserves catalog order inside a group", () => {
    const groups = groupByCategory(normalizeProducts(RAW_ARRAY_CATALOG));
    expect(groups.map((g) => g.slug)).toEqual(["electronics", "home"]);
    expect(groups[0]!.products.map((p) => p.id)).toEqual(["el01", "el02"]);
  });
});

describe("searchProducts", () => {
  const products = normalizeProducts(RAW_ARRAY_CATALOG);

  it("matches on name, case-insensitively", () => {
    expect(searchProducts(products, "fan").map((p) => p.id)).toEqual(["el01"]);
    expect(searchProducts(products, "FAN").map((p) => p.id)).toEqual(["el01"]);
  });

  it("matches on category too", () => {
    expect(searchProducts(products, "electronics")).toHaveLength(2);
  });

  it("requires every term to match", () => {
    expect(searchProducts(products, "washing machine")).toHaveLength(1);
    expect(searchProducts(products, "washing sofa")).toHaveLength(0);
  });

  it("ignores extra whitespace between terms", () => {
    expect(searchProducts(products, "  washing   machine  ")).toHaveLength(1);
  });

  it("returns nothing for an empty query rather than the whole catalog", () => {
    expect(searchProducts(products, "")).toEqual([]);
    expect(searchProducts(products, "   ")).toEqual([]);
    expect(searchProducts(products, null)).toEqual([]);
  });
});

describe("sorting", () => {
  const products = normalizeProducts(RAW_ARRAY_CATALOG);

  it("accepts only known sort values", () => {
    expect(isValidSort("price-asc")).toBe(true);
    expect(isValidSort("price-sideways")).toBe(false);
    expect(parseSort("price-desc")).toBe("price-desc");
    expect(parseSort("../../etc/passwd")).toBe("relevance");
    expect(parseSort(undefined)).toBe("relevance");
  });

  it("sorts by price ascending and descending", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.id)).toEqual([
      "el01",
      "el02",
      "ho01",
    ]);
    expect(sortProducts(products, "price-desc").map((p) => p.id)).toEqual([
      "ho01",
      "el02",
      "el01",
    ]);
  });

  it("sorts by name in both directions", () => {
    expect(sortProducts(products, "name-asc").map((p) => p.name)).toEqual([
      "Fan",
      "Sofa",
      "Washing Machine",
    ]);
    expect(sortProducts(products, "name-desc").map((p) => p.name)).toEqual([
      "Washing Machine",
      "Sofa",
      "Fan",
    ]);
  });

  it("leaves relevance order untouched", () => {
    expect(sortProducts(products, "relevance").map((p) => p.id)).toEqual([
      "el01",
      "el02",
      "ho01",
    ]);
  });

  it("never mutates the input array, which is a shared cached value", () => {
    const original = [...products];
    sortProducts(products, "price-desc");
    expect(products).toEqual(original);
  });

  it("breaks price ties by name for a stable order", () => {
    const tied = [
      makeProduct({ id: "b", name: "Beta", price: 10 }),
      makeProduct({ id: "a", name: "Alpha", price: 10 }),
    ];
    expect(sortProducts(tied, "price-asc").map((p) => p.name)).toEqual([
      "Alpha",
      "Beta",
    ]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the requested slice", () => {
    const result = paginate(items, 2, 10);
    expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result).toMatchObject({
      page: 2,
      pageCount: 3,
      total: 25,
      hasPrevious: true,
      hasNext: true,
    });
  });

  it("clamps a page below 1 or beyond the last page", () => {
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, -5, 10).page).toBe(1);
  });

  it("clamps a junk page or size instead of returning an empty list", () => {
    expect(paginate(items, "abc", 10).page).toBe(1);
    expect(paginate(items, 1, 0).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(paginate(items, 1, -10).pageSize).toBe(1);
  });

  it("reports one page for an empty list", () => {
    expect(paginate([], 1, 10)).toMatchObject({
      page: 1,
      pageCount: 1,
      total: 0,
      hasPrevious: false,
      hasNext: false,
    });
  });
});

describe("getRelatedProducts", () => {
  const products = normalizeProducts(RAW_ARRAY_CATALOG);

  it("prefers products from the same category and excludes the product itself", () => {
    const related = getRelatedProducts(products, products[0]!, 4);
    expect(related.map((p) => p.id)).toContain("el02");
    expect(related.map((p) => p.id)).not.toContain("el01");
  });

  it("fills from other categories rather than returning a short list", () => {
    const related = getRelatedProducts(products, products[0]!, 2);
    expect(related).toHaveLength(2);
    expect(related.map((p) => p.id)).toEqual(["el02", "ho01"]);
  });

  it("respects the limit", () => {
    expect(getRelatedProducts(products, products[0]!, 1)).toHaveLength(1);
  });

  it("returns nothing when there is no product", () => {
    expect(getRelatedProducts(products, null)).toEqual([]);
  });
});
