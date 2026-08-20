import Link from "next/link";

import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import ProductRowActions from "./ProductRowActions";
import { getProducts } from "@/lib/server/products";
import { productPath, titleCase } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
        <Button href="/admin/products/new">Add product</Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to get the catalog started."
          action={{ label: "Add product", href: "/admin/products/new" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--gm-border)]">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              All catalog products with price, stock and management actions
            </caption>
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th scope="col" className="p-3 font-medium">Name</th>
                <th scope="col" className="p-3 font-medium">Category</th>
                <th scope="col" className="p-3 font-medium">Price</th>
                <th scope="col" className="p-3 font-medium">Stock</th>
                <th scope="col" className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-[var(--gm-border)]"
                >
                  <th scope="row" className="p-3 font-medium">
                    <Link
                      href={productPath(product)}
                      className="hover:text-green-700 hover:underline dark:hover:text-green-300"
                    >
                      {product.name}
                    </Link>
                    <span className="block text-xs font-normal text-gray-500 dark:text-[#93B1A6]">
                      {product.id}
                    </span>
                  </th>
                  <td className="p-3">{titleCase(product.category)}</td>
                  <td className="p-3 tabular-nums">{formatPrice(product.price)}</td>
                  <td className="p-3 tabular-nums">{product.stock}</td>
                  <td className="p-3">
                    <ProductRowActions product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
