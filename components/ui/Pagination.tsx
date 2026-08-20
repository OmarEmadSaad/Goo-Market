import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
  className?: string;
}

export default function Pagination({
  page,
  pageCount,
  buildHref,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-8 flex items-center justify-center gap-1", className)}
    >
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        rel="prev"
      >
        Previous
      </PageLink>

      {pageWindow(page, pageCount).map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-2 text-gray-400"
          >
            &hellip;
          </span>
        ) : (
          <PageLink
            key={entry}
            href={buildHref(entry)}
            current={entry === page}
            aria-label={`Go to page ${entry}`}
          >
            {entry}
          </PageLink>
        )
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= pageCount}
        aria-label="Go to next page"
        rel="next"
      >
        Next
      </PageLink>
    </nav>
  );
}

interface PageLinkProps {
  href: string;
  disabled?: boolean;
  current?: boolean;
  children: ReactNode;
  rel?: string;
  "aria-label"?: string;
}

function PageLink({
  href,
  disabled,
  current,
  children,
  ...props
}: PageLinkProps) {
  const classes = cn(
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm",
    current
      ? "bg-green-600 font-semibold text-white"
      : "border border-[var(--gm-border)] hover:bg-black/5 dark:hover:bg-white/10",
    disabled && "pointer-events-none opacity-40"
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true" {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-current={current ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

function pageWindow(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const candidates = new Set([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...candidates]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const output: Array<number | "gap"> = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) output.push("gap");
    output.push(value);
    previous = value;
  }
  return output;
}
