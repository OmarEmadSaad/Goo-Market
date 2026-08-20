import { toFiniteNumber } from "./pricing";
import type {
  Category,
  CategoryGroup,
  PaginationResult,
  Product,
  SortValue,
} from "./types";

const COMBINING_MARKS = new RegExp("[\u0300-\u036f]", "g");

export function slugify(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function titleCase(value: unknown): string {
  const s = String(value ?? "").trim();
  if (!s) return "";
  return s
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeProducts(raw: unknown): Product[] {
  const seen = new Set<string>();
  const products: Product[] = [];

  for (const entry of flatten(raw)) {
    const product = normalizeProduct(entry);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
  }

  return products;
}

function flatten(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.flat(2).filter(Boolean);
  if (!isRecord(raw)) return [];

  const out: unknown[] = [];
  for (const value of Object.values(raw)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      out.push(...value.filter(Boolean));
    } else if (isRecord(value) && !value.name && !value.id) {
      out.push(...Object.values(value).filter(Boolean));
    } else {
      out.push(value);
    }
  }
  return out;
}

export function normalizeProduct(entry: unknown): Product | null {
  if (!isRecord(entry)) return null;

  const id = String(entry.id ?? "").trim();
  const name = String(entry.name ?? "").trim();
  if (!id || !name) return null;

  const category = String(entry.category ?? "uncategorized")
    .trim()
    .toLowerCase();
  const price = Math.max(0, toFiniteNumber(entry.price));
  const stock = Math.max(0, Math.trunc(toFiniteNumber(entry.stock)));

  return {
    id,
    name,
    slug: `${slugify(name)}-${id.toLowerCase()}`,
    category,
    categorySlug: slugify(category),
    price,
    stock,
    image: typeof entry.image === "string" ? entry.image : "",
    inStock: stock > 0,
    ...(entry.description ? { description: String(entry.description) } : {}),
    ...(entry.brand ? { brand: String(entry.brand) } : {}),
    ...(entry.sku ? { sku: String(entry.sku) } : {}),
  };
}

export function productPath(product: Pick<Product, "slug" | "id">): string {
  return `/product/${product.slug || product.id}`;
}

export function categoryPath(categorySlug: string): string {
  return `/category/${categorySlug}`;
}

export function productIdFromSlug(slug: unknown): string {
  let value: string;
  try {
    value = decodeURIComponent(String(slug ?? "")).trim();
  } catch {
    value = String(slug ?? "").trim();
  }
  if (!value) return "";
  const segments = value.split("-");
  return segments[segments.length - 1] || value;
}

export function collectCategories(products: readonly Product[]): Category[] {
  const map = new Map<string, Category>();
  for (const product of products) {
    const existing = map.get(product.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(product.categorySlug, {
        slug: product.categorySlug,
        name: product.category,
        label: titleCase(product.category),
        count: 1,
        image: product.image,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function groupByCategory(products: readonly Product[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const product of products) {
    let group = groups.get(product.categorySlug);
    if (!group) {
      group = {
        slug: product.categorySlug,
        name: product.category,
        label: titleCase(product.category),
        products: [],
      };
      groups.set(product.categorySlug, group);
    }
    group.products.push(product);
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function searchProducts(
  products: readonly Product[],
  query: unknown
): Product[] {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return [];

  return products.filter((product) => {
    const haystack = `${product.name} ${product.category}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export const SORT_OPTIONS: ReadonlyArray<{ value: SortValue; label: string }> = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export const DEFAULT_SORT: SortValue = "relevance";

export function isValidSort(value: unknown): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export function parseSort(value: unknown): SortValue {
  return isValidSort(value) ? value : DEFAULT_SORT;
}

export function sortProducts(
  products: readonly Product[],
  sort: SortValue = DEFAULT_SORT
): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort(
        (a, b) => a.price - b.price || a.name.localeCompare(b.name)
      );
    case "price-desc":
      return list.sort(
        (a, b) => b.price - a.price || a.name.localeCompare(b.name)
      );
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return list;
  }
}

export const DEFAULT_PAGE_SIZE = 12;

export function paginate<T>(
  items: readonly T[],
  page: unknown = 1,
  pageSize: unknown = DEFAULT_PAGE_SIZE
): PaginationResult<T> {
  const total = items.length;
  const size = Math.max(
    1,
    Math.trunc(toFiniteNumber(pageSize)) || DEFAULT_PAGE_SIZE
  );
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(
    Math.max(1, Math.trunc(toFiniteNumber(page)) || 1),
    pageCount
  );
  const start = (current - 1) * size;

  return {
    items: items.slice(start, start + size),
    page: current,
    pageCount,
    total,
    pageSize: size,
    hasPrevious: current > 1,
    hasNext: current < pageCount,
  };
}

export function getRelatedProducts(
  products: readonly Product[],
  product: Product | null | undefined,
  limit = 4
): Product[] {
  if (!product) return [];
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fillers = products.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}
