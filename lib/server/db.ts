import "server-only";

export type DatabaseErrorCode =
  | "MISSING_CONFIG"
  | "INVALID_URL"
  | "NETWORK"
  | "AUTH"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "BAD_STATUS"
  | "PARSE_ERROR";

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode;
  readonly status?: number;
  readonly path?: string;
  readonly url?: string;

  constructor(
    code: DatabaseErrorCode,
    message: string,
    details: { status?: number; path?: string; url?: string; cause?: unknown } = {}
  ) {
    super(message, { cause: details.cause });
    this.name = "DatabaseError";
    this.code = code;
    this.status = details.status;
    this.path = details.path;
    this.url = details.url;
  }
}

const ENV_CANDIDATES = [
  "FIREBASE_DB_URL",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
] as const;

const DERIVABLE_CANDIDATES = [
  "NEXT_PUBLIC_PRODUCT_URL",
  "NEXT_PUBLIC_USERS_URL",
] as const;

export interface ResolvedDatabase {
  url: string;
  source: string;
}

function stripNodeSuffix(value: string): string {
  return value.replace(/\/[^/]*\.json.*$/i, "");
}

export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env
): ResolvedDatabase {
  const tried: string[] = [];

  for (const name of ENV_CANDIDATES) {
    const raw = env[name]?.trim();
    tried.push(name);
    if (raw) return { url: normalizeRoot(raw, name), source: name };
  }

  for (const name of DERIVABLE_CANDIDATES) {
    const raw = env[name]?.trim();
    tried.push(name);
    if (raw) {
      const root = stripNodeSuffix(raw);
      if (root) return { url: normalizeRoot(root, name), source: `${name} (derived)` };
    }
  }

  throw new DatabaseError(
    "MISSING_CONFIG",
    `No database URL configured. Set one of: ${tried.join(", ")}.`
  );
}

function normalizeRoot(raw: string, source: string): string {
  const value = raw.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new DatabaseError(
      "INVALID_URL",
      `${source} is not a valid URL: "${redactValue(value)}".`
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new DatabaseError(
      "INVALID_URL",
      `${source} must be an http(s) URL, received "${parsed.protocol}".`
    );
  }
  return value;
}

function redactValue(value: string): string {
  return value.replace(/([?&]auth=)[^&]*/gi, "$1[redacted]");
}

let cachedDatabase: ResolvedDatabase | null = null;

export function getDatabase(): ResolvedDatabase {
  if (!cachedDatabase) cachedDatabase = resolveDatabaseUrl();
  return cachedDatabase;
}

export function resetDatabaseCache(): void {
  cachedDatabase = null;
}

type QueryParams = Record<string, string | number | undefined | null>;

function endpoint(path: string, query: QueryParams = {}): string {
  const { url: root } = getDatabase();
  const clean = String(path).replace(/^\/+|\/+$/g, "");
  const url = new URL(`${root}/${clean}.json`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  const auth = process.env.FIREBASE_DB_AUTH?.trim();
  if (auth) url.searchParams.set("auth", auth);
  return url.toString();
}

function safeUrl(url: string): string {
  return redactValue(url);
}

export function describeDatabaseError(error: unknown): string {
  if (error instanceof DatabaseError) {
    const parts = [`code=${error.code}`];
    if (error.status !== undefined) parts.push(`status=${error.status}`);
    if (error.path) parts.push(`path=${error.path}`);
    if (error.url) parts.push(`url=${error.url}`);
    parts.push(`message=${error.message}`);
    return parts.join(" ");
  }
  if (error instanceof Error) return `code=UNKNOWN message=${error.message}`;
  return `code=UNKNOWN message=${String(error)}`;
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
  const url = endpoint(path, query);
  const shown = safeUrl(url);

  const init: RequestInit & { next?: RequestOptions["next"] } = {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  if (next) init.next = next;
  if (cache) init.cache = cache;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (cause) {
    throw new DatabaseError(
      "NETWORK",
      `Could not reach the database: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
      { path, url: shown, cause }
    );
  }

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    throw new DatabaseError(statusToCode(res.status), detail, {
      status: res.status,
      path,
      url: shown,
    });
  }

  if (res.status === 204) return null;

  let text: string;
  try {
    text = await res.text();
  } catch (cause) {
    throw new DatabaseError("NETWORK", "Response body could not be read.", {
      path,
      url: shown,
      cause,
    });
  }

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch (cause) {
    throw new DatabaseError(
      "PARSE_ERROR",
      `Response was not valid JSON (first 120 chars: ${text.slice(0, 120)})`,
      { path, url: shown, cause }
    );
  }
}

function statusToCode(status: number): DatabaseErrorCode {
  if (status === 401) return "AUTH";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404) return "NOT_FOUND";
  return "BAD_STATUS";
}

async function readErrorDetail(res: Response): Promise<string> {
  let hint = "";
  try {
    const text = await res.text();
    if (text) hint = ` Database said: ${redactValue(text.slice(0, 200))}`;
  } catch {
    /* body is optional context only */
  }

  if (res.status === 401) {
    return `Unauthorized (401). FIREBASE_DB_AUTH is missing or rejected.${hint}`;
  }
  if (res.status === 403) {
    return `Permission denied (403). The database rules reject this read/write.${hint}`;
  }
  if (res.status === 404) {
    return `Not found (404). Check the database URL and the node path.${hint}`;
  }
  return `Unexpected status ${res.status}.${hint}`;
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

export function dbSet<T = unknown>(
  path: string,
  body: unknown
): Promise<T | null> {
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
