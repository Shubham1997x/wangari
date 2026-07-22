"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { MultiImageUpload } from "./multi-image-upload";
import { inputClass, labelClass } from "./form-classes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  adminCreateProduct,
  adminUpdateProduct,
  type AdminProduct,
  type AdminTaxonomy,
} from "@/app/actions/admin";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  taxonomy,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  taxonomy: AdminTaxonomy;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    blurb: product?.blurb ?? "",
    categoryId: product?.categoryId ?? taxonomy.categories[0]?.id ?? 0,
    subcategoryId: product?.subcategoryId ?? null,
    price: product?.price ?? null,
    priceUnit: product?.priceUnit ?? "piece",
    image: product?.image ?? "",
    images:
      product?.images && product.images.length > 0
        ? product.images
        : product?.image
          ? [product.image]
          : [],
    sortOrder: product?.sortOrder ?? 0,
    isActive: product?.isActive ?? true,
    tagIds: product?.tagIds ?? [],
  }));
  const [slugTouched, setSlugTouched] = useState(product !== null);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const category = taxonomy.categories.find((c) => c.id === form.categoryId);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("Create a category first.");
      return;
    }
    startTransition(async () => {
      try {
        const res = product
          ? await adminUpdateProduct({ ...form, id: product.id })
          : await adminCreateProduct(form);
        if (!res.ok) {
          toast.error(
            res.error === "duplicate_slug" ? "That slug is already taken — pick another." : "Could not save the product."
          );
          return;
        }
        toast.success(product ? "Product updated." : "Product added.");
        onSaved();
        onOpenChange(false);
      } catch {
        toast.error("Could not save the product.");
      }
    });
  };

  const toggleTag = (tagId: number) =>
    set("tagIds", form.tagIds.includes(tagId) ? form.tagIds.filter((id) => id !== tagId) : [...form.tagIds, tagId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-hairline bg-paper text-ink sm:max-w-2xl sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {product ? "Edit product" : "Add product"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-soft">
            Shown on the public catalog the moment you save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={labelClass}>Images</span>
            <MultiImageUpload
              images={form.images}
              featured={form.image}
              onChange={(images, featured) => setForm((f) => ({ ...f, images, image: featured }))}
            />
          </div>
          <div>
            <label htmlFor="pf-name" className={labelClass}>
              Name
            </label>
            <input
              id="pf-name"
              required
              minLength={2}
              className={inputClass}
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label htmlFor="pf-slug" className={labelClass}>
              Slug
            </label>
            <input
              id="pf-slug"
              required
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers and dashes only"
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-blurb" className={labelClass}>
              Blurb
            </label>
            <textarea
              id="pf-blurb"
              rows={2}
              maxLength={300}
              className={inputClass}
              value={form.blurb}
              onChange={(e) => set("blurb", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-category" className={labelClass}>
              Category
            </label>
            <select
              id="pf-category"
              required
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => {
                set("categoryId", Number(e.target.value));
                set("subcategoryId", null);
              }}
            >
              {taxonomy.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-subcategory" className={labelClass}>
              Subcategory
            </label>
            <select
              id="pf-subcategory"
              className={inputClass}
              value={form.subcategoryId ?? ""}
              onChange={(e) => set("subcategoryId", e.target.value ? Number(e.target.value) : null)}
              disabled={!category || category.subcategories.length === 0}
            >
              <option value="">None</option>
              {category?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-price" className={labelClass}>
              Price (&#8377;) <span className="normal-case tracking-normal">— blank = &quot;Ask for price&quot;</span>
            </label>
            <input
              id="pf-price"
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="pf-unit" className={labelClass}>
              Price unit
            </label>
            <select
              id="pf-unit"
              className={inputClass}
              value={form.priceUnit}
              onChange={(e) => set("priceUnit", e.target.value)}
            >
              <option value="piece">piece</option>
              <option value="pair">pair</option>
              <option value="set">set</option>
              <option value="box">box</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>Tags</span>
            {taxonomy.tags.length === 0 ? (
              <p className="text-sm text-ink-soft">No tags yet — add them under Categories &amp; Tags.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {taxonomy.tags.map((t) => {
                  const active = form.tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      aria-pressed={active}
                      className={`rounded-md border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                        active
                          ? "border-ultra bg-tint text-ultra"
                          : "border-hairline bg-surface text-ink-soft hover:border-ultra hover:text-ultra"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="pf-sort" className={labelClass}>
              Sort order
            </label>
            <input
              id="pf-sort"
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </div>
          <div className="flex items-end pb-1.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4 accent-ultra"
              />
              Visible on the site
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ultra px-6 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98] disabled:opacity-60"
            >
              {isPending ? "Saving..." : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
