"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { UserRole } from "@/lib/types";

export default function UserRoleActions({
  userId,
  name,
  role,
  isSelf,
}: {
  userId: string;
  name: string;
  role: UserRole;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const [busy, setBusy] = useState(false);

  const nextRole: UserRole = role === "admin" ? "user" : "admin";

  if (isSelf) {
    return (
      <p className="text-right text-xs text-gray-500 dark:text-[#93B1A6]">
        You cannot change your own role
      </p>
    );
  }

  async function handleChange() {
    const confirmed = await confirm({
      title: nextRole === "admin" ? `Promote ${name}?` : `Demote ${name}?`,
      message:
        nextRole === "admin"
          ? "They will be able to add, edit and delete products and change other users' roles."
          : "They will lose access to the admin dashboard.",
      confirmLabel: nextRole === "admin" ? "Promote" : "Demote",
      destructive: nextRole === "user",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        toast(payload.message ?? "Could not update the user.", "error");
        return;
      }

      toast(
        nextRole === "admin"
          ? `${name} is now an administrator.`
          : `${name} is now a customer.`,
        "success"
      );
      router.refresh();
    } catch {
      toast("Could not update the user.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        variant={nextRole === "admin" ? "warning" : "danger"}
        onClick={handleChange}
        disabled={busy}
      >
        {busy ? "..." : nextRole === "admin" ? "Promote to admin" : "Demote to user"}
      </Button>
    </div>
  );
}
