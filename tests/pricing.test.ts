import { describe, expect, it } from "vitest";

import {
  CURRENCY,
  DISCOUNT_RATE,
  TAX_RATE,
  calculateCartTotals,
  formatPrice,
  formatPriceValue,
  getDiscountPercent,
  getLineTotal,
  getLineUnitPrice,
  getUnitPrice,
  getUnitSaving,
  normalizeQuantity,
  roundMoney,
  toFiniteNumber,
} from "@/lib/pricing";

/**
 * Money is the part of this codebase where a bug costs real money, so these
 * cover the edge cases the old implementation got wrong: two competing
 * discount rates, client-supplied prices reaching the total, and float drift
 * in the tax line.
 */

describe("toFiniteNumber", () => {
  it("passes finite numbers through", () => {
    expect(toFiniteNumber(12.5)).toBe(12.5);
    expect(toFiniteNumber(0)).toBe(0);
    expect(toFiniteNumber(-3)).toBe(-3);
  });

  it("parses numeric strings", () => {
    expect(toFiniteNumber("42")).toBe(42);
    expect(toFiniteNumber("3.99")).toBe(3.99);
  });

  it("returns 0 for anything that is not a finite number", () => {
    for (const value of [
      undefined,
      null,
      "",
      "abc",
      NaN,
      Infinity,
      -Infinity,
      {},
      [],
      true,
    ]) {
      expect(toFiniteNumber(value)).toBe(0);
    }
  });
});

describe("roundMoney", () => {
  it("rounds to two decimals", () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(2.675)).toBe(2.68);
  });

  it("does not drift on values that are exact in binary", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it("coerces junk to 0", () => {
    expect(roundMoney("not money")).toBe(0);
  });
});

describe("normalizeQuantity", () => {
  it("clamps below the minimum", () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(-5)).toBe(1);
  });

  it("clamps above the maximum", () => {
    expect(normalizeQuantity(1000)).toBe(99);
    expect(normalizeQuantity(50, { max: 7 })).toBe(7);
  });

  it("truncates fractions rather than rounding up into extra stock", () => {
    expect(normalizeQuantity(2.9)).toBe(2);
  });

  it("falls back to the minimum for non-numeric input", () => {
    expect(normalizeQuantity("three")).toBe(1);
    expect(normalizeQuantity(undefined)).toBe(1);
    expect(normalizeQuantity(NaN)).toBe(1);
  });

  it("honours a custom minimum of zero, used when removing a line", () => {
    expect(normalizeQuantity(0, { min: 0 })).toBe(0);
  });
});

describe("getUnitPrice", () => {
  it("applies exactly one discount rate site-wide", () => {
    // Regression: cards used 10% and the product page used 9.38%, so the same
    // product showed two different prices depending on where you looked.
    expect(getUnitPrice(700)).toBe(630);
    expect(getUnitPrice(700)).toBe(roundMoney(700 * (1 - DISCOUNT_RATE)));
  });

  it("rounds the result to two decimals", () => {
    expect(getUnitPrice(9.99)).toBe(8.99);
  });

  it("never returns a negative price", () => {
    expect(getUnitPrice(-100)).toBe(0);
  });

  it("treats invalid input as free rather than NaN", () => {
    expect(getUnitPrice(undefined)).toBe(0);
    expect(getUnitPrice("abc")).toBe(0);
  });
});

describe("getUnitSaving", () => {
  it("is the difference between list and discounted price", () => {
    expect(getUnitSaving(700)).toBe(70);
    expect(getUnitSaving(0)).toBe(0);
  });
});

describe("getDiscountPercent", () => {
  it("reports a whole-number percentage for display", () => {
    expect(getDiscountPercent()).toBe(10);
  });
});

describe("getLineUnitPrice", () => {
  it("prefers the catalog list price over anything the client sent", () => {
    // A tampered request claiming `price: 1` must not win.
    expect(getLineUnitPrice({ listPrice: 700, price: 1 })).toBe(630);
  });

  it("falls back to a stored price for legacy carts with no list price", () => {
    expect(getLineUnitPrice({ price: 123.45 })).toBe(123.45);
  });

  it("clamps a negative legacy price to zero", () => {
    expect(getLineUnitPrice({ price: -50 })).toBe(0);
  });

  it("handles a missing item", () => {
    expect(getLineUnitPrice(null)).toBe(0);
    expect(getLineUnitPrice(undefined)).toBe(0);
  });
});

describe("getLineTotal", () => {
  it("multiplies the authoritative unit price by the quantity", () => {
    expect(getLineTotal({ listPrice: 700, quantity: 3 })).toBe(1890);
  });

  it("clamps the quantity before multiplying", () => {
    expect(getLineTotal({ listPrice: 100, quantity: 0 })).toBe(90);
    expect(getLineTotal({ listPrice: 100, quantity: 1000 })).toBe(8910);
  });
});

describe("calculateCartTotals", () => {
  it("returns zeroes for an empty cart, with no shipping charged", () => {
    expect(calculateCartTotals([])).toEqual({
      subtotal: 0,
      taxes: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    });
  });

  it("computes subtotal, tax and total from list prices", () => {
    const totals = calculateCartTotals([
      { listPrice: 700, quantity: 2 }, // 630 * 2 = 1260
      { listPrice: 3000, quantity: 1 }, // 2700
    ]);

    expect(totals.subtotal).toBe(3960);
    expect(totals.taxes).toBe(roundMoney(3960 * TAX_RATE));
    expect(totals.taxes).toBe(594);
    expect(totals.total).toBe(4554);
    expect(totals.itemCount).toBe(3);
  });

  it("ignores a client-supplied price when a list price is present", () => {
    const tampered = calculateCartTotals([
      { listPrice: 3000, price: 0.01, quantity: 1 },
    ]);
    expect(tampered.subtotal).toBe(2700);
  });

  it("skips malformed entries instead of producing NaN", () => {
    const totals = calculateCartTotals([
      null,
      undefined,
      // @ts-expect-error deliberately malformed input from an untrusted source
      "not an item",
      { listPrice: 100, quantity: 1 },
    ]);
    expect(totals.subtotal).toBe(90);
    expect(totals.itemCount).toBe(1);
  });

  it("clamps invalid quantities rather than trusting them", () => {
    const totals = calculateCartTotals([
      { listPrice: 100, quantity: -5 },
      { listPrice: 100, quantity: 10_000 },
    ]);
    expect(totals.itemCount).toBe(1 + 99);
  });

  it("returns zeroes when given a non-array", () => {
    expect(calculateCartTotals(null).total).toBe(0);
    // @ts-expect-error the API boundary can receive anything
    expect(calculateCartTotals({ items: [] }).total).toBe(0);
  });

  it("keeps the total to two decimals across many fractional lines", () => {
    const totals = calculateCartTotals(
      Array.from({ length: 7 }, () => ({ listPrice: 9.99, quantity: 1 }))
    );
    expect(totals.subtotal).toBe(62.93);
    expect(Number.isInteger(totals.total * 100)).toBe(true);
  });
});

describe("formatting", () => {
  it("formats a price with the currency and thousands separators", () => {
    expect(formatPrice(1234.5)).toBe(`${CURRENCY} 1,234.50`);
    expect(formatPrice(0)).toBe(`${CURRENCY} 0.00`);
  });

  it("produces a bare two-decimal value for structured data", () => {
    expect(formatPriceValue(630)).toBe("630.00");
    expect(formatPriceValue(8.9)).toBe("8.90");
  });
});
