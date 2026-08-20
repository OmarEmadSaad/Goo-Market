"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { uploadImage } from "@/lib/upload";
import type { PublicUser } from "@/lib/types";

export default function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const { toast, confirm } = useToast();

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(user.image);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : user.image);
  }

  function cancelEditing() {
    setEditing(false);
    setErrors({});
    setFile(null);
    setPreview(user.image);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    try {
      let image: string | undefined;
      if (file) {
        try {
          image = await uploadImage(file);
        } catch {
          toast("The photo could not be uploaded.", "error");
          return;
        }
      }

      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          ...(password ? { password } : {}),
          ...(image ? { image } : {}),
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
        changed?: boolean;
      };

      if (!response.ok || !payload.ok) {
        setErrors(payload.errors ?? {});
        toast(payload.message ?? "Could not save your changes.", "error");
        return;
      }

      toast(
        payload.changed ? "Profile updated." : "No changes to save.",
        payload.changed ? "success" : "info"
      );
      setEditing(false);
      setFile(null);
      router.refresh();
    } catch {
      toast("Could not reach the server. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete your account?",
      message: "This permanently removes your account and cart. It cannot be undone.",
      confirmLabel: "Delete account",
      destructive: true,
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast("Your account has been deleted.", "success");
      router.push("/");
      router.refresh();
    } catch {
      toast("Could not delete your account.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-6">
        <Summary user={user} />

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setEditing(true)}>Edit profile</Button>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            Delete account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-4">
        <Image
          src={preview}
          alt=""
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 rounded-full border-2 border-green-500 object-cover"
        />
        <div>
          <label htmlFor="profile-photo" className="text-sm font-medium">
            Profile photo
          </label>
          <input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-green-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-800 hover:file:bg-green-200"
          />
        </div>
      </div>

      <Field
        label="Name"
        name="name"
        defaultValue={user.name}
        autoComplete="name"
        required
        error={errors.name}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={user.email}
        autoComplete="email"
        required
        error={errors.email}
      />

      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Leave blank to keep your current password"
        error={errors.password}
        hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
      />

      <div className="mt-2 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={cancelEditing} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Summary({ user }: { user: PublicUser }) {
  const rows: Array<[string, string]> = [
    ["Name", user.name],
    ["Email", user.email || "Not set"],
    ["Role", user.role === "admin" ? "Administrator" : "Customer"],
  ];
  if (user.gender) rows.push(["Gender", user.gender]);

  return (
    <div className="flex flex-col gap-6">
      <Image
        src={user.image}
        alt=""
        width={96}
        height={96}
        unoptimized
        className="h-24 w-24 self-center rounded-full border-4 border-green-500 object-cover"
      />

      <dl className="divide-y divide-[var(--gm-border)] rounded-lg border border-[var(--gm-border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-gray-500 dark:text-[#93B1A6]">{label}</dt>
            <dd className="break-all text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
