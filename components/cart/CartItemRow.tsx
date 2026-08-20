"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "@/components/product/ProductImage";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "./CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, getLineTotal, getLineUnitPrice } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";

export default function CartItemRow({ item }: { item: CartLine }) {
  const { setQuantity, removeItem } = useCart();
  const { toast, confirm } = useToast();
  const [busy, setBusy] = useState(false);

  const unitPrice = getLineUnitPrice(item);
  const lineTotal = getLineTotal(item);

  async function handleQuantity(quantity: number) {
    setBusy(true);
    const result = await setQuantity(item.id, quantity);
    setBusy(false);
    if (!result.ok && !result.requiresAuth) {
      toast(result.error ?? "Could not update the quantity.", "error");
    } else if (result.adjustments?.length) {
      toast(result.adjustments[0]!, "info");
    }
  }

  async function handleRemove() {
    const confirmed = await confirm({
      title: `Remove ${item.name}?`,
      message: "This item will be taken out of your cart.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!confirmed) return;

    setBusy(true);
    const result = await removeItem(item.id);
    setBusy(false);
    if (result.ok) toast(`${item.name} removed from your cart.`, "success");
    else if (!result.requiresAuth) {
      toast(result.error ?? "Could not remove this item.", "error");
    }
  }

  return (
    <li
      className="grid grid-cols-[4rem_1fr_auto] items-center gap-x-4 gap-y-3 border-b border-[var(--gm-border)] py-4 sm:grid-cols-[5rem_1fr_auto_auto_auto]"
      aria-busy={busy}
    >
      <Link href={item.href} className="col-start-1 row-span-2 sm:row-span-1">
        <ProductImage
          product={item}
          sizes="80px"
          className="h-16 w-16 rounded-md sm:h-20 sm:w-20"
        />
      </Link>

      <div className="min-w-0">
        <Link
          href={item.href}
          className="line-clamp-2 text-sm font-medium hover:text-green-700 dark:hover:text-green-300"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-[#93B1A6]">
          {formatPrice(unitPrice)} each
        </p>
      </div>

      <div className="col-span-2 col-start-2 sm:col-span-1 sm:col-start-3">
        <QuantitySelector
          value={item.quantity}
          min={1}
          max={item.stock}
          disabled={busy}
          onChange={handleQuantity}
          label={`Quantity for ${item.name}`}
          className="[&>label]:sr-only"
        />
      </div>

      <p className="col-start-3 row-start-1 whitespace-nowrap text-right text-sm font-semibold sm:col-start-4">
        {formatPrice(lineTotal)}
      </p>

      <button
        type="button"
        onClick={handleRemove}
        disabled={busy}
        aria-label={`Remove ${item.name} from cart`}
        className="col-start-3 justify-self-end rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10 sm:col-start-5"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7h12M9 7V5h6v2m-8 0l1 12h8l1-12"
          />
        </svg>
      </button>
    </li>
  );
}
