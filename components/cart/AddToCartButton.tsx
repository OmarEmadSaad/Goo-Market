"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "./CartProvider";
import type { ButtonProps } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export interface AddToCartButtonProps {
  product: Pick<Product, "id" | "name" | "inStock">;
  quantity?: number;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  label?: string;
  className?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "md",
  fullWidth = true,
  label = "Add to cart",
  className,
}: AddToCartButtonProps) {
  const { addItem, isSignedIn } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!product.inStock) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} disabled className={className}>
        Out of stock
      </Button>
    );
  }

  async function handleClick() {
    if (!isSignedIn) {
      toast("Please log in to add items to your cart.", "info");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBusy(true);
    const result = await addItem(product.id, quantity);
    setBusy(false);

    if (result.requiresAuth) {
      router.push("/login");
      return;
    }
    if (!result.ok) {
      toast(result.error ?? "Could not add this item to your cart.", "error");
      return;
    }
    if (result.adjustments?.length) {
      toast(result.adjustments[0]!, "info");
      return;
    }
    toast(`${product.name} added to your cart.`, "success");
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={handleClick}
      disabled={busy}
      aria-label={`${label}: ${product.name}`}
    >
      {busy ? <Spinner className="h-4 w-4 text-current" label="Adding" /> : null}
      {busy ? "Adding..." : label}
    </Button>
  );
}
