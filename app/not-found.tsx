import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container size="narrow" className="flex min-h-[60vh] items-center py-16">
      <div className="w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Page not found</h1>
        <p className="mt-3 text-gray-600 dark:text-[#93B1A6]">
          The page you are looking for does not exist, or the product has been
          removed from the catalog.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/category" variant="secondary">
            Browse categories
          </Button>
        </div>
      </div>
    </Container>
  );
}
