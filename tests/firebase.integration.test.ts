import { readFileSync, existsSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

import { collectCategories, normalizeProducts } from "@/lib/catalog";
import { getUnitPrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";

const RUN = process.env.VERIFY_FIREBASE === "1";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
    }
  }
}

function resolveRoot(): { url: string; source: string } | null {
  for (const name of [
    "FIREBASE_DB_URL",
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
  ]) {
    const raw = process.env[name]?.trim();
    if (raw) return { url: raw.replace(/\/+$/, ""), source: name };
  }
  for (const name of ["NEXT_PUBLIC_PRODUCT_URL", "NEXT_PUBLIC_USERS_URL"]) {
    const raw = process.env[name]?.trim();
    if (raw) {
      return {
        url: raw.replace(/\/[^/]*\.json.*$/i, ""),
        source: `${name} (derived)`,
      };
    }
  }
  return null;
}

describe.skipIf(!RUN)("Firebase integration (live network)", () => {
  let raw: unknown;
  let products: Product[];
  let source: string;

  beforeAll(async () => {
    loadEnv();

    const resolved = resolveRoot();
    expect(
      resolved,
      "No database URL. Set FIREBASE_DB_URL (or NEXT_PUBLIC_BASE_URL / NEXT_PUBLIC_PRODUCT_URL)."
    ).not.toBeNull();
    source = resolved!.source;

    const url = new URL(`${resolved!.url}/products.json`);
    const auth = process.env.FIREBASE_DB_AUTH?.trim();
    if (auth) url.searchParams.set("auth", auth);

    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    expect(
      response.status,
      `Database returned ${response.status}. 401=bad auth, 403=rules deny, 404=wrong URL.`
    ).toBe(200);

    const text = await response.text();
    expect(text.length, "Empty response body").toBeGreaterThan(0);
    expect(text, "/products is null").not.toBe("null");

    raw = JSON.parse(text);
    products = normalizeProducts(raw);
  }, 40_000);

  it("resolves a database URL from the environment", () => {
    expect(source).toBeTruthy();
    console.info(`[verify] database URL source: ${source}`);
  });

  it("returns a non-empty products node", () => {
    expect(raw).toBeTruthy();
  });

  it("maps at least one real product", () => {
    expect(products.length).toBeGreaterThan(0);
    console.info(`[verify] products mapped: ${products.length}`);
  });

  it("maps every required field on every product", () => {
    for (const product of products) {
      expect(product.id, "id").toBeTruthy();
      expect(product.name, `${product.id}.name`).toBeTruthy();
      expect(product.slug, `${product.id}.slug`).toBeTruthy();
      expect(product.category, `${product.id}.category`).toBeTruthy();
      expect(product.categorySlug, `${product.id}.categorySlug`).toBeTruthy();
      expect(typeof product.price, `${product.id}.price`).toBe("number");
      expect(Number.isFinite(product.price), `${product.id}.price finite`).toBe(true);
      expect(typeof product.stock, `${product.id}.stock`).toBe("number");
      expect(typeof product.inStock, `${product.id}.inStock`).toBe("boolean");
    }
  });

  it("produces at least one category with a positive count", () => {
    const categories = collectCategories(products);
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) expect(category.count).toBeGreaterThan(0);
    console.info(
      `[verify] categories: ${categories.map((c) => `${c.label}(${c.count})`).join(", ")}`
    );
  });

  it("prices every product through the shared pricing rules", () => {
    for (const product of products) {
      const unit = getUnitPrice(product.price);
      expect(Number.isFinite(unit)).toBe(true);
      expect(unit).toBeLessThanOrEqual(product.price);
    }
  });

  it("gives every product a usable image URL", () => {
    const withImages = products.filter((p) => p.image);
    console.info(`[verify] images: ${withImages.length}/${products.length}`);
    for (const product of withImages) {
      expect(() => new URL(product.image)).not.toThrow();
    }
  });
});
