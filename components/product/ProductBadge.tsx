import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductBadge({
  product,
  className,
}: {
  product: Pick<Product, "stock" | "inStock">;
  className?: string;
}) {
  if (!product.inStock) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
          "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-[#93B1A6]",
          className
        )}
      >
        Out of stock
      </span>
    );
  }

  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
          "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
          className
        )}
      >
        Only {product.stock} left
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
        className
      )}
    >
      In stock
    </span>
  );
}

export { LOW_STOCK_THRESHOLD };
