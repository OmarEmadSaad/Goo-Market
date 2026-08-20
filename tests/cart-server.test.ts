import { beforeEach, describe, expect, it, vi } from "vitest";

import { RAW_ARRAY_CATALOG } from "./fixtures";

/**
 * The cart's whole security property is "the server re-prices everything", so
 * these tests drive `buildCart` against a stubbed catalog and assert that a
 * hostile or stale request cannot change a price, exceed stock, or smuggle in
 * a product that does not exist.
 */

const getProducts = vi.fn();
const dbUpdate = vi.fn();
const findUserEntryById = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/products", () => ({ getProducts }));
vi.mock("@/lib/server/db", () => ({ dbUpdate }));
vi.mock("@/lib/server/users", () => ({ findUserEntryById }));

const { buildCart, getCartForUser, parseCartRequest, saveCartForUser } =
  await import("@/lib/server/cart");
const { normalizeProducts } = await import("@/lib/catalog");

const CATALOG = normalizeProducts(RAW_ARRAY_CATALOG);

beforeEach(() => {
  vi.clearAllMocks();
  getProducts.mockResolvedValue(CATALOG);
});

describe("parseCartRequest", () => {
  it("keeps well-formed lines", () => {
    expect(parseCartRequest([{ id: "el01", quantity: 2 }])).toEqual([
      { id: "el01", quantity: 2 },
    ]);
  });

  it("drops anything that is not an object with an id", () => {
    expect(
      parseCartRequest([
        null,
        "el01",
        42,
        { quantity: 3 },
        { id: "", quantity: 1 },
      ])
    ).toEqual([]);
  });

  it("clamps a hostile quantity", () => {
    expect(parseCartRequest([{ id: "el01", quantity: -99 }])[0]!.quantity).toBe(1);
    expect(parseCartRequest([{ id: "el01", quantity: 1e9 }])[0]!.quantity).toBe(99);
  });

  it("ignores every field except id and quantity", () => {
    const parsed = parseCartRequest([
      { id: "el01", quantity: 1, price: 0.01, listPrice: 0.01, name: "Free Fan" },
    ]);
    expect(parsed[0]).toEqual({ id: "el01", quantity: 1 });
  });

  it("rejects an absurdly long id", () => {
    expect(parseCartRequest([{ id: "x".repeat(200), quantity: 1 }])).toEqual([]);
  });

  it("returns an empty array for a non-array body", () => {
    expect(parseCartRequest(null)).toEqual([]);
    expect(parseCartRequest({ id: "el01" })).toEqual([]);
    expect(parseCartRequest("el01")).toEqual([]);
  });
});

describe("buildCart", () => {
  it("hydrates name, image, price and stock from the catalog", async () => {
    const cart = await buildCart([{ id: "el01", quantity: 2 }]);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      id: "el01",
      name: "Fan",
      listPrice: 700,
      stock: 7,
      quantity: 2,
      href: "/product/fan-el01",
    });
  });

  it("prices from the catalog, not from the request", async () => {
    const cart = await buildCart([{ id: "el02", quantity: 1 }]);
    // 3000 list, 10% off, plus 15% tax.
    expect(cart.totals.subtotal).toBe(2700);
    expect(cart.totals.taxes).toBe(405);
    expect(cart.totals.total).toBe(3105);
  });

  it("drops a product that is no longer in the catalog and says so", async () => {
    const cart = await buildCart([
      { id: "el01", quantity: 1 },
      { id: "deleted-product", quantity: 1 },
    ]);

    expect(cart.items.map((item) => item.id)).toEqual(["el01"]);
    expect(cart.adjustments.join(" ")).toContain("deleted-product");
  });

  it("removes an out-of-stock product", async () => {
    const cart = await buildCart([{ id: "ho01", quantity: 1 }]);
    expect(cart.items).toEqual([]);
    expect(cart.adjustments.join(" ")).toContain("out of stock");
  });

  it("clamps a quantity to the available stock", async () => {
    const cart = await buildCart([{ id: "el02", quantity: 50 }]);
    expect(cart.items[0]!.quantity).toBe(5);
    expect(cart.adjustments.join(" ")).toContain("Only 5");
  });

  it("merges duplicate lines for the same product", async () => {
    const cart = await buildCart([
      { id: "el01", quantity: 2 },
      { id: "el01", quantity: 3 },
    ]);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.quantity).toBe(5);
  });

  it("returns an empty, zeroed cart for an empty request", async () => {
    const cart = await buildCart([]);
    expect(cart.items).toEqual([]);
    expect(cart.totals.total).toBe(0);
  });
});

describe("getCartForUser", () => {
  it("returns an empty cart when the user does not exist", async () => {
    findUserEntryById.mockResolvedValue(null);
    const cart = await getCartForUser("missing");
    expect(cart.items).toEqual([]);
    expect(cart.totals.total).toBe(0);
  });

  it("re-prices a stored cart against the live catalog", async () => {
    // A cart persisted before the refactor, carrying a stale price field.
    findUserEntryById.mockResolvedValue({
      key: "u_1",
      record: { id: "1", cart: [{ id: "el01", quantity: 2, price: 1 }] },
    });

    const cart = await getCartForUser("1");
    expect(cart.items[0]!.listPrice).toBe(700);
    expect(cart.totals.subtotal).toBe(1260);
  });

  it("tolerates a cart stored as an empty string, as the old signup wrote", async () => {
    findUserEntryById.mockResolvedValue({
      key: "u_1",
      record: { id: "1", cart: "" },
    });
    await expect(getCartForUser("1")).resolves.toMatchObject({ items: [] });
  });
});

describe("saveCartForUser", () => {
  beforeEach(() => {
    findUserEntryById.mockResolvedValue({
      key: "u_1",
      record: { id: "1", cart: [] },
    });
  });

  it("persists only ids and quantities, never prices", async () => {
    await saveCartForUser("1", [{ id: "el01", quantity: 2 }]);

    expect(dbUpdate).toHaveBeenCalledWith("users/u_1", {
      cart: [{ id: "el01", quantity: 2 }],
    });
  });

  it("persists the clamped quantity, not the requested one", async () => {
    await saveCartForUser("1", [{ id: "el02", quantity: 99 }]);
    expect(dbUpdate).toHaveBeenCalledWith("users/u_1", {
      cart: [{ id: "el02", quantity: 5 }],
    });
  });

  it("throws when the user does not exist", async () => {
    findUserEntryById.mockResolvedValue(null);
    await expect(saveCartForUser("nope", [])).rejects.toThrow("User not found");
  });
});
