import ProductForm from "../ProductForm";
import { getCategories } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Add product</h1>
      <ProductForm categories={categories.map((category) => category.name)} />
    </>
  );
}
