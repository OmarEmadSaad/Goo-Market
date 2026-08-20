import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import SortSelect from "@/components/product/SortSelect";
import JsonLd from "@/components/seo/JsonLd";
import { EmptyState } from "@/components/ui/States";

import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/server/products";
import {
  DEFAULT_PAGE_SIZE,
  categoryPath,
  paginate,
  parseSort,
  sortProducts,
} from "@/lib/catalog";
import {
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
} from "@/lib/seo/jsonld";
import { SITE_NAME } from "@/lib/site";
import type { Breadcrumb } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: true } };
  }

  const page = Number.parseInt(String(query.page ?? "1"), 10) || 1;
  const canonical = categoryPath(category.slug);

  return {
    title:
      page > 1
        ? `${category.label} - page ${page}`
        : `${category.label} products`,
    description: `Shop ${category.count} ${category.label.toLowerCase()} products at ${SITE_NAME}. Discounted prices in EGP with live stock levels.`,
    alternates: { canonical },
    robots:
      page > 1
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = parseSort(query.sort);
  const requestedPage = Number.parseInt(String(query.page ?? "1"), 10) || 1;

  const products = await getProductsByCategory(category.slug);
  const sorted = sortProducts(products, sort);
  const pageData = paginate(sorted, requestedPage, DEFAULT_PAGE_SIZE);

  const trail: Breadcrumb[] = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/category" },
    { name: category.label, url: categoryPath(category.slug) },
  ];

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (sort !== "relevance") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return search ? `${categoryPath(category.slug)}?${search}` : categoryPath(category.slug);
  };

  const siblings = (await getCategories()).filter(
    (entry) => entry.slug !== category.slug
  );

  return (
    <Container className="py-8">
      <JsonLd
        schema={[
          collectionPageSchema(category, categoryPath(category.slug)),
          breadcrumbSchema(trail),
          itemListSchema(pageData.items, {
            name: `${category.label} products`,
            url: categoryPath(category.slug),
          }),
        ]}
      />
      <Breadcrumbs trail={trail} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {category.label} products
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600 dark:text-[#93B1A6]">
          {category.count}{" "}
          {category.count === 1 ? "product" : "products"} in{" "}
          {category.label.toLowerCase()} at {SITE_NAME}, with the storefront
          discount already applied and live stock levels.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-[#93B1A6]">
          Showing {pageData.items.length} of {pageData.total}
        </p>
        <SortSelect value={sort} />
      </div>

      {pageData.items.length === 0 ? (
        <EmptyState
          title="No products in this category yet"
          action={{ label: "Browse all categories", href: "/category" }}
        />
      ) : (
        <>
          <ProductGrid
            products={pageData.items}
            priorityCount={4}
            ariaLabel={`${category.label} products`}
          />
          <Pagination
            page={pageData.page}
            pageCount={pageData.pageCount}
            buildHref={buildHref}
          />
        </>
      )}

      {siblings.length > 0 ? (
        <nav aria-labelledby="related-categories" className="mt-12">
          <h2 id="related-categories" className="mb-3 text-lg font-semibold">
            Related categories
          </h2>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={categoryPath(entry.slug)}
                  className="inline-flex min-h-9 items-center rounded-full border border-[var(--gm-border)] px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {entry.label}
                  <span className="ml-1 text-xs opacity-70">({entry.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </Container>
  );
}
