import "server-only";

import { cache } from "react";
import { dbRead } from "./db";
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
  try {
    const raw = await dbRead("products", {
      revalidate: REVALIDATE_SECONDS,
      tags: [PRODUCTS_TAG],
    });
    return normalizeProducts(raw);
  } catch (error) {
    console.error(
      "[catalog] failed to load products:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
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
