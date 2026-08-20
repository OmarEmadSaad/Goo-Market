import { notFound } from "next/navigation";

import ProductForm from "../ProductForm";
import { getCategories, getProductById } from "@/lib/server/products";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
        Edit {product.name}
      </h1>
      <ProductForm
        product={product}
        categories={categories.map((category) => category.name)}
      />
    </>
  );
}
