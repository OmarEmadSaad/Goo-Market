import {
  CURRENCY,
  formatPrice,
  getDiscountPercent,
  getUnitPrice,
} from "@/lib/pricing";
import { cn } from "@/lib/cn";

export interface ProductPriceProps {
  listPrice: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}

const SIZES = {
  sm: { now: "text-sm font-semibold", was: "text-xs" },
  md: { now: "text-base font-semibold", was: "text-sm" },
  lg: { now: "text-2xl font-bold", was: "text-base" },
} as const;

export default function ProductPrice({
  listPrice,
  size = "md",
  showDiscount = true,
  className,
}: ProductPriceProps) {
  const now = getUnitPrice(listPrice);
  const discounted = now < listPrice;
  const styles = SIZES[size];

  return (
    <p className={cn("relative flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("text-green-700 dark:text-green-400", styles.now)}>
        {formatPrice(now)}
      </span>

      {discounted ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "text-gray-500 line-through dark:text-[#93B1A6]",
              styles.was
            )}
          >
            {formatPrice(listPrice)}
          </span>
          <span className="sr-only">
            , reduced from {CURRENCY} {listPrice.toFixed(2)}
          </span>
          {showDiscount ? (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
              {getDiscountPercent()}% off
            </span>
          ) : null}
        </>
      ) : null}
    </p>
  );
}
