import "server-only";

import { revalidateTag } from "next/cache";
import { dbPush, dbReadFresh, dbRemove, dbUpdate } from "./db";
import { PRODUCTS_TAG } from "./products";
import { normalizeProduct } from "../catalog";
import type { Product } from "../types";

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface LocatedProduct {
  path: string;
  product: Product;
}

export async function locateProduct(id: string): Promise<LocatedProduct | null> {
  const target = String(id ?? "").trim();
  if (!target) return null;

  const raw = await dbReadFresh<unknown>("products");
  if (!raw || typeof raw !== "object") return null;

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;

    const direct = normalizeProduct(value);
    if (direct?.id === target) {
      return { path: `products/${key}`, product: direct };
    }

    if (!direct) {
      for (const [childKey, childValue] of Object.entries(
        value as Record<string, unknown>
      )) {
        const child = normalizeProduct(childValue);
        if (child?.id === target) {
          return { path: `products/${key}/${childKey}`, product: child };
        }
      }
    }
  }

  return null;
}

export async function createProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  const record = {
    id,
    name: input.name.trim(),
    category: input.category.trim().toLowerCase(),
    price: input.price,
    stock: input.stock,
    image: input.image,
  };

  await dbPush("products", record);
  revalidateTag(PRODUCTS_TAG);

  const product = normalizeProduct(record);
  if (!product) throw new Error("Product record was rejected by validation");
  return product;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  const located = await locateProduct(id);
  if (!located) throw new Error("Product not found");

  const record = {
    id,
    name: input.name.trim(),
    category: input.category.trim().toLowerCase(),
    price: input.price,
    stock: input.stock,
    image: input.image,
  };

  await dbUpdate(located.path, record);
  revalidateTag(PRODUCTS_TAG);

  const product = normalizeProduct(record);
  if (!product) throw new Error("Product record was rejected by validation");
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const located = await locateProduct(id);
  if (!located) throw new Error("Product not found");

  await dbRemove(located.path);
  revalidateTag(PRODUCTS_TAG);
}
