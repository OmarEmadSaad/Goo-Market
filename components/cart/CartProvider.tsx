"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import { calculateCartTotals } from "@/lib/pricing";
import type { Cart, CartLine, CartLineRequest } from "@/lib/types";

export interface CartMutationResult {
  ok: boolean;
  requiresAuth?: boolean;
  adjustments?: string[];
  error?: string;
}

interface CartContextValue {
  items: CartLine[];
  totals: Cart["totals"];
  itemCount: number;
  isSignedIn: boolean;
  isPending: boolean;
  addItem: (id: string, quantity?: number) => Promise<CartMutationResult>;
  setQuantity: (id: string, quantity: number) => Promise<CartMutationResult>;
  removeItem: (id: string) => Promise<CartMutationResult>;
  clear: () => Promise<CartMutationResult>;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_TOTALS = calculateCartTotals([]);

export function CartProvider({
  initialCart,
  isSignedIn,
  children,
}: {
  initialCart: Cart;
  isSignedIn: boolean;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isPending, startTransition] = useTransition();
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const commit = useCallback(
    async (lines: CartLineRequest[], optimistic: CartLine[]) => {
      if (!isSignedIn) return { ok: false, requiresAuth: true };

      setCart({
        items: optimistic,
        totals: calculateCartTotals(optimistic),
        adjustments: [],
      });

      const run = async (): Promise<CartMutationResult> => {
        try {
          const response = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: lines }),
          });

          if (response.status === 401) return { ok: false, requiresAuth: true };
          if (!response.ok) throw new Error(`Request failed (${response.status})`);

          const next = (await response.json()) as Cart;
          startTransition(() => setCart(next));
          return { ok: true, adjustments: next.adjustments };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not update the cart";
          try {
            const refreshed = await fetch("/api/cart", { cache: "no-store" });
            if (refreshed.ok) setCart((await refreshed.json()) as Cart);
          } catch {
            /* keep the optimistic view rather than blanking the cart */
          }
          return { ok: false, error: message };
        }
      };

      const result = queue.current.then(run, run);
      queue.current = result;
      return result;
    },
    [isSignedIn]
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      const next =
        quantity <= 0
          ? cart.items.filter((item) => item.id !== id)
          : cart.items.map((item) =>
              item.id === id
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            );
      return commit(toRequest(next), next);
    },
    [cart.items, commit]
  );

  const addItem = useCallback(
    (id: string, quantity = 1) => {
      const existing = cart.items.find((item) => item.id === id);
      const next = existing
        ? cart.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, item.stock),
                }
              : item
          )
        : cart.items;

      const lines = existing
        ? toRequest(next)
        : [...toRequest(cart.items), { id, quantity }];

      return commit(lines, next);
    },
    [cart.items, commit]
  );

  const removeItem = useCallback((id: string) => setQuantity(id, 0), [setQuantity]);

  const clear = useCallback(() => commit([], []), [commit]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: cart.items,
      totals: cart.totals ?? EMPTY_TOTALS,
      itemCount: cart.totals?.itemCount ?? 0,
      isSignedIn,
      isPending,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [cart, isSignedIn, isPending, addItem, setQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function toRequest(items: readonly CartLine[]): CartLineRequest[] {
  return items.map((item) => ({ id: item.id, quantity: item.quantity }));
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
