"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/cart/QuantitySelector";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/lib/types";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isSignedIn } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleBuyNow() {
    if (!isSignedIn) {
      toast("Please log in to continue with your purchase.", "info");
      router.push(`/login?redirect=%2Fcart`);
      return;
    }

    setBusy(true);
    const result = await addItem(product.id, quantity);
    setBusy(false);

    if (!result.ok) {
      toast(result.error ?? "Could not start your purchase.", "error");
      return;
    }
    router.push("/cart");
  }

  if (!product.inStock) {
    return (
      <div className="mt-8 rounded-lg border border-[var(--gm-border)] p-4">
        <p className="text-sm text-gray-600 dark:text-[#93B1A6]">
          This product is currently out of stock. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={product.stock}
        disabled={busy}
        label={`Quantity for ${product.name}`}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <AddToCartButton
          product={product}
          quantity={quantity}
          size="lg"
          fullWidth={false}
          className="sm:flex-1"
        />
        <Button
          variant="secondary"
          size="lg"
          onClick={handleBuyNow}
          disabled={busy}
          className="sm:flex-1"
        >
          {busy ? "Working..." : "Buy now"}
        </Button>
      </div>
    </div>
  );
}
