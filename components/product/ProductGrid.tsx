import ProductCard from "./ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export interface ProductGridProps {
  products: readonly Product[];
  priorityCount?: number;
  showAddToCart?: boolean;
  className?: string;
  ariaLabel?: string;
}

const GRID_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw";

export default function ProductGrid({
  products,
  priorityCount = 0,
  showAddToCart = true,
  className,
  ariaLabel,
}: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:grid-cols-5",
        className
      )}
    >
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard
            product={product}
            priority={index < priorityCount}
            sizes={GRID_SIZES}
            showAddToCart={showAddToCart}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
