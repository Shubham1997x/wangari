"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ProductTable } from "@/components/admin/product-table";
import { inputClass } from "@/components/admin/form-classes";
import type { AdminProduct, AdminTaxonomy } from "@/app/actions/admin";

type StatusFilter = "all" | "live" | "hidden";

export function ProductsClient({
  initialProducts,
  taxonomy,
}: {
  initialProducts: AdminProduct[];
  taxonomy: AdminTaxonomy;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setFormOpen(true);
  };

  const onChanged = () => router.refresh();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialProducts.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (statusFilter === "live" && !p.isActive) return false;
      if (statusFilter === "hidden" && p.isActive) return false;
      if (!q) return true;
      return `${p.name} ${p.slug}`.toLowerCase().includes(q);
    });
  }, [initialProducts, search, categoryFilter, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tighter text-ink">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {filtered.length} of {initialProducts.length} in the catalog
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-ultra px-5 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98]"
        >
          + Add product
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or slug..."
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className={`${inputClass} max-w-[12rem]`}
        >
          <option value="all">All categories</option>
          {taxonomy.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={`${inputClass} max-w-[10rem]`}
        >
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="mt-4">
        <ProductTable products={filtered} onEdit={openEdit} onChanged={onChanged} />
      </div>

      {formOpen && (
        <ProductFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editing}
          taxonomy={taxonomy}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}
