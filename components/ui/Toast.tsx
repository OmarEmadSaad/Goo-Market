"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastIntent = "success" | "error" | "info";

interface Toast {
  id: number;
  intent: ToastIntent;
  message: string;
}

interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ToastContextValue {
  toast: (message: string, intent?: ToastIntent) => void;
  confirm: (request: ConfirmRequest) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<
    (ConfirmRequest & { resolve: (value: boolean) => void }) | null
  >(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, intent: ToastIntent = "info") => {
      const id = (nextId.current += 1);
      setToasts((current) => [...current, { id, intent, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss]
  );

  const confirm = useCallback((request: ConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...request, resolve });
    });
  }, []);

  const settle = useCallback(
    (result: boolean) => {
      pending?.resolve(result);
      setPending(null);
    },
    [pending]
  );

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg",
              entry.intent === "success" && "bg-green-600 text-white",
              entry.intent === "error" && "bg-red-600 text-white",
              entry.intent === "info" && "bg-[var(--gm-surface)] text-[var(--gm-text)] border border-[var(--gm-border)]"
            )}
          >
            <span className="flex-1">{entry.message}</span>
            <button
              type="button"
              onClick={() => dismiss(entry.id)}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {pending ? <ConfirmDialog request={pending} onSettle={settle} /> : null}
    </ToastContext.Provider>
  );
}

function ConfirmDialog({
  request,
  onSettle,
}: {
  request: ConfirmRequest;
  onSettle: (result: boolean) => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onSettle(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onSettle]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onSettle(false)}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={request.message ? "confirm-message" : undefined}
        className="relative w-full max-w-sm rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-6 text-[var(--gm-text)] shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {request.title}
        </h2>
        {request.message ? (
          <p
            id="confirm-message"
            className="mt-2 text-sm text-gray-600 dark:text-[#93B1A6]"
          >
            {request.message}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onSettle(false)}
            className="rounded-md border border-[var(--gm-border)] px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            {request.cancelLabel ?? "Cancel"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onSettle(true)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-white",
              request.destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {request.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
