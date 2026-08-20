# Goo-Market

A Next.js 15 (App Router) e-commerce storefront in TypeScript. Electronics, home essentials and
food, priced in EGP, backed by a Firebase Realtime Database.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run test:coverage` | Vitest with a coverage report |
| `npm run verify` | typecheck → lint → test → build |

## Environment

See `.env.example`. The split matters:

- `FIREBASE_DB_URL`, `FIREBASE_DB_AUTH`, `AUTH_SECRET` are **server-only**. They must never gain a
  `NEXT_PUBLIC_` prefix — that would inline them into the client bundle.
- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, Open Graph tags, the sitemap and JSON-LD. Set it to
  the real production origin or the structured data will point at localhost.
- `NEXT_PUBLIC_CLOUD_NAME` / `NEXT_PUBLIC_UPLOAD_PRESET` are public by design (unsigned Cloudinary
  uploads happen from the browser).

## Deploying

`.env` is gitignored, so the host has no environment variables until you add them. On Vercel:
*Project → Settings → Environment Variables*, add all five from `.env.example`, then redeploy.

If `FIREBASE_DB_URL` is missing the build still **succeeds** — it just ships an empty catalog and
logs `[catalog] failed to load products: FIREBASE_DB_URL is not configured` for every page. Check
the build log for that line if the deployed store looks empty.

`NEXT_PUBLIC_SITE_URL` must be the real production origin. It is baked into canonical URLs, Open
Graph tags, `sitemap.xml` and JSON-LD at build time, so a wrong value ships wrong metadata.

## Structure

```
app/
  layout.tsx              root layout: header, footer, providers, site-wide JSON-LD
  page.tsx                home (Server Component)
  category/               category hub and /category/[slug]
  product/[slug]/         product detail; legacy /product/<id> 308s to the slug
  search/                 server-side search, filter, sort, pagination
  cart/ login/ register/ profile/ forbidden/
  admin/                  dashboard, product CRUD, user roles
  api/                    auth, cart, checkout, account, admin mutations
  robots.ts sitemap.ts

components/
  layout/                 Header, Footer, BrowseMenu, SearchForm, CartLink, AccountMenu, ThemeToggle
  product/                ProductCard, ProductGrid, ProductRail, ProductImage, ProductPrice,
                          ProductBadge, CategoryCard, CategoryFilter, SortSelect
  cart/                   CartProvider, CartContents, CartItemRow, CartSummary,
                          QuantitySelector, AddToCartButton
  ui/                     Button, Container, Field, Drawer, Toast, Pagination, Breadcrumbs,
                          Skeleton, Spinner, States
  seo/JsonLd.tsx

lib/
  catalog.ts              normalising, searching, sorting, paginating (pure)
  pricing.ts              discount, tax, cart totals, formatting (pure)
  types.ts site.ts cn.ts upload.ts session.ts
  seo/jsonld.ts           structured data builders
  server/                 server-only: db, products, users, cart, session, password,
                          validation, rate-limit, admin, product-admin

tests/                    Vitest + Testing Library
```

## Architecture rules

**The server owns money, stock and identity.** The cart API accepts only `{id, quantity}`; names,
images, prices and stock are looked up from the catalog on every read and write, and checkout
recomputes the total before clearing the cart. `lib/pricing.ts` is the single source of truth for
every displayed and charged number.

**Server Components by default.** `"use client"` appears only where there is real interaction:
the cart store, the menu drawer, the toast host, the theme toggle, form submissions and the admin
row actions. Everything a crawler or an answer engine needs — product names, prices, availability,
categories, breadcrumbs, internal links, JSON-LD — is in the server-rendered HTML.

**Caching is split by ownership.** The catalog is public, so `lib/server/products.ts` wraps it in
`React.cache` (per-request dedup) plus `next: { revalidate: 300, tags: ["products"] }` (shared
across requests, invalidated on admin writes). Cart, session and account reads use `cache: "no-store"`
and their routes are `force-dynamic`, so per-user data never lands in a shared cache.

**No fabricated data.** The catalog stores `category, id, image, name, price, stock`. Nothing else
is invented — no brand, no rating, no reviews — and structured data emits only what the record
genuinely carries.

## Testing

```bash
npm test
```

210 tests across pricing, catalog, server cart, client cart, sessions, passwords, validation,
structured data and the reusable components.

## Security

See [SECURITY.md](SECURITY.md). It lists what was fixed and, importantly, the **Firebase database
rules that still need to be locked down in the Firebase console** — the application no longer
depends on them being open, but they are still open.
