import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { clientKey, rateLimit } = await import("@/lib/server/rate-limit");

let counter = 0;
function uniqueKey() {
  counter += 1;
  return `test-scope-${counter}`;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i += 1) rateLimit(key, { limit: 5, windowMs: 60_000 });

    const blocked = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts down the remaining allowance", () => {
    const key = uniqueKey();
    expect(rateLimit(key, { limit: 3 }).remaining).toBe(2);
    expect(rateLimit(key, { limit: 3 }).remaining).toBe(1);
    expect(rateLimit(key, { limit: 3 }).remaining).toBe(0);
  });

  it("resets once the window has passed", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i += 1) rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(rateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));
    expect(rateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
  });

  it("tracks each key independently, so one client cannot lock out another", () => {
    const attacker = uniqueKey();
    const victim = uniqueKey();

    for (let i = 0; i < 6; i += 1) rateLimit(attacker, { limit: 5 });
    expect(rateLimit(attacker, { limit: 5 }).allowed).toBe(false);
    expect(rateLimit(victim, { limit: 5 }).allowed).toBe(true);
  });

  it("reports a retry delay no longer than the window", () => {
    const key = uniqueKey();
    for (let i = 0; i < 2; i += 1) rateLimit(key, { limit: 1, windowMs: 30_000 });
    expect(rateLimit(key, { limit: 1, windowMs: 30_000 }).retryAfterSeconds).toBeLessThanOrEqual(30);
  });
});

describe("clientKey", () => {
  function request(headers: Record<string, string>) {
    return new Request("https://example.test/api/auth/login", { headers });
  }

  it("uses the first address in x-forwarded-for", () => {
    expect(
      clientKey(request({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }), "login")
    ).toBe("login:203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(request({ "x-real-ip": "203.0.113.9" }), "login")).toBe(
      "login:203.0.113.9"
    );
  });

  it("falls back to a constant when no address header is present", () => {
    expect(clientKey(request({}), "login")).toBe("login:unknown");
  });

  it("namespaces by scope, so login and register have separate budgets", () => {
    const headers = { "x-forwarded-for": "203.0.113.5" };
    expect(clientKey(request(headers), "login")).not.toBe(
      clientKey(request(headers), "register")
    );
  });
});
