import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SESSION_MAX_AGE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/session";

/**
 * The single most important behaviour in the codebase: a session cookie the
 * browser cannot forge. The old cookie was `auth-token=<userId>` in plain
 * readable text, and the middleware accepted it verbatim - so setting it to a
 * known admin id was a complete privilege escalation.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe("createSessionToken / verifySessionToken", () => {
  it("round-trips a session", async () => {
    const token = await createSessionToken({ userId: "abc123", role: "admin" });
    await expect(verifySessionToken(token)).resolves.toMatchObject({
      userId: "abc123",
      role: "admin",
    });
  });

  it("defaults an unknown role to user rather than trusting it", async () => {
    // @ts-expect-error deliberately invalid role from an untrusted caller
    const token = await createSessionToken({ userId: "abc", role: "superuser" });
    const session = await verifySessionToken(token);
    expect(session?.role).toBe("user");
  });

  it("rejects a token whose payload was edited", async () => {
    const token = await createSessionToken({ userId: "abc", role: "user" });
    const [userId, , expiry, signature] = token.split(".");

    // The exact attack: flip the role claim and keep the old signature.
    const forged = `${userId}.admin.${expiry}.${signature}`;
    await expect(verifySessionToken(forged)).resolves.toBeNull();
  });

  it("rejects a token whose user id was swapped", async () => {
    const token = await createSessionToken({ userId: "abc", role: "admin" });
    const [, role, expiry, signature] = token.split(".");
    await expect(
      verifySessionToken(`victim.${role}.${expiry}.${signature}`)
    ).resolves.toBeNull();
  });

  it("rejects a token with no signature at all", async () => {
    // What the old cookie looked like: a bare user id.
    await expect(verifySessionToken("abc123")).resolves.toBeNull();
    await expect(verifySessionToken("abc.admin.9999999999")).resolves.toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const token = await createSessionToken({ userId: "abc", role: "user" });
    const parts = token.split(".");
    parts[3] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    await expect(verifySessionToken(parts.join("."))).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createSessionToken({ userId: "abc", role: "user" }, 60);

    vi.setSystemTime(new Date("2026-01-01T00:02:00Z"));
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("accepts a token that has not expired yet", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createSessionToken({ userId: "abc", role: "user" }, 600);

    vi.setSystemTime(new Date("2026-01-01T00:05:00Z"));
    await expect(verifySessionToken(token)).resolves.not.toBeNull();
  });

  it("rejects malformed input without throwing", async () => {
    for (const value of [
      null,
      undefined,
      "",
      42,
      {},
      "a.b.c",
      "a.b.c.d.e",
      "x".repeat(600),
    ]) {
      await expect(verifySessionToken(value)).resolves.toBeNull();
    }
  });

  it("round-trips a user id containing separator characters", async () => {
    const token = await createSessionToken({ userId: "a.b.c", role: "user" });
    await expect(verifySessionToken(token)).resolves.toMatchObject({
      userId: "a.b.c",
    });
  });

  it("refuses to mint a token with no user id", async () => {
    await expect(
      createSessionToken({ userId: "", role: "user" })
    ).rejects.toThrow(/userId/);
  });
});

describe("sessionCookieOptions", () => {
  it("is httpOnly, so client JavaScript cannot read or forge it", () => {
    expect(sessionCookieOptions().httpOnly).toBe(true);
  });

  it("is sameSite lax and scoped to the whole site", () => {
    const options = sessionCookieOptions();
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("defaults to the configured lifetime and accepts an override", () => {
    expect(sessionCookieOptions().maxAge).toBe(SESSION_MAX_AGE);
    expect(sessionCookieOptions(0).maxAge).toBe(0);
  });
});
