"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { uploadImage } from "@/lib/upload";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(DEFAULT_AVATAR);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : DEFAULT_AVATAR);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    setBusy(true);

    const formData = new FormData(event.currentTarget);

    try {
      let image = "";
      if (file) {
        try {
          image = await uploadImage(file);
        } catch {
          setMessage("The photo could not be uploaded. Try a different image.");
          return;
        }
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          gender: formData.get("gender"),
          image,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !payload.ok) {
        setErrors(payload.errors ?? {});
        setMessage(payload.message ?? "Could not create your account.");
        return;
      }

      toast("Account created. Welcome to Goo-Market!", "success");
      router.push("/");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          {message}
        </p>
      ) : null}

      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        required
        error={errors.name}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.password}
        hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
      />

      <Field label="Gender" name="gender" error={errors.gender}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="gender"
            defaultValue=""
            aria-describedby={describedBy}
            aria-invalid={invalid ? true : undefined}
          >
            <option value="">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        )}
      </Field>

      <div className="flex items-center gap-4">
        <Image
          src={preview}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-full border-2 border-green-500 object-cover"
        />
        <div>
          <label htmlFor="photo" className="text-sm font-medium">
            Profile photo
          </label>
          <input
            id="photo"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-green-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-800 hover:file:bg-green-200"
          />
          {errors.image ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.image}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth disabled={busy} className="mt-2">
        {busy ? "Creating your account..." : "Create account"}
      </Button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-green-700 hover:underline dark:text-green-300"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
