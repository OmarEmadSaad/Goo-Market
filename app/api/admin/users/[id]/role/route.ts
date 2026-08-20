import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/admin";
import { findUserEntryById, updateUserRecord } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
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

  const role = (body as { role?: unknown })?.role;
  if (role !== "admin" && role !== "user") {
    return NextResponse.json(
      { ok: false, message: 'Role must be "admin" or "user".' },
      { status: 400 }
    );
  }

  if (id === auth.user.id && role === "user") {
    return NextResponse.json(
      { ok: false, message: "You cannot remove your own admin access." },
      { status: 400 }
    );
  }

  try {
    const entry = await findUserEntryById(id);
    if (!entry) {
      return NextResponse.json(
        { ok: false, message: "User not found." },
        { status: 404 }
      );
    }

    await updateUserRecord(entry.key, { role });
    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error(
      "[admin] role change failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not update the user." },
      { status: 500 }
    );
  }
}
