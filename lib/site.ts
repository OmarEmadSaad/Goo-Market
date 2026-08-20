
export const SITE_NAME = "Goo-Market";

export const SITE_DESCRIPTION =
  "Goo-Market is an online store for electronics, home essentials and food, with every item discounted and priced in EGP.";

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_LOCALE = "en_US";
export const SITE_LANG = "en";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
