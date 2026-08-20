import Link from "next/link";
import ProductImage, { GRID_IMAGE_SIZES } from "./ProductImage";
import ProductPrice from "./ProductPrice";
import ProductBadge from "./ProductBadge";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { categoryPath, productPath, titleCase } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
  showAddToCart?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  priority = false,
  sizes = GRID_IMAGE_SIZES,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const href = productPath(product);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] transition-shadow hover:shadow-lg",
        className
      )}
    >
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <ProductImage
          product={product}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={categoryPath(product.categorySlug)}
          className="text-xs uppercase tracking-wide text-gray-500 hover:text-green-700 hover:underline dark:text-[#93B1A6] dark:hover:text-green-300"
        >
          {titleCase(product.category)}
        </Link>

        <h3 className="text-sm font-medium leading-snug">
          <Link href={href} className="hover:text-green-700 dark:hover:text-green-300">
            {product.name}
          </Link>
        </h3>

        <ProductPrice listPrice={product.price} size="md" />

        <ProductBadge product={product} className="self-start" />

        {showAddToCart ? (
          <div className="mt-auto pt-2">
            <AddToCartButton product={product} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
