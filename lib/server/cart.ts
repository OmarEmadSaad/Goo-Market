import "server-only";

import { dbUpdate } from "./db";
import { findUserEntryById } from "./users";
import { getProducts } from "./products";
import { calculateCartTotals, normalizeQuantity } from "../pricing";
import { productPath } from "../catalog";
import type { Cart, CartLine, CartLineRequest, Product } from "../types";

export const MAX_LINE_QUANTITY = 99;
const MAX_LINES = 50;

const EMPTY_CART: Cart = {
  items: [],
  totals: calculateCartTotals([]),
  adjustments: [],
};

export function parseCartRequest(input: unknown): CartLineRequest[] {
  if (!Array.isArray(input)) return [];
  const lines: CartLineRequest[] = [];
  for (const raw of input.slice(0, MAX_LINES * 2)) {
    if (typeof raw !== "object" || raw === null) continue;
    const candidate = raw as Record<string, unknown>;
    const id = String(candidate.id ?? "").trim();
    if (!id || id.length > 64) continue;
    lines.push({
      id,
      quantity: normalizeQuantity(candidate.quantity, {
        min: 1,
        max: MAX_LINE_QUANTITY,
      }),
    });
  }
  return lines;
}

export async function buildCart(
  requested: readonly CartLineRequest[]
): Promise<Cart> {
  const products = await getProducts();
  const byId = new Map<string, Product>(
    products.map((product) => [product.id, product])
  );

  const merged = new Map<
    string,
    { product: Product; requestedQuantity: number }
  >();
  const adjustments: string[] = [];

  for (const line of requested) {
    const product = byId.get(line.id);
    if (!product) {
      adjustments.push(`"${line.id}" is no longer available and was removed.`);
      continue;
    }

    const previous = merged.get(line.id)?.requestedQuantity ?? 0;
    merged.set(line.id, {
      product,
      requestedQuantity: previous + line.quantity,
    });

    if (merged.size >= MAX_LINES) break;
  }

  const items: CartLine[] = [];
  for (const { product, requestedQuantity } of merged.values()) {
    if (!product.inStock) {
      adjustments.push(`${product.name} is out of stock and was removed.`);
      continue;
    }

    const wanted = normalizeQuantity(requestedQuantity, {
      min: 1,
      max: MAX_LINE_QUANTITY,
    });
    const quantity = Math.min(wanted, product.stock);
    if (quantity < wanted) {
      adjustments.push(`Only ${product.stock} x ${product.name} left in stock.`);
    }

    items.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      href: productPath(product),
      image: product.image,
      listPrice: product.price,
      stock: product.stock,
      quantity,
    });
  }

  return { items, totals: calculateCartTotals(items), adjustments };
}

export async function getCartForUser(userId: string): Promise<Cart> {
  const entry = await findUserEntryById(userId);
  if (!entry) return EMPTY_CART;
  return buildCart(parseCartRequest(entry.record.cart));
}

export async function saveCartForUser(
  userId: string,
  requested: readonly CartLineRequest[]
): Promise<Cart> {
  const entry = await findUserEntryById(userId);
  if (!entry) throw new Error("User not found");

  const cart = await buildCart(requested);
  const persisted = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  await dbUpdate(`users/${entry.key}`, { cart: persisted });
  return cart;
}

export { EMPTY_CART };
