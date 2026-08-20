import { NextResponse } from "next/server";

import { endSession, getSession } from "@/lib/server/session";
import {
  findUserEntryById,
  findUserEntryByEmail,
  toPublicUser,
  updateUserRecord,
} from "@/lib/server/users";
import { dbRemove } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import {
  collectErrors,
  validateEmail,
  validateImageUrl,
  validateName,
  validatePassword,
} from "@/lib/server/validation";
import type { UserRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function PATCH(request: Request) {
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

  const { name, email, password, image } = (body ?? {}) as Record<string, unknown>;

  const errors = collectErrors({
    ...(name !== undefined ? { name: validateName(name) } : {}),
    ...(email !== undefined ? { email: validateEmail(email) } : {}),
    ...(password ? { password: validatePassword(password) } : {}),
    ...(image ? { image: validateImageUrl(image) } : {}),
  });

  if (errors) {
    return NextResponse.json(
      { ok: false, message: "Please fix the highlighted fields.", errors },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    const entry = await findUserEntryById(session.userId);
    if (!entry) {
      return NextResponse.json(
        { ok: false, message: "Account not found." },
        { status: 404, headers: NO_STORE }
      );
    }

    const patch: Partial<UserRecord> = {};
    if (name !== undefined) patch.userName = String(name).trim();
    if (image) patch.image = String(image);
    if (password) patch.password = await hashPassword(String(password));

    if (email !== undefined) {
      const nextEmail = String(email).trim();
      const existing = await findUserEntryByEmail(nextEmail);
      if (existing && existing.key !== entry.key) {
        return NextResponse.json(
          {
            ok: false,
            message: "That email is already in use.",
            errors: { email: "That email is already in use." },
          },
          { status: 409, headers: NO_STORE }
        );
      }
      patch.Email = nextEmail;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { ok: true, user: toPublicUser(entry.record), changed: false },
        { headers: NO_STORE }
      );
    }

    await updateUserRecord(entry.key, patch);

    return NextResponse.json(
      {
        ok: true,
        changed: true,
        user: toPublicUser({ ...entry.record, ...patch }),
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error(
      "[account] update failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not save your changes." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: NO_STORE }
    );
  }

  try {
    const entry = await findUserEntryById(session.userId);
    if (entry) await dbRemove(`users/${entry.key}`);
    await endSession();
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[account] delete failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not delete your account." },
      { status: 500, headers: NO_STORE }
    );
  }
}
