import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import SortSelect from "@/components/product/SortSelect";
import CategoryFilter from "@/components/product/CategoryFilter";
import SearchForm from "@/components/layout/SearchForm";
import JsonLd from "@/components/seo/JsonLd";
import { EmptyState } from "@/components/ui/States";

import { findProducts, getCategories } from "@/lib/server/products";
import {
  DEFAULT_PAGE_SIZE,
  collectCategories,
  paginate,
  parseSort,
  sortProducts,
} from "@/lib/catalog";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import type { Breadcrumb } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Goo-Market catalog by product or category name.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps) {
  const query = await searchParams;

  const term = String(query.query ?? "").trim();
  const sort = parseSort(query.sort);
  const categorySlug = query.category ? String(query.category) : undefined;
  const requestedPage = Number.parseInt(String(query.page ?? "1"), 10) || 1;

  const matches = term ? await findProducts(term) : [];
  const matchCategories = collectCategories(matches);
  const filtered = categorySlug
    ? matches.filter((product) => product.categorySlug === categorySlug)
    : matches;

  const sorted = sortProducts(filtered, sort);
  const pageData = paginate(sorted, requestedPage, DEFAULT_PAGE_SIZE);

  const trail: Breadcrumb[] = [
    { name: "Home", url: "/" },
    { name: "Search", url: "/search" },
  ];

  const buildSearchHref = (
    overrides: { page?: number; category?: string | undefined } = {}
  ) => {
    const params = new URLSearchParams();
    if (term) params.set("query", term);
    if (sort !== "relevance") params.set("sort", sort);

    const nextCategory =
      "category" in overrides ? overrides.category : categorySlug;
    if (nextCategory) params.set("category", nextCategory);

    const nextPage = overrides.page ?? 1;
    if (nextPage > 1) params.set("page", String(nextPage));

    const search = params.toString();
    return search ? `/search?${search}` : "/search";
  };

  const allCategories = await getCategories();

  return (
    <Container className="py-8">
      <JsonLd schema={breadcrumbSchema(trail)} />
      <Breadcrumbs trail={trail} />

      <h1 className="text-2xl font-bold sm:text-3xl">
        {term ? (
          <>
            Search results for{" "}
            <span className="text-green-700 dark:text-green-300">{term}</span>
          </>
        ) : (
          "Search"
        )}
      </h1>

      <div className="mt-4 max-w-xl [&_input]:border-[var(--gm-border)] [&_input]:bg-[var(--gm-surface)] [&_input]:text-[var(--gm-text)]">
        <SearchForm defaultValue={term} />
      </div>

      {!term ? (
        <div className="mt-10">
          <EmptyState
            title="What are you looking for?"
            description="Search by product name or category, or browse the catalog."
            action={{ label: "Browse categories", href: "/category" }}
          />
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title={`No results for "${term}"`}
            description="Try a shorter or more general term, or browse by category."
            action={{ label: "Browse categories", href: "/category" }}
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CategoryFilter
              categories={matchCategories}
              activeSlug={categorySlug}
              allHref={buildSearchHref({ category: undefined })}
              buildHref={(slug) => buildSearchHref({ category: slug })}
            />
          </div>

          <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-[#93B1A6]">
              {pageData.total} {pageData.total === 1 ? "result" : "results"}
              {categorySlug ? " in this category" : ""}
            </p>
            <SortSelect value={sort} />
          </div>

          {pageData.items.length === 0 ? (
            <EmptyState
              title="No products match this filter"
              action={{
                label: "Clear the category filter",
                href: buildSearchHref({ category: undefined }),
              }}
            />
          ) : (
            <>
              <ProductGrid
                products={pageData.items}
                priorityCount={4}
                ariaLabel={`Search results for ${term}`}
              />
              <Pagination
                page={pageData.page}
                pageCount={pageData.pageCount}
                buildHref={(page) => buildSearchHref({ page })}
              />
            </>
          )}
        </>
      )}

      {allCategories.length > 0 ? (
        <nav aria-labelledby="search-browse" className="mt-12">
          <h2 id="search-browse" className="mb-3 text-lg font-semibold">
            Browse categories
          </h2>
          <CategoryFilter
            categories={allCategories}
            allHref="/category"
            buildHref={(slug) => `/category/${slug}`}
          />
        </nav>
      ) : null}
    </Container>
  );
}
