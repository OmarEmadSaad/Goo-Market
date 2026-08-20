"use client";

import { useEffect } from "react";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error.message, error.digest);
  }, [error]);

  return (
    <Container size="narrow" className="flex min-h-[60vh] items-center py-16">
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">
          Something went wrong
        </h1>
        <p className="mt-3 text-red-600 dark:text-red-200">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "We could not load this page. Please try again."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="secondary">
            Back home
          </Button>
        </div>
      </div>
    </Container>
  );
}
