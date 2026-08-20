import type { CartTotals } from "./types";

export const DISCOUNT_RATE = 0.1;

export const TAX_RATE = 0.15;

export const SHIPPING_FLAT_RATE = 0;

export const CURRENCY = "EGP";

export function toFiniteNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function roundMoney(value: unknown): number {
  const n = toFiniteNumber(value);
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function normalizeQuantity(
  value: unknown,
  { min = 1, max = 99 }: { min?: number; max?: number } = {}
): number {
  const n = Math.trunc(toFiniteNumber(value));
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export function getUnitPrice(listPrice: unknown): number {
  const list = Math.max(0, toFiniteNumber(listPrice));
  return roundMoney(list * (1 - DISCOUNT_RATE));
}

export function getUnitSaving(listPrice: unknown): number {
  const list = Math.max(0, toFiniteNumber(listPrice));
  return roundMoney(list - getUnitPrice(list));
}

export function getDiscountPercent(): number {
  return Math.round(DISCOUNT_RATE * 100);
}

export interface PriceableLine {
  listPrice?: number | null;
  price?: number | null;
  quantity?: number | null;
}

export function getLineUnitPrice(item: PriceableLine | null | undefined): number {
  if (item && item.listPrice !== undefined && item.listPrice !== null) {
    return getUnitPrice(item.listPrice);
  }
  return roundMoney(Math.max(0, toFiniteNumber(item?.price)));
}

export function getLineTotal(item: PriceableLine | null | undefined): number {
  return roundMoney(getLineUnitPrice(item) * normalizeQuantity(item?.quantity));
}

export function calculateCartTotals(
  items: readonly (PriceableLine | null | undefined)[] | null | undefined
): CartTotals {
  const list = Array.isArray(items) ? items : [];

  let subtotal = 0;
  let itemCount = 0;

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const quantity = normalizeQuantity(item.quantity);
    subtotal += getLineUnitPrice(item) * quantity;
    itemCount += quantity;
  }

  subtotal = roundMoney(subtotal);
  const taxes = roundMoney(subtotal * TAX_RATE);
  const shipping = subtotal > 0 ? roundMoney(SHIPPING_FLAT_RATE) : 0;
  const total = roundMoney(subtotal + taxes + shipping);

  return { subtotal, taxes, shipping, total, itemCount };
}

export function formatPrice(value: unknown, currency: string = CURRENCY): string {
  const amount = roundMoney(value);
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPriceValue(value: unknown): string {
  return roundMoney(value).toFixed(2);
}
