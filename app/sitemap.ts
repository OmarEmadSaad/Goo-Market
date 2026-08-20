import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/server/products";
import { categoryPath, productPath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/category`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...categories.map((category) => ({
      url: `${SITE_URL}${categoryPath(category.slug)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}${productPath(product)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
