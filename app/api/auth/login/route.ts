import { NextResponse } from "next/server";

import {
  findUserEntryByEmail,
  getRole,
  toPublicUser,
  updateUserRecord,
} from "@/lib/server/users";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { startSession } from "@/lib/server/session";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "login"), {
    limit: 8,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  const emailValue = String(email ?? "").trim();
  const passwordValue = String(password ?? "");

  if (!emailValue || !passwordValue) {
    return NextResponse.json(
      { ok: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  const invalid = NextResponse.json(
    { ok: false, message: "Incorrect email or password." },
    { status: 401 }
  );

  try {
    const entry = await findUserEntryByEmail(emailValue);
    if (!entry) return invalid;

    const result = await verifyPassword(passwordValue, entry.record.password);
    if (!result.valid) return invalid;

    if (result.needsRehash) {
      try {
        await updateUserRecord(entry.key, {
          password: await hashPassword(passwordValue),
        });
      } catch {
        console.error("[auth] password upgrade failed for one account");
      }
    }

    const user = toPublicUser(entry.record);
    await startSession({ userId: user.id, role: getRole(entry.record) });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error(
      "[auth] login failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not sign you in right now." },
      { status: 500 }
    );
  }
}
