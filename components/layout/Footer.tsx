import Link from "next/link";
import { categoryPath } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/site";
import type { Category } from "@/lib/types";

export default function Footer({ categories }: { categories: readonly Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-green-600 text-white dark:bg-[#0B2447]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            Electronics, home essentials and food, delivered across Egypt.
          </p>
        </div>

        {categories.length > 0 ? (
          <nav aria-labelledby="footer-categories">
            <h2 id="footer-categories" className="text-sm font-semibold uppercase tracking-wide">
              Shop
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={categoryPath(category.slug)}
                    className="text-white/85 hover:text-white hover:underline"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" className="text-sm font-semibold uppercase tracking-wide">
            Your account
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/cart" className="text-white/85 hover:text-white hover:underline">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-white/85 hover:text-white hover:underline">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-white/85 hover:text-white hover:underline">
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/20 px-4 py-4 text-center text-sm text-white/80">
        &copy; {year} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
