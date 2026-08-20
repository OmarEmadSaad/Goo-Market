import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import LoginForm from "./LoginForm";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Goo-Market account.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  return (
    <Container size="narrow" className="flex min-h-[60vh] items-center py-12">
      <div className="w-full rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-6 shadow-sm sm:p-10">
        <h1 className="mb-8 text-center text-xl font-bold sm:text-2xl">
          Welcome back to <span className="text-green-700 dark:text-green-300">Goo-Market</span>
        </h1>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </Container>
  );
}
