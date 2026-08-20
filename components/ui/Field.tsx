import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const inputClasses = cn(
  "w-full rounded-md border border-[var(--gm-border)] bg-[var(--gm-surface)] px-3 py-2 text-sm",
  "text-[var(--gm-text)] placeholder:text-gray-400",
  "focus:border-green-600 focus:ring-2 focus:ring-green-600/30",
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/30",
  "disabled:cursor-not-allowed disabled:opacity-60"
);

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClasses, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export interface FieldRenderProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  label: string;
  error?: string;
  hint?: string;
  children?: (props: FieldRenderProps) => ReactNode;
}

export function Field({
  label,
  name,
  id,
  error,
  hint,
  required,
  className,
  children,
  ...inputProps
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `${name ?? "field"}-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy =
    cn(error ? errorId : null, hint ? hintId : null) || undefined;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children ? (
        children({ id: fieldId, describedBy, invalid: Boolean(error) })
      ) : (
        <Input
          id={fieldId}
          name={name}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...inputProps}
        />
      )}

      {hint ? (
        <p id={hintId} className="text-xs text-gray-500 dark:text-[#93B1A6]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
