"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Field";
import { SORT_OPTIONS } from "@/lib/catalog";
import type { SortValue } from "@/lib/types";

export default function SortSelect({ value }: { value: SortValue }) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "relevance") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="whitespace-nowrap text-sm font-medium">
        Sort by
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="w-48"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
