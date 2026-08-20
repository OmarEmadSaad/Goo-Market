"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Incorrect email or password.");
        return;
      }

      toast("Signed in successfully.", "success");
      router.push(safeRedirect(searchParams.get("redirect")));
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@mail.com"
        required
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="********"
        required
      />

      <Button type="submit" fullWidth size="lg" disabled={busy} className="mt-2">
        {busy ? "Signing in..." : "Log in"}
      </Button>

      <p className="text-center text-sm">
        Do not have an account?{" "}
        <Link href="/register" className="font-medium text-green-700 hover:underline dark:text-green-300">
          Register
        </Link>
      </p>
    </form>
  );
}

function safeRedirect(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
