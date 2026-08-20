import { NextResponse } from "next/server";

import { getCategories, getProducts } from "@/lib/server/products";
import { DatabaseError, getDatabase } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const detailed =
    process.env.NODE_ENV !== "production" ||
    (await getCurrentUser())?.role === "admin";

  let source: string | null = null;
  try {
    source = getDatabase().source;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        stage: "config",
        code: error instanceof DatabaseError ? error.code : "UNKNOWN",
        message:
          error instanceof Error
            ? error.message
            : "Database URL could not be resolved.",
        checked: [
          "FIREBASE_DB_URL",
          "NEXT_PUBLIC_BASE_URL",
          "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
          "NEXT_PUBLIC_PRODUCT_URL",
          "NEXT_PUBLIC_USERS_URL",
        ],
      },
      { status: 503, headers: NO_STORE }
    );
  }

  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const sample = products[0];

    return NextResponse.json(
      {
        ok: true,
        stage: "catalog",
        source,
        dbAuthConfigured: Boolean(process.env.FIREBASE_DB_AUTH?.trim()),
        authSecretConfigured: Boolean(
          process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16
        ),
        siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
        productCount: products.length,
        categoryCount: categories.length,
        categories: categories.map((c) => ({ slug: c.slug, count: c.count })),
        withImages: products.filter((p) => p.image).length,
        inStock: products.filter((p) => p.inStock).length,
        sample: sample
          ? {
              id: sample.id,
              name: sample.name,
              slug: sample.slug,
              category: sample.category,
              price: sample.price,
              stock: sample.stock,
              hasImage: Boolean(sample.image),
            }
          : null,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    const code = error instanceof DatabaseError ? error.code : "UNKNOWN";
    return NextResponse.json(
      {
        ok: false,
        stage: "catalog",
        source,
        code,
        status: error instanceof DatabaseError ? error.status : undefined,
        message: detailed
          ? error instanceof Error
            ? error.message
            : String(error)
          : "Catalog read failed. See server logs.",
      },
      { status: 503, headers: NO_STORE }
    );
  }
}
