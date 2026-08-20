import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import {
  LEGACY_SESSION_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "../session";
import { findUserEntryById, toPublicUser } from "./users";
import type { PublicUser, SessionPayload, VerifiedSession } from "../types";

export const getSession = cache(async (): Promise<VerifiedSession | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const entry = await findUserEntryById(session.userId);
  if (!entry) return null;

  return toPublicUser(entry.record);
});

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function startSession(session: SessionPayload): Promise<void> {
  const token = await createSessionToken(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  store.set(LEGACY_SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    httpOnly: false,
  });
}
