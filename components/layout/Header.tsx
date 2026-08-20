import Link from "next/link";
import BrowseMenu from "./BrowseMenu";
import CartLink from "./CartLink";
import AccountMenu from "./AccountMenu";
import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";
import { categoryPath } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/site";
import type { Category, CategoryGroup, PublicUser } from "@/lib/types";

export default function Header({
  groups,
  categories,
  user,
}: {
  groups: readonly CategoryGroup[];
  categories: readonly Category[];
  user: PublicUser | null;
}) {
  return (
    <header className="sticky top-0 z-40 bg-green-600 text-white shadow-md dark:bg-[#0B2447]">
      <a
        href="#main"
        className="gm-sr-only-focusable absolute left-2 top-2 z-50 rounded bg-white px-3 py-2 text-sm font-medium text-green-700"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <BrowseMenu groups={groups} user={user} />

        <Link
          href="/"
          className="whitespace-nowrap text-lg font-semibold hover:text-green-100"
        >
          {SITE_NAME}
        </Link>

        <div className="order-last w-full sm:order-none sm:mx-4 sm:w-auto sm:flex-1 sm:max-w-lg">
          <SearchForm />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <CartLink />
          <AccountMenu user={user} />
        </div>
      </div>

      {categories.length > 0 ? (
        <nav
          aria-label="Product categories"
          className="border-t border-white/20 bg-green-700/40 dark:bg-black/20"
        >
          <ul className="mx-auto flex max-w-screen-2xl gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-8">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={categoryPath(category.slug)}
                  className="inline-block whitespace-nowrap rounded px-3 py-1.5 text-sm hover:bg-white/15"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
