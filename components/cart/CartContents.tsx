"use client";

import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import { useCart } from "./CartProvider";
import { EmptyState } from "@/components/ui/States";

export default function CartContents() {
  const { items, isSignedIn } = useCart();

  if (!isSignedIn) {
    return (
      <EmptyState
        title="Sign in to see your cart"
        description="Your cart is saved to your account so it follows you between devices."
        action={{ label: "Log in", href: "/login?redirect=%2Fcart" }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Looks like you have not added any products yet. Start shopping now!"
        action={{ label: "Browse products", href: "/" }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <section aria-label="Cart items">
        <ul className="border-t border-[var(--gm-border)]">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </ul>
      </section>

      <CartSummary />
    </div>
  );
}
