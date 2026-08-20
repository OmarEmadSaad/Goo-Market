import "server-only";

export const NAME_PATTERN = /^[a-zA-Z0-9\s]{3,30}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export type FieldErrors = Record<string, string>;

export function validateName(value: unknown): string | null {
  const name = String(value ?? "").trim();
  if (!NAME_PATTERN.test(name)) {
    return "Name must be 3-30 characters and use only letters, numbers or spaces.";
  }
  return null;
}

export function validateEmail(value: unknown): string | null {
  const email = String(value ?? "").trim();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(value: unknown): string | null {
  const password = String(value ?? "");
  if (!PASSWORD_PATTERN.test(password)) {
    return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number.";
  }
  return null;
}

export function validateGender(value: unknown): string | null {
  const gender = String(value ?? "");
  if (gender && !["Male", "Female"].includes(gender)) {
    return "Please select a valid gender.";
  }
  return null;
}

const ALLOWED_IMAGE_HOSTS = new Set([
  "img.freepik.com",
  "media.istockphoto.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "encrypted-tbn0.gstatic.com",
  "static.thenounproject.com",
]);

export function validateImageUrl(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Image must be a valid URL.";
  }

  if (url.protocol !== "https:") return "Image URL must use https.";
  if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
    return `Images must be hosted on one of: ${[...ALLOWED_IMAGE_HOSTS].join(", ")}.`;
  }
  return null;
}

export function validatePrice(value: unknown): string | null {
  const price = Number.parseFloat(String(value));
  if (!Number.isFinite(price) || price < 0 || price > 10_000_000) {
    return "Price must be a number between 0 and 10,000,000.";
  }
  return null;
}

export function validateStock(value: unknown): string | null {
  const stock = Number.parseInt(String(value), 10);
  if (!Number.isFinite(stock) || stock < 0 || stock > 1_000_000) {
    return "Stock must be a whole number between 0 and 1,000,000.";
  }
  return null;
}

export function validateCategory(value: unknown): string | null {
  const category = String(value ?? "").trim();
  if (category.length < 2 || category.length > 40) {
    return "Category must be between 2 and 40 characters.";
  }
  if (!/^[a-zA-Z0-9\s-]+$/.test(category)) {
    return "Category may only contain letters, numbers, spaces and hyphens.";
  }
  return null;
}

export function collectErrors(
  checks: Record<string, string | null>
): FieldErrors | null {
  const errors: FieldErrors = {};
  for (const [field, message] of Object.entries(checks)) {
    if (message) errors[field] = message;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
