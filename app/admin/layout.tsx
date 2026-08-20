import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=%2Fadmin");
  if (user.role !== "admin") redirect("/forbidden");

  return (
    <Container className="py-8">
      <nav aria-label="Admin" className="mb-8 flex flex-wrap gap-2">
        <AdminLink href="/admin">Overview</AdminLink>
        <AdminLink href="/admin/products">Products</AdminLink>
        <AdminLink href="/admin/users">Users</AdminLink>
      </nav>

      {children}
    </Container>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-[var(--gm-border)] px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
    >
      {children}
    </Link>
  );
}
