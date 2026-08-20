import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

const RAIL_SIZES = "(max-width: 640px) 60vw, (max-width: 1024px) 33vw, 20rem";

export interface ProductRailProps {
  products: readonly Product[];
  priorityCount?: number;
  labelledBy?: string;
}

export default function ProductRail({
  products,
  priorityCount = 0,
  labelledBy,
}: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <ul
      className="gm-rail"
      aria-labelledby={labelledBy}
      tabIndex={0}
      role="list"
    >
      {products.map((product, index) => (
        <li key={product.id} className="w-[60vw] max-w-[18rem] sm:w-64 lg:w-72">
          <ProductCard
            product={product}
            priority={index < priorityCount}
            sizes={RAIL_SIZES}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
