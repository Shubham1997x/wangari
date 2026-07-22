"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { adminDeleteProduct, type AdminProduct } from "@/app/actions/admin";

type SortKey = "name" | "category" | "price" | "status";
type SortDir = "asc" | "desc";

const SORTERS: Record<SortKey, (p: AdminProduct) => string | number> = {
  name: (p) => p.name.toLowerCase(),
  category: (p) => `${p.categoryName}${p.subcategoryName ?? ""}`.toLowerCase(),
  price: (p) => p.price ?? -Infinity,
  status: (p) => (p.isActive ? 1 : 0),
};

export function ProductTable({
  products,
  onEdit,
  onChanged,
}: {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onChanged: () => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);

  const toggleSort = (key: SortKey) => {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const sorted = useMemo(() => {
    if (!sort) return products;
    const getValue = SORTERS[sort.key];
    const copy = [...products].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    if (sort.dir === "desc") copy.reverse();
    return copy;
  }, [products, sort]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      try {
        await adminDeleteProduct(id);
        toast.success("Product deleted.");
        onChanged();
      } catch {
        toast.error("Could not delete the product.");
      } finally {
        setPendingDelete(null);
      }
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {(
                [
                  { key: "name", label: "Product" },
                  { key: "category", label: "Category" },
                  { key: "price", label: "Price" },
                  { key: "status", label: "Status" },
                ] as const
              ).map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  <button
                    type="button"
                    onClick={() => toggleSort(key as SortKey)}
                    className="flex items-center gap-1 transition-colors hover:text-ultra"
                  >
                    {label}
                    {sort?.key === key && <span aria-hidden="true">{sort.dir === "asc" ? "▲" : "▼"}</span>}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {sorted.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-tint/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="aspect-square w-14 shrink-0 overflow-hidden rounded-md border border-hairline bg-tint">
                      {p.image && (
                        <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.categoryName}
                  {p.subcategoryName && <span className="block text-xs">{p.subcategoryName}</span>}
                </td>
                <td className="px-4 py-3 tabular-nums text-ink">
                  {p.price != null ? <>&#8377;{p.price}/{p.priceUnit}</> : <span className="text-ink-soft">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      p.isActive ? "bg-tint text-ultra" : "bg-hairline/50 text-ink-soft"
                    }`}
                  >
                    {p.isActive ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(p)}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-soft">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="border-hairline bg-paper text-ink">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-extrabold tracking-tight">
              Delete {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-soft">
              It disappears from the public catalog immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
