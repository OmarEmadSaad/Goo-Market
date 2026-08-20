import { redirect } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import RegisterForm from "./RegisterForm";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Goo-Market account to save your cart and check out.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSession()) redirect("/");

  return (
    <Container className="py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] shadow-sm lg:grid-cols-2">
        <div className="hidden lg:block">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/Ecommerce.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="mb-8 text-xl font-bold sm:text-2xl">
            Create your <span className="text-green-700 dark:text-green-300">account</span>
          </h1>
          <RegisterForm />
        </div>
      </div>
    </Container>
  );
}
