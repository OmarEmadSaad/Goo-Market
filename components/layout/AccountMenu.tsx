"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { PublicUser } from "@/lib/types";

export default function AccountMenu({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
      >
        Login
      </Link>
    );
  }

  async function handleLogout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      toast("You have been logged out.", "success");
      router.push("/");
      router.refresh();
    } catch {
      toast("Could not log out. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-md p-1 hover:bg-white/15"
        aria-label={`Account: ${user.name}`}
      >
        <Image
          src={user.image}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-white/70 object-cover"
        />
        <span className="hidden max-w-24 truncate text-sm text-white sm:inline">
          {user.name}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={busy}
        className="rounded-md px-2 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
      >
        {busy ? "..." : "Logout"}
      </button>
    </div>
  );
}
