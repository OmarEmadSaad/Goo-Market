import "server-only";

const DB_URL = (process.env.FIREBASE_DB_URL || "").replace(/\/+$/, "");

type QueryParams = Record<string, string | number | undefined | null>;

function endpoint(path: string, query: QueryParams = {}): string {
  const clean = String(path).replace(/^\/+|\/+$/g, "");
  const url = new URL(`${DB_URL}/${clean}.json`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  const auth = process.env.FIREBASE_DB_AUTH;
  if (auth) url.searchParams.set("auth", auth);
  return url.toString();
}

function safeUrl(url: string): string {
  return url.replace(/([?&]auth=)[^&]*/, "$1[redacted]");
}

interface RequestOptions {
  method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  next?: { revalidate?: number; tags?: string[] };
  cache?: RequestCache;
}

async function request<T = unknown>(
  path: string,
  { method = "GET", body, query, next, cache }: RequestOptions = {}
): Promise<T | null> {
  if (!DB_URL) throw new Error("FIREBASE_DB_URL is not configured");

  const url = endpoint(path, query);
  const init: RequestInit & { next?: RequestOptions["next"] } = {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  if (next) init.next = next;
  if (cache) init.cache = cache;

  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Database ${method} ${safeUrl(url)} failed with ${res.status}`);
  }
  if (res.status === 204) return null;

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export function dbRead<T = unknown>(
  path: string,
  options: { revalidate?: number; tags?: string[] } = {}
): Promise<T | null> {
  const { revalidate = 300, tags } = options;
  return request<T>(path, { next: { revalidate, ...(tags ? { tags } : {}) } });
}

export function dbReadFresh<T = unknown>(
  path: string,
  query?: QueryParams
): Promise<T | null> {
  return request<T>(path, { cache: "no-store", query });
}

export function dbSet<T = unknown>(path: string, body: unknown): Promise<T | null> {
  return request<T>(path, { method: "PUT", body, cache: "no-store" });
}

export function dbUpdate<T = unknown>(
  path: string,
  body: unknown
): Promise<T | null> {
  return request<T>(path, { method: "PATCH", body, cache: "no-store" });
}

export function dbPush<T = unknown>(
  path: string,
  body: unknown
): Promise<T | null> {
  return request<T>(path, { method: "POST", body, cache: "no-store" });
}

export function dbRemove(path: string): Promise<unknown> {
  return request(path, { method: "DELETE", cache: "no-store" });
}
