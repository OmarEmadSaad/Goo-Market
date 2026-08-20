import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hashPassword, isHashed, verifyPassword } = await import(
  "@/lib/server/password"
);

/**
 * Passwords were stored - and compared - in plaintext, inside a
 * world-readable database. These cover the hashing that replaced that, plus
 * the one-time acceptance path that lets existing accounts still log in.
 */

describe("hashPassword", () => {
  it("produces a salted scrypt hash, not the password", async () => {
    const hash = await hashPassword("Password123");
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(hash).not.toContain("Password123");
  });

  it("salts, so the same password hashes differently every time", async () => {
    const [a, b] = await Promise.all([
      hashPassword("Password123"),
      hashPassword("Password123"),
    ]);
    expect(a).not.toBe(b);
  });
});

describe("isHashed", () => {
  it("recognises a hashed value", async () => {
    expect(isHashed(await hashPassword("Password123"))).toBe(true);
  });

  it("recognises a legacy plaintext value", () => {
    expect(isHashed("Password123")).toBe(false);
    expect(isHashed(null)).toBe(false);
    expect(isHashed(undefined)).toBe(false);
  });
});

describe("verifyPassword", () => {
  it("accepts the correct password against a hash", async () => {
    const hash = await hashPassword("Password123");
    await expect(verifyPassword("Password123", hash)).resolves.toEqual({
      valid: true,
      needsRehash: false,
    });
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("Password123");
    await expect(verifyPassword("Password124", hash)).resolves.toMatchObject({
      valid: false,
    });
  });

  it("is case sensitive", async () => {
    const hash = await hashPassword("Password123");
    await expect(verifyPassword("password123", hash)).resolves.toMatchObject({
      valid: false,
    });
  });

  it("accepts a legacy plaintext record once and flags it for rehash", async () => {
    await expect(verifyPassword("Password123", "Password123")).resolves.toEqual({
      valid: true,
      needsRehash: true,
    });
  });

  it("rejects a wrong password against a legacy plaintext record", async () => {
    await expect(verifyPassword("nope", "Password123")).resolves.toMatchObject({
      valid: false,
    });
  });

  it("rejects empty input on either side", async () => {
    const hash = await hashPassword("Password123");
    await expect(verifyPassword("", hash)).resolves.toMatchObject({ valid: false });
    await expect(verifyPassword("Password123", "")).resolves.toMatchObject({
      valid: false,
    });
    await expect(verifyPassword(null, null)).resolves.toMatchObject({
      valid: false,
    });
  });

  it("rejects a corrupted hash without throwing", async () => {
    for (const stored of [
      "scrypt$",
      "scrypt$abc",
      "scrypt$zzzz$zzzz",
      "scrypt$00$00",
    ]) {
      await expect(
        verifyPassword("Password123", stored)
      ).resolves.toMatchObject({ valid: false });
    }
  });

  it("handles unicode passwords", async () => {
    const hash = await hashPassword("Pässwörd123é");
    await expect(verifyPassword("Pässwörd123é", hash)).resolves.toMatchObject({
      valid: true,
    });
  });
});
