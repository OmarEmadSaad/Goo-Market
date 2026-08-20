import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  DEFAULT_AVATAR,
  createUserRecord,
  findUserEntryByEmail,
  toPublicUser,
} from "@/lib/server/users";
import { hashPassword } from "@/lib/server/password";
import { startSession } from "@/lib/server/session";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import {
  collectErrors,
  validateEmail,
  validateGender,
  validateImageUrl,
  validateName,
  validatePassword,
} from "@/lib/server/validation";
import type { UserRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "register"), {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many sign-ups from this network. Try later." },
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

  const { name, email, password, gender, image } = (body ?? {}) as Record<
    string,
    unknown
  >;

  const errors = collectErrors({
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    gender: validateGender(gender),
    image: validateImageUrl(image),
  });

  if (errors) {
    return NextResponse.json(
      { ok: false, message: "Please fix the highlighted fields.", errors },
      { status: 400 }
    );
  }

  const emailValue = String(email).trim();

  try {
    if (await findUserEntryByEmail(emailValue)) {
      return NextResponse.json(
        {
          ok: false,
          message: "This email is already registered.",
          errors: { email: "This email is already registered." },
        },
        { status: 409 }
      );
    }

    const record: UserRecord = {
      id: randomUUID(),
      userName: String(name).trim(),
      Email: emailValue,
      password: await hashPassword(String(password)),
      gender: String(gender ?? ""),
      image: String(image ?? "") || DEFAULT_AVATAR,
      role: "user",
      cart: [],
    };

    await createUserRecord(record);
    await startSession({ userId: record.id!, role: "user" });

    return NextResponse.json(
      { ok: true, user: toPublicUser(record) },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "[auth] registration failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false, message: "Could not create your account right now." },
      { status: 500 }
    );
  }
}
