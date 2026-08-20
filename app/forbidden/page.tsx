import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <Container size="narrow" className="flex min-h-[60vh] items-center py-16">
      <div className="w-full rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          You are not authorized
        </h1>
        <p className="mt-3 text-gray-600 dark:text-[#93B1A6]">
          This area is only available to administrators.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/login" variant="secondary">
            Log in as another user
          </Button>
        </div>
      </div>
    </Container>
  );
}
