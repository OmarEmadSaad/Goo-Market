import { NextResponse } from "next/server";

import { getSession } from "@/lib/server/session";
import { getCartForUser, saveCartForUser } from "@/lib/server/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Please log in to check out." },
      { status: 401, headers: NO_STORE }
    );
  }

  try {
    const cart = await getCartForUser(session.userId);

    if (cart.items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Your cart is empty." },
        { status: 400, headers: NO_STORE }
      );
    }

    if (cart.adjustments.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: cart.adjustments[0],
          adjustments: cart.adjustments,
          cart,
        },
        { status: 409, headers: NO_STORE }
      );
    }

    await saveCartForUser(session.userId, []);

    return NextResponse.json(
      {
        ok: true,
        total: cart.totals.total,
        itemCount: cart.totals.itemCount,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error(
      "[checkout] failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Checkout failed. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
