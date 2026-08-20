import type { SessionPayload, UserRole, VerifiedSession } from "./types";

export const SESSION_COOKIE = "gm_session";
export const LEGACY_SESSION_COOKIE = "auth-token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it to 32 random bytes (hex)."
    );
  }
  return secret;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return base64UrlEncode(signature);
}

function toRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "user";
}

function encodeField(value: string): string {
  return encodeURIComponent(value).replace(/\./g, "%2E");
}

export async function createSessionToken(
  session: SessionPayload,
  maxAgeSeconds: number = SESSION_MAX_AGE
): Promise<string> {
  const userId = String(session?.userId ?? "");
  if (!userId) throw new Error("createSessionToken requires a userId");

  const role = toRole(session?.role);
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${encodeField(userId)}.${role}.${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(
  token: unknown
): Promise<VerifiedSession | null> {
  if (typeof token !== "string" || token.length > 512) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [rawUserId, role, rawExpiry, signature] = parts as [
    string,
    string,
    string,
    string,
  ];
  const payload = `${rawUserId}.${role}.${rawExpiry}`;

  let expected: string;
  try {
    expected = await sign(payload);
  } catch {
    return null;
  }
  if (!constantTimeEqual(expected, signature)) return null;

  const expiresAt = Number.parseInt(rawExpiry, 10);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 <= Date.now()) return null;

  let userId: string;
  try {
    userId = decodeURIComponent(rawUserId);
  } catch {
    return null;
  }
  if (!userId) return null;

  return { userId, role: toRole(role), expiresAt };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export interface SessionCookieOptions {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
}

export function sessionCookieOptions(
  maxAge: number = SESSION_MAX_AGE
): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
