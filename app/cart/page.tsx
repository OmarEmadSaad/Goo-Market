import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import CartContents from "@/components/cart/CartContents";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the items in your Goo-Market cart before checking out.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Shopping cart</h1>
      <CartContents />
    </Container>
  );
}
