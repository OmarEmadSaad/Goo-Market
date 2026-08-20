import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryCard from "@/components/product/CategoryCard";
import JsonLd from "@/components/seo/JsonLd";
import { EmptyState } from "@/components/ui/States";
import { getCategories } from "@/lib/server/products";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { SITE_NAME } from "@/lib/site";
import type { Breadcrumb } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All categories",
  description: `Browse every product category at ${SITE_NAME}, from electronics to home essentials and food.`,
  alternates: { canonical: "/category" },
};

export default async function CategoryIndexPage() {
  const categories = await getCategories();

  const trail: Breadcrumb[] = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/category" },
  ];

  return (
    <Container className="py-8">
      <JsonLd schema={breadcrumbSchema(trail)} />
      <Breadcrumbs trail={trail} />

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">All categories</h1>
      <p className="mb-8 max-w-2xl text-gray-600 dark:text-[#93B1A6]">
        {categories.length} categories covering{" "}
        {categories.reduce((sum, category) => sum + category.count, 0)} products.
      </p>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Products will appear here as soon as the catalog is populated."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
