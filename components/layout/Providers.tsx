"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";
import type { Cart } from "@/lib/types";

export default function Providers({
  initialCart,
  isSignedIn,
  children,
}: {
  initialCart: Cart;
  isSignedIn: boolean;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider initialCart={initialCart} isSignedIn={isSignedIn}>
        {children}
      </CartProvider>
    </ToastProvider>
  );
}
