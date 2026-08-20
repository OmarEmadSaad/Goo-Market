import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const PREFIX = "scrypt$";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(
    String(password),
    salt,
    KEY_LENGTH,
    SCRYPT_PARAMS
  );
  return `${PREFIX}${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function isHashed(stored: unknown): stored is string {
  return typeof stored === "string" && stored.startsWith(PREFIX);
}

export interface VerifyResult {
  valid: boolean;
  needsRehash: boolean;
}

export async function verifyPassword(
  password: unknown,
  stored: unknown
): Promise<VerifyResult> {
  const candidate = String(password ?? "");
  const record = String(stored ?? "");

  if (!candidate || !record) return { valid: false, needsRehash: false };

  if (!isHashed(record)) {
    return { valid: safeEqualStrings(candidate, record), needsRehash: true };
  }

  const [, saltHex, hashHex] = record.split("$");
  if (!saltHex || !hashHex) return { valid: false, needsRehash: false };

  let derived: Buffer;
  try {
    derived = await scryptAsync(
      candidate,
      Buffer.from(saltHex, "hex"),
      KEY_LENGTH,
      SCRYPT_PARAMS
    );
  } catch {
    return { valid: false, needsRehash: false };
  }

  const expected = Buffer.from(hashHex, "hex");
  const valid =
    expected.length === derived.length && timingSafeEqual(expected, derived);
  return { valid, needsRehash: false };
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) {
    timingSafeEqual(bufferA, bufferA);
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}
