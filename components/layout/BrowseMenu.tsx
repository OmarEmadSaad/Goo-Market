"use client";

import Link from "next/link";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { categoryPath, productPath } from "@/lib/catalog";
import type { CategoryGroup, PublicUser } from "@/lib/types";

export default function BrowseMenu({
  groups,
  user,
}: {
  groups: readonly CategoryGroup[];
  user: PublicUser | null;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/15"
        aria-label="Open catalog menu"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Drawer open={open} onClose={close} title="Browse the catalog">
        {user?.role === "admin" ? (
          <Link
            href="/admin"
            onClick={close}
            className="mb-4 flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h8v8H3v-8zm10 3h8v5h-8v-5z" />
            </svg>
            Admin dashboard
          </Link>
        ) : null}

        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-[#93B1A6]">
            No products yet.
          </p>
        ) : (
          <nav aria-label="Catalog">
            {groups.map((group) => (
              <section key={group.slug} className="mb-6">
                <Link
                  href={categoryPath(group.slug)}
                  onClick={close}
                  className="mb-2 flex items-baseline justify-between text-sm font-semibold uppercase tracking-wide text-green-700 hover:underline dark:text-green-300"
                >
                  {group.label}
                  <span className="text-xs font-normal opacity-70">
                    View all ({group.products.length})
                  </span>
                </Link>
                <ul className="space-y-1">
                  {group.products.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={productPath(product)}
                        onClick={close}
                        className="block rounded px-2 py-1.5 text-sm hover:bg-black/5 hover:text-green-700 dark:hover:bg-white/10 dark:hover:text-green-300"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        )}
      </Drawer>
    </>
  );
}
