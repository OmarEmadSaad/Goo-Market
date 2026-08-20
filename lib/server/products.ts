import "server-only";

import { cache } from "react";
import {
  DatabaseError,
  dbRead,
  describeDatabaseError,
  getDatabase,
} from "./db";
import {
  collectCategories,
  getRelatedProducts,
  groupByCategory,
  normalizeProducts,
  productIdFromSlug,
  searchProducts,
} from "../catalog";
import type { Category, CategoryGroup, Product } from "../types";

export const PRODUCTS_TAG = "products";
const REVALIDATE_SECONDS = 300;

export const getProducts = cache(async (): Promise<Product[]> => {
  let raw: unknown;

  try {
    raw = await dbRead("products", {
      revalidate: REVALIDATE_SECONDS,
      tags: [PRODUCTS_TAG],
    });
  } catch (error) {
    console.error(`[catalog] products read FAILED ${describeDatabaseError(error)}`);
    throw error;
  }

  if (raw === null || raw === undefined) {
    const message =
      'The "products" node is empty or missing. Check the database URL and that /products exists.';
    console.error(`[catalog] products read EMPTY code=NO_DATA message=${message}`);
    throw new DatabaseError("NOT_FOUND", message, { path: "products" });
  }

  const products = normalizeProducts(raw);

  if (products.length === 0) {
    const shape = Array.isArray(raw) ? `array(${raw.length})` : typeof raw;
    const keys =
      raw && typeof raw === "object" ? Object.keys(raw).slice(0, 5).join(",") : "";
    const message = `The "products" node returned data but no record survived normalisation. shape=${shape} keys=${keys}`;
    console.error(`[catalog] products read UNUSABLE code=BAD_SHAPE message=${message}`);
    throw new DatabaseError("PARSE_ERROR", message, { path: "products" });
  }

  console.info(
    `[catalog] products read OK count=${products.length} source=${getDatabase().source}`
  );

  return products;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  return collectCategories(await getProducts());
});

export const getProductGroups = cache(async (): Promise<CategoryGroup[]> => {
  return groupByCategory(await getProducts());
});

export const getProductBySlug = cache(
  async (slugOrId: string): Promise<Product | null> => {
    const products = await getProducts();
    let value: string;
    try {
      value = decodeURIComponent(String(slugOrId ?? "")).toLowerCase();
    } catch {
      value = String(slugOrId ?? "").toLowerCase();
    }
    if (!value) return null;

    const bySlug = products.find((product) => product.slug === value);
    if (bySlug) return bySlug;

    const id = productIdFromSlug(value).toLowerCase();
    return products.find((product) => product.id.toLowerCase() === id) ?? null;
  }
);

export const getProductById = cache(
  async (id: string): Promise<Product | null> => {
    const products = await getProducts();
    const target = String(id ?? "").toLowerCase();
    return (
      products.find((product) => product.id.toLowerCase() === target) ?? null
    );
  }
);

export const getProductsByCategory = cache(
  async (categorySlug: string): Promise<Product[]> => {
    const products = await getProducts();
    const slug = String(categorySlug ?? "").toLowerCase();
    return products.filter((product) => product.categorySlug === slug);
  }
);

export const getCategoryBySlug = cache(
  async (categorySlug: string): Promise<Category | null> => {
    const categories = await getCategories();
    const slug = String(categorySlug ?? "").toLowerCase();
    return categories.find((category) => category.slug === slug) ?? null;
  }
);

export const findProducts = cache(async (query: string): Promise<Product[]> => {
  return searchProducts(await getProducts(), query);
});

export const getRelated = cache(
  async (productId: string, limit = 4): Promise<Product[]> => {
    const products = await getProducts();
    const product = products.find((p) => p.id === productId) ?? null;
    return getRelatedProducts(products, product, limit);
  }
);
