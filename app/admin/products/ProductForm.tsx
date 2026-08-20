"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { uploadImage } from "@/lib/upload";
import type { Product } from "@/lib/types";

export interface ProductFormProps {
  product?: Product;
  categories: readonly string[];
}

const PLACEHOLDER = "/product-placeholder.svg";

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const isEdit = Boolean(product);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(product?.image || PLACEHOLDER);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : imageUrl || PLACEHOLDER);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setBusy(true);

    const formData = new FormData(event.currentTarget);

    try {
      let image = imageUrl.trim();
      if (file) {
        try {
          image = await uploadImage(file);
        } catch {
          toast("The image could not be uploaded.", "error");
          return;
        }
      }

      const response = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            category: formData.get("category"),
            price: formData.get("price"),
            stock: formData.get("stock"),
            image,
          }),
        }
      );

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !payload.ok) {
        setErrors(payload.errors ?? {});
        toast(payload.message ?? "Could not save the product.", "error");
        return;
      }

      toast(isEdit ? "Product updated." : "Product added.", "success");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast("Could not reach the server. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4" noValidate>
      <Field
        label="Product name"
        name="name"
        defaultValue={product?.name}
        required
        error={errors.name}
      />

      <Field
        label="Category"
        name="category"
        defaultValue={product?.category}
        required
        list="admin-category-options"
        error={errors.category}
        hint="Pick an existing category or type a new one."
      />
      <datalist id="admin-category-options">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price (EGP)"
          name="price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          defaultValue={product?.price}
          required
          error={errors.price}
          hint="The list price. The storefront discount is applied on top."
        />

        <Field
          label="Stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={product?.stock}
          required
          error={errors.stock}
        />
      </div>

      <Field
        label="Image URL"
        name="imageUrl"
        type="url"
        value={imageUrl}
        onChange={(event) => {
          setImageUrl(event.target.value);
          if (!file) setPreview(event.target.value || PLACEHOLDER);
        }}
        error={errors.image}
        hint="Or upload a file below. Uploads override this field."
      />

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--gm-border)]">
          <Image
            src={preview}
            alt=""
            fill
            sizes="80px"
            unoptimized
            className="object-contain p-1"
          />
        </div>
        <div>
          <label htmlFor="product-photo" className="text-sm font-medium">
            Upload an image
          </label>
          <input
            id="product-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-green-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-800 hover:file:bg-green-200"
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : isEdit ? "Save changes" : "Add product"}
        </Button>
        <Button href="/admin/products" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
