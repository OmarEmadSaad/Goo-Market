"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export default function SearchForm({
  defaultValue = "",
  className,
  autoFocus = false,
}: {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      role="search"
      action="/search"
      method="get"
      className={cn("relative flex w-full items-center", className)}
      onSubmit={(event) => {
        const query = value.trim();
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        router.push(`/search?query=${encodeURIComponent(query)}`);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        name="query"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products..."
        className="h-10 w-full rounded-md border border-white/40 bg-white/95 pl-3 pr-24 text-sm text-gray-900 placeholder:text-gray-500 focus:border-white focus:bg-white"
      />
      <button
        type="submit"
        className="absolute right-1 top-1 h-8 rounded bg-green-700 px-3 text-sm font-medium text-white hover:bg-green-800 dark:bg-[#03001C]"
      >
        Search
      </button>
    </form>
  );
}
