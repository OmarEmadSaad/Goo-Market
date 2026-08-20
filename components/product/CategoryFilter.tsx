import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

export interface CategoryFilterProps {
  categories: readonly Category[];
  activeSlug?: string;
  extraParams?: Record<string, string | undefined>;
  allHref: string;
  buildHref: (categorySlug: string) => string;
}

export default function CategoryFilter({
  categories,
  activeSlug,
  allHref,
  buildHref,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Filter by category">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-[#93B1A6]">
        Categories
      </h2>
      <ul className="flex flex-wrap gap-2">
        <li>
          <FilterLink href={allHref} active={!activeSlug}>
            All products
          </FilterLink>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <FilterLink
              href={buildHref(category.slug)}
              active={activeSlug === category.slug}
            >
              {category.label}
              <span className="ml-1 text-xs opacity-70">({category.count})</span>
            </FilterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-green-600 font-medium text-white"
          : "border border-[var(--gm-border)] hover:bg-black/5 dark:hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
}
