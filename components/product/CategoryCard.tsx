import Link from "next/link";
import Image from "next/image";
import { categoryPath } from "@/lib/catalog";
import type { Category } from "@/lib/types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={categoryPath(category.slug)}
      className="group flex items-center gap-4 rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-4 transition-shadow hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold group-hover:text-green-700 dark:group-hover:text-green-300">
          {category.label}
        </p>
        <p className="text-sm text-gray-500 dark:text-[#93B1A6]">
          {category.count} {category.count === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}
