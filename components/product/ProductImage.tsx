import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export type ProductImageRatio = "square" | "portrait" | "wide";

const RATIOS: Record<ProductImageRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/9]",
};

const FALLBACK = "/product-placeholder.svg";

export interface ProductImageProps {
  product: Pick<Product, "image" | "name">;
  sizes?: string;
  ratio?: ProductImageRatio;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
  imageClassName?: string;
}

export const GRID_IMAGE_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

export default function ProductImage({
  product,
  sizes = GRID_IMAGE_SIZES,
  ratio = "square",
  priority = false,
  decorative = false,
  className,
  imageClassName,
}: ProductImageProps) {
  const src = product.image || FALLBACK;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-gray-50 dark:bg-white/5",
        RATIOS[ratio],
        className
      )}
    >
      <Image
        src={src}
        alt={decorative ? "" : product.name}
        aria-hidden={decorative || undefined}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={cn("object-contain p-2", imageClassName)}
      />
    </div>
  );
}
