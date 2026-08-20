"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export default function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/15"
      aria-label={
        itemCount === 0
          ? "Cart, empty"
          : `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 3h2l2.3 11.3a1.5 1.5 0 001.5 1.2h8.6a1.5 1.5 0 001.5-1.2L20 7H6"
        />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
      </svg>

      {itemCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs font-semibold leading-5 text-white"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {itemCount} {itemCount === 1 ? "item" : "items"} in cart
      </span>
    </Link>
  );
}
