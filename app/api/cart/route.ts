import { NextResponse } from "next/server";

import { getSession } from "@/lib/server/session";
import { getCartForUser, parseCartRequest, saveCartForUser } from "@/lib/server/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: NO_STORE }
    );
  }

  try {
    const cart = await getCartForUser(session.userId);
    return NextResponse.json(cart, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[cart] read failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not load your cart." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: NO_STORE }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400, headers: NO_STORE }
    );
  }

  const items = parseCartRequest((body as { items?: unknown })?.items);

  try {
    const cart = await saveCartForUser(session.userId, items);
    return NextResponse.json(cart, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[cart] write failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not update your cart." },
      { status: 500, headers: NO_STORE }
    );
  }
}
