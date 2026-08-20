import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Deterministic site URL for canonical / JSON-LD assertions.
process.env.NEXT_PUBLIC_SITE_URL = "https://goomarket.test";
process.env.AUTH_SECRET = "test-secret-that-is-long-enough-for-hmac";

/**
 * `next/image` renders a real `<img>` in tests. Its `fill` / `priority` props
 * are not valid DOM attributes, so they are stripped to keep the console free
 * of React warnings that would otherwise drown out real ones.
 */
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    priority,
    unoptimized,
    ...rest
  }: Record<string, unknown> & { src: string; alt: string }) => {
    void fill;
    void priority;
    void unoptimized;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={alt} {...rest} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: Record<string, unknown> & { href: string; children: React.ReactNode }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
}));

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

export { routerMock };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
