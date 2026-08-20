"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "./CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, getDiscountPercent } from "@/lib/pricing";

export default function CartSummary() {
  const { items, totals, clear } = useCart();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isEmpty = items.length === 0;

  async function handleCheckout() {
    const confirmed = await confirm({
      title: "Place this order?",
      message: `You are about to check out ${totals.itemCount} ${
        totals.itemCount === 1 ? "item" : "items"
      } for ${formatPrice(totals.total)}.`,
      confirmLabel: "Place order",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        total?: number;
      };

      if (!response.ok || !payload.ok) {
        toast(payload.message ?? "Checkout failed. Please try again.", "error");
        return;
      }

      await clear();
      toast(
        `Order placed. Thank you for shopping with us! Total ${formatPrice(
          payload.total ?? totals.total
        )}.`,
        "success"
      );
      router.push("/");
      router.refresh();
    } catch {
      toast("Checkout failed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-6"
    >
      <h2 id="cart-summary-heading" className="text-lg font-semibold">
        Order summary
      </h2>

      <dl className="mt-4 space-y-2 text-sm">
        <Row
          label={`Subtotal (${totals.itemCount} ${
            totals.itemCount === 1 ? "item" : "items"
          })`}
          value={formatPrice(totals.subtotal)}
        />
        <Row label="Taxes" value={formatPrice(totals.taxes)} />
        <Row
          label="Shipping"
          value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
        />
        <div className="border-t border-[var(--gm-border)] pt-3">
          <Row
            label="Total"
            value={formatPrice(totals.total)}
            className="text-base font-bold"
          />
        </div>
      </dl>

      <p className="mt-3 text-xs text-gray-500 dark:text-[#93B1A6]">
        Prices include the {getDiscountPercent()}% storefront discount.
      </p>

      <Button
        fullWidth
        size="lg"
        className="mt-6"
        onClick={handleCheckout}
        disabled={isEmpty || busy}
      >
        {busy ? "Processing..." : "Checkout"}
      </Button>
    </aside>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${className ?? ""}`}>
      <dt>{label}</dt>
      <dd className="whitespace-nowrap tabular-nums">{value}</dd>
    </div>
  );
}
