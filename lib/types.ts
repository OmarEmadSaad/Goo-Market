
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  stock: number;
  image: string;
  inStock: boolean;
  description?: string;
  brand?: string;
  sku?: string;
}

export interface Category {
  slug: string;
  name: string;
  label: string;
  count: number;
  image: string;
}

export interface CategoryGroup {
  slug: string;
  name: string;
  label: string;
  products: Product[];
}

export interface CartLineRequest {
  id: string;
  quantity: number;
}

export interface CartLine {
  id: string;
  name: string;
  slug: string;
  href: string;
  image: string;
  listPrice: number;
  stock: number;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface Cart {
  items: CartLine[];
  totals: CartTotals;
  adjustments: string[];
}

export type UserRole = "user" | "admin";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string;
  gender: string;
}

export interface UserRecord {
  id?: string;
  userName?: string;
  name?: string;
  username?: string;
  Email?: string;
  email?: string;
  password?: string;
  gender?: string;
  image?: string;
  role?: string;
  cart?: unknown;
  [key: string]: unknown;
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

export interface VerifiedSession extends SessionPayload {
  expiresAt: number;
}

export interface Breadcrumb {
  name: string;
  url: string;
}

export type SortValue =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors?: Record<string, string> };
