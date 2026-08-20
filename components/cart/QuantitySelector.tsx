"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { normalizeQuantity } from "@/lib/pricing";

export interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = "Quantity",
  className,
}: QuantitySelectorProps) {
  const inputId = useId();
  const upperBound = Math.max(min, max);

  const update = (next: number) => {
    const clamped = normalizeQuantity(next, { min, max: upperBound });
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>

      <div className="inline-flex items-center rounded-md border border-[var(--gm-border)]">
        <button
          type="button"
          onClick={() => update(value - 1)}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="flex h-10 w-10 items-center justify-center rounded-l-md text-lg leading-none hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
        >
          &minus;
        </button>

        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          className="h-10 w-14 border-x border-[var(--gm-border)] bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={value}
          min={min}
          max={upperBound}
          disabled={disabled}
          onChange={(event) => update(Number(event.target.value))}
        />

        <button
          type="button"
          onClick={() => update(value + 1)}
          disabled={disabled || value >= upperBound}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="flex h-10 w-10 items-center justify-center rounded-r-md text-lg leading-none hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
        >
          +
        </button>
      </div>
    </div>
  );
}
