"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/lib/types";

export default function ProductRowActions({ product }: { product: Product }) {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${product.name}?`,
      message: "This removes the product from the catalog. It cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        toast(payload.message ?? "Could not delete the product.", "error");
        return;
      }

      toast(`${product.name} deleted.`, "success");
      router.refresh();
    } catch {
      toast("Could not delete the product.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        href={`/admin/products/${product.id}`}
        variant="warning"
        size="sm"
        aria-label={`Edit ${product.name}`}
      >
        Edit
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={busy}
        aria-label={`Delete ${product.name}`}
      >
        {busy ? "..." : "Delete"}
      </Button>
    </div>
  );
}
