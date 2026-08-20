import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  collectErrors,
  validateCategory,
  validateEmail,
  validateGender,
  validateImageUrl,
  validateName,
  validatePassword,
  validatePrice,
  validateStock,
} = await import("@/lib/server/validation");

/**
 * These rules used to live only in the client form, where they were advisory.
 * Now they run on the server, so the invalid cases below are the ones that
 * previously reached the database unchecked.
 */

describe("validateName", () => {
  it("accepts a reasonable name", () => {
    expect(validateName("Omar Saad")).toBeNull();
    expect(validateName("User 42")).toBeNull();
  });

  it("rejects names that are too short or too long", () => {
    expect(validateName("ab")).not.toBeNull();
    expect(validateName("a".repeat(31))).not.toBeNull();
  });

  it("rejects markup, which would otherwise be echoed into the page", () => {
    expect(validateName("<script>alert(1)</script>")).not.toBeNull();
    expect(validateName("Bob<img onerror=x>")).not.toBeNull();
  });

  it("rejects empty and non-string input", () => {
    expect(validateName("")).not.toBeNull();
    expect(validateName(null)).not.toBeNull();
    expect(validateName(undefined)).not.toBeNull();
  });
});

describe("validateEmail", () => {
  it("accepts a normal address", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("first.last+tag@sub.example.co")).toBeNull();
  });

  it("rejects malformed addresses", () => {
    for (const value of [
      "",
      "user",
      "user@",
      "@example.com",
      "user@example",
      "user @example.com",
      "user@ex ample.com",
    ]) {
      expect(validateEmail(value)).not.toBeNull();
    }
  });

  it("rejects an absurdly long address", () => {
    expect(validateEmail(`${"a".repeat(250)}@example.com`)).not.toBeNull();
  });
});

describe("validatePassword", () => {
  it("accepts a password meeting every rule", () => {
    expect(validatePassword("Password123")).toBeNull();
  });

  it("rejects one that is too short", () => {
    expect(validatePassword("Pass12")).not.toBeNull();
  });

  it("rejects one missing a character class", () => {
    expect(validatePassword("password123")).not.toBeNull(); // no uppercase
    expect(validatePassword("PASSWORD123")).not.toBeNull(); // no lowercase
    expect(validatePassword("PasswordAbc")).not.toBeNull(); // no digit
  });

  it("rejects one long enough to be a denial-of-service against scrypt", () => {
    expect(validatePassword(`Aa1${"x".repeat(200)}`)).not.toBeNull();
  });
});

describe("validateGender", () => {
  it("accepts the two stored values, and blank", () => {
    expect(validateGender("Male")).toBeNull();
    expect(validateGender("Female")).toBeNull();
    expect(validateGender("")).toBeNull();
  });

  it("rejects anything else", () => {
    expect(validateGender("admin")).not.toBeNull();
  });
});

describe("validateImageUrl", () => {
  it("accepts an https URL on an allowed host", () => {
    expect(
      validateImageUrl("https://res.cloudinary.com/demo/image/upload/x.jpg")
    ).toBeNull();
    expect(validateImageUrl("https://img.freepik.com/a.jpg")).toBeNull();
  });

  it("treats an empty value as optional", () => {
    expect(validateImageUrl("")).toBeNull();
    expect(validateImageUrl(undefined)).toBeNull();
  });

  it("rejects javascript: and data: URLs", () => {
    // These would otherwise reach an `<img src>` or next/image.
    expect(validateImageUrl("javascript:alert(1)")).not.toBeNull();
    expect(validateImageUrl("data:text/html;base64,PHNjcmlwdD4=")).not.toBeNull();
  });

  it("rejects plain http", () => {
    expect(validateImageUrl("http://img.freepik.com/a.jpg")).not.toBeNull();
  });

  it("rejects a host that is not configured for next/image", () => {
    // An un-allowlisted host would make next/image throw at request time.
    expect(validateImageUrl("https://evil.example.com/a.jpg")).not.toBeNull();
  });

  it("rejects a malformed URL", () => {
    expect(validateImageUrl("not a url")).not.toBeNull();
  });
});

describe("validatePrice", () => {
  it("accepts non-negative numbers", () => {
    expect(validatePrice(0)).toBeNull();
    expect(validatePrice(1999.99)).toBeNull();
    expect(validatePrice("700")).toBeNull();
  });

  it("rejects negative, absurd and non-numeric values", () => {
    expect(validatePrice(-1)).not.toBeNull();
    expect(validatePrice(99_999_999)).not.toBeNull();
    expect(validatePrice("free")).not.toBeNull();
    expect(validatePrice(NaN)).not.toBeNull();
    expect(validatePrice(Infinity)).not.toBeNull();
  });
});

describe("validateStock", () => {
  it("accepts whole non-negative numbers", () => {
    expect(validateStock(0)).toBeNull();
    expect(validateStock("25")).toBeNull();
  });

  it("rejects negative or non-numeric stock", () => {
    expect(validateStock(-5)).not.toBeNull();
    expect(validateStock("many")).not.toBeNull();
  });
});

describe("validateCategory", () => {
  it("accepts a plain category name", () => {
    expect(validateCategory("electronics")).toBeNull();
    expect(validateCategory("home and garden")).toBeNull();
  });

  it("rejects path traversal and markup", () => {
    expect(validateCategory("../../users")).not.toBeNull();
    expect(validateCategory("<b>x</b>")).not.toBeNull();
    expect(validateCategory("a/b")).not.toBeNull();
  });

  it("rejects values that are too short or too long", () => {
    expect(validateCategory("a")).not.toBeNull();
    expect(validateCategory("x".repeat(41))).not.toBeNull();
  });
});

describe("collectErrors", () => {
  it("returns null when nothing failed", () => {
    expect(collectErrors({ name: null, email: null })).toBeNull();
  });

  it("keys messages by field, dropping the passes", () => {
    expect(
      collectErrors({ name: null, email: "Bad email", password: "Too short" })
    ).toEqual({ email: "Bad email", password: "Too short" });
  });
});
