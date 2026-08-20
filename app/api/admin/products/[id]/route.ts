import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/admin";
import { deleteProduct, updateProduct } from "@/lib/server/product-admin";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;

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
    const product = await updateProduct(id, {
      name: String(name),
      category: String(category),
      price: Number.parseFloat(String(price)),
      stock: Number.parseInt(String(stock), 10),
      image: String(image ?? ""),
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Product not found") {
      return NextResponse.json(
        { ok: false, message: "Product not found." },
        { status: 404 }
      );
    }
    console.error("[admin] update product failed:", message);
    return NextResponse.json(
      { ok: false, message: "Could not update the product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;

  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Product not found") {
      return NextResponse.json(
        { ok: false, message: "Product not found." },
        { status: 404 }
      );
    }
    console.error("[admin] delete product failed:", message);
    return NextResponse.json(
      { ok: false, message: "Could not delete the product." },
      { status: 500 }
    );
  }
}
