import Link from "next/link";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import CategoryCard from "@/components/product/CategoryCard";
import ProductRail from "@/components/product/ProductRail";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { getCategories, getProductGroups } from "@/lib/server/products";
import { categoryPath } from "@/lib/catalog";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Electronics, Home and Food Online`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [groups, categories] = await Promise.all([
    getProductGroups(),
    getCategories(),
  ]);

  const totalProducts = groups.reduce(
    (sum, group) => sum + group.products.length,
    0
  );

  return (
    <>
      <Hero
        productCount={totalProducts}
        categoryCount={categories.length}
        featured={categories[0] ?? null}
      />

      <Container as="section" className="py-10" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-xl font-semibold">
          Shop by category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </Container>

      {groups.length === 0 ? (
        <Container className="py-16">
          <EmptyState
            title="No products available"
            description="The catalog is empty right now. Please check back soon."
          />
        </Container>
      ) : (
        groups.map((group, index) => {
          const headingId = `category-${group.slug}`;
          return (
            <Container
              key={group.slug}
              as="section"
              className="py-8"
              aria-labelledby={headingId}
            >
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 id={headingId} className="text-xl font-semibold">
                  {group.label}
                </h2>
                <Link
                  href={categoryPath(group.slug)}
                  className="whitespace-nowrap text-sm font-medium text-green-700 hover:underline dark:text-green-300"
                >
                  View all {group.label.toLowerCase()}
                  <span className="sr-only"> products</span> &rarr;
                </Link>
              </div>

              <ProductRail
                products={group.products}
                priorityCount={index === 0 ? 2 : 0}
                labelledBy={headingId}
              />
            </Container>
          );
        })
      )}
    </>
  );
}

function Hero({
  productCount,
  categoryCount,
  featured,
}: {
  productCount: number;
  categoryCount: number;
  featured: Category | null;
}) {
  return (
    <section className="bg-gradient-to-br from-green-600 to-green-700 text-white dark:from-[#0B2447] dark:to-[#03001C]">
      <Container className="py-12 sm:py-16">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Everything for your home, kitchen and desk
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          {SITE_DESCRIPTION}
        </p>
        {productCount > 0 ? (
          <p className="mt-2 text-sm text-white/80">
            {productCount} products across {categoryCount}{" "}
            {categoryCount === 1 ? "category" : "categories"}, all discounted.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/category" variant="secondary" size="lg">
            Browse the catalog
          </Button>
          {featured ? (
            <Button
              href={categoryPath(featured.slug)}
              variant="ghost"
              size="lg"
              className="border border-white/50 text-white hover:bg-white/15"
            >
              Shop {featured.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
