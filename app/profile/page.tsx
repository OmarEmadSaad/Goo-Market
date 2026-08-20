import { redirect } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import ProfileForm from "./ProfileForm";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Manage your Goo-Market account details.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=%2Fprofile");

  return (
    <Container size="narrow" className="py-10">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">My profile</h1>

      <div className="rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] p-6">
        <ProfileForm user={user} />
      </div>
    </Container>
  );
}
