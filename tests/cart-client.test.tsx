import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CartProvider, useCart } from "@/components/cart/CartProvider";
import AddToCartButton from "@/components/cart/AddToCartButton";
import CartSummary from "@/components/cart/CartSummary";
import { ToastProvider } from "@/components/ui/Toast";
import { calculateCartTotals } from "@/lib/pricing";
import { makeCartLine, makeProduct } from "./fixtures";
import type { Cart, CartLine } from "@/lib/types";

/**
 * The client cart's contract: send `{id, quantity}`, adopt whatever the server
 * replies with, and prompt for login instead of silently failing when signed
 * out.
 */

function makeCart(items: CartLine[] = []): Cart {
  return { items, totals: calculateCartTotals(items), adjustments: [] };
}

function Harness({
  cart = makeCart(),
  isSignedIn = true,
  children,
}: {
  cart?: Cart;
  isSignedIn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider initialCart={cart} isSignedIn={isSignedIn}>
        {children}
      </CartProvider>
    </ToastProvider>
  );
}

function CartProbe() {
  const { items, totals, itemCount } = useCart();
  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="total">{totals.total}</span>
      <span data-testid="ids">{items.map((item) => item.id).join(",")}</span>
    </div>
  );
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function respondWith(cart: Cart, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cart,
  };
}

describe("CartProvider", () => {
  it("renders the server-provided cart without fetching on mount", () => {
    render(
      <Harness cart={makeCart([makeCartLine({ quantity: 2 })])}>
        <CartProbe />
      </Harness>
    );

    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("total")).toHaveTextContent("1449");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends only ids and quantities to the server", async () => {
    const line = makeCartLine();
    fetchMock.mockResolvedValue(respondWith(makeCart([line])));

    render(
      <Harness>
        <AddToCartButton product={makeProduct()} />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add to cart/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/cart");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({
      items: [{ id: "el01", quantity: 1 }],
    });
  });

  it("adopts the server's cart, including a quantity it clamped", async () => {
    // Client asked for 1 more; the server says only 3 are in stock.
    fetchMock.mockResolvedValue(
      respondWith({
        items: [makeCartLine({ quantity: 3, stock: 3 })],
        totals: calculateCartTotals([makeCartLine({ quantity: 3 })]),
        adjustments: ["Only 3 x Fan left in stock."],
      })
    );

    render(
      <Harness>
        <AddToCartButton product={makeProduct()} />
        <CartProbe />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add to cart/ }));

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("3")
    );
    expect(await screen.findByText("Only 3 x Fan left in stock.")).toBeInTheDocument();
  });

  it("prompts for login instead of calling the API when signed out", async () => {
    render(
      <Harness isSignedIn={false}>
        <AddToCartButton product={makeProduct()} />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add to cart/ }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Please log in to add items/i)
    ).toBeInTheDocument();
  });

  it("surfaces a failure and re-reads the authoritative cart", async () => {
    const server = makeCart([makeCartLine({ quantity: 1 })]);
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce(respondWith(server));

    render(
      <Harness cart={server}>
        <AddToCartButton product={makeProduct()} />
        <CartProbe />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add to cart/ }));

    // Rolled back to what the server last confirmed, not the optimistic value.
    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("1")
    );
  });
});

describe("AddToCartButton", () => {
  it("is disabled and relabelled for an out-of-stock product", () => {
    render(
      <Harness>
        <AddToCartButton product={makeProduct({ stock: 0, inStock: false })} />
      </Harness>
    );

    const button = screen.getByRole("button", { name: "Out of stock" });
    expect(button).toBeDisabled();
  });

  it("names the product in its accessible label", () => {
    render(
      <Harness>
        <AddToCartButton product={makeProduct()} />
      </Harness>
    );
    expect(
      screen.getByRole("button", { name: "Add to cart: Fan" })
    ).toBeInTheDocument();
  });
});

describe("CartSummary", () => {
  it("renders the server's totals verbatim", () => {
    const items = [makeCartLine({ quantity: 2 })];
    render(
      <Harness cart={makeCart(items)}>
        <CartSummary />
      </Harness>
    );

    expect(screen.getByText("EGP 1,260.00")).toBeInTheDocument(); // subtotal
    expect(screen.getByText("EGP 189.00")).toBeInTheDocument(); // taxes
    expect(screen.getByText("Free")).toBeInTheDocument(); // shipping
    expect(screen.getByText("EGP 1,449.00")).toBeInTheDocument(); // total
  });

  it("disables checkout for an empty cart", () => {
    render(
      <Harness>
        <CartSummary />
      </Harness>
    );
    expect(screen.getByRole("button", { name: "Checkout" })).toBeDisabled();
  });

  it("asks for confirmation before checking out", async () => {
    render(
      <Harness cart={makeCart([makeCartLine()])}>
        <CartSummary />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: "Checkout" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Place this order?");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to the checkout API once confirmed", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, total: 724.5 }),
      })
      .mockResolvedValueOnce(respondWith(makeCart()));

    render(
      <Harness cart={makeCart([makeCartLine()])}>
        <CartSummary />
      </Harness>
    );

    await userEvent.click(screen.getByRole("button", { name: "Checkout" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Place order" })
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/checkout", { method: "POST" })
    );
  });
});
