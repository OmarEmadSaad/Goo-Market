import type { ReactNode } from "react";
import Button from "./Button";
import Spinner from "./Spinner";
import { cn } from "@/lib/cn";

export interface StateAction {
  label: string;
  href: string;
}

interface PanelProps {
  className?: string;
  children: ReactNode;
}

function Panel({ className, children }: PanelProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-xl px-6 py-12 text-center",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: StateAction;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Panel className={className}>
      {icon ? <div aria-hidden="true">{icon}</div> : null}
      <p className="text-lg font-semibold">{title}</p>
      {description ? (
        <p className="text-sm text-gray-500 dark:text-[#93B1A6]">{description}</p>
      ) : null}
      {action ? (
        <Button href={action.href} className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </Panel>
  );
}

export interface ErrorStateProps {
  title?: string;
  error?: string;
  action?: StateAction;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  error,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Panel
      className={cn(
        "border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
        className
      )}
    >
      <p
        role="alert"
        className="text-lg font-semibold text-red-700 dark:text-red-300"
      >
        {title}
      </p>
      <p className="text-sm text-red-600 dark:text-red-200">
        {error || "We could not load this right now. Please try again."}
      </p>
      {action ? (
        <Button variant="secondary" href={action.href} className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </Panel>
  );
}

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Loading",
  className,
}: LoadingStateProps) {
  return (
    <Panel className={className}>
      <Spinner className="h-10 w-10" label={label} />
      <p className="text-sm text-gray-500 dark:text-[#93B1A6]">{label}...</p>
    </Panel>
  );
}
