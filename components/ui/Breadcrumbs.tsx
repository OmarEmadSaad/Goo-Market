import Link from "next/link";
import type { Breadcrumb } from "@/lib/types";

export default function Breadcrumbs({ trail }: { trail: readonly Breadcrumb[] }) {
  if (!Array.isArray(trail) || trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500 dark:text-[#93B1A6]">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={crumb.url} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-[var(--gm-text)]"
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="hover:text-green-700 hover:underline dark:hover:text-green-300"
                >
                  {crumb.name}
                </Link>
              )}
              {isLast ? null : (
                <span aria-hidden="true" className="select-none">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
