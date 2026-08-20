import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/admin";
import { createProduct } from "@/lib/server/product-admin";
import {
  collectErrors,
  validateCategory,
  validateImageUrl,
  validateName,
  validatePrice,
  validateStock,
} from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const { name, category, price, stock, image } = (body ?? {}) as Record<
    string,
    unknown
  >;

  const errors = collectErrors({
    name: validateName(name),
    category: validateCategory(category),
    price: validatePrice(price),
    stock: validateStock(stock),
    image: validateImageUrl(image),
  });

  if (errors) {
    return NextResponse.json(
      { ok: false, message: "Please fix the highlighted fields.", errors },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(randomUUID().slice(0, 8), {
      name: String(name),
      category: String(category),
      price: Number.parseFloat(String(price)),
      stock: Number.parseInt(String(stock), 10),
      image: String(image ?? ""),
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    console.error(
      "[admin] create product failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not create the product." },
      { status: 500 }
    );
  }
}
