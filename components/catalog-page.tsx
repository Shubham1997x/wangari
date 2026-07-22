"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ProductCard } from "./product-card";
import { SendInquiryDialog } from "./send-inquiry-dialog";
import type { CatalogData, CatalogProduct } from "@/lib/catalog";

const pillClass = (active: boolean) =>
  `rounded-lg border px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
    active
      ? "border-ultra bg-ultra text-paper"
      : "border-hairline bg-surface text-ink-soft hover:border-ultra hover:text-ultra"
  }`;

const subPillClass = (active: boolean) =>
  `rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors active:scale-[0.98] ${
    active
      ? "border-ultra bg-tint text-ultra"
      : "border-hairline bg-surface text-ink-soft hover:border-ultra hover:text-ultra"
  }`;

export function CatalogPage({
  initialData,
  navigable = false,
  initialCategoryId = null,
  initialSubcategoryId = null,
}: {
  initialData: CatalogData;
  /** When true, category/subcategory selection navigates to shareable nested URLs (/:category/:subcategory) instead of staying client-side only. */
  navigable?: boolean;
  initialCategoryId?: number | null;
  initialSubcategoryId?: number | null;
}) {
  const data = initialData;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(initialSubcategoryId);
  const [inquiryProduct, setInquiryProduct] = useState<CatalogProduct | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const activeCategory = data.categories.find((c) => c.id === categoryId);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      if (categoryId !== null && p.categoryId !== categoryId) return false;
      if (subcategoryId !== null && p.subcategoryId !== subcategoryId) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.blurb} ${p.categoryName} ${
        p.subcategoryName ?? ""
      } ${p.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [data.products, query, categoryId, subcategoryId]);

  const selectCategory = (id: number | null) => {
    setCategoryId(id);
    setSubcategoryId(null);
    if (!navigable) return;
    const category = id !== null ? data.categories.find((c) => c.id === id) : undefined;
    router.push(category ? `/${category.slug}` : "/");
  };

  const selectSubcategory = (id: number | null) => {
    setSubcategoryId(id);
    if (!navigable || !activeCategory) return;
    const subcategory = id !== null ? activeCategory.subcategories.find((s) => s.id === id) : undefined;
    router.push(subcategory ? `/${activeCategory.slug}/${subcategory.slug}` : `/${activeCategory.slug}`);
  };

  const openInquiry = (product: CatalogProduct) => {
    setInquiryProduct(product);
    setInquiryOpen(true);
  };

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 pb-12 pt-36 md:px-8 md:pb-16 md:pt-40">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full shrink-0 md:mr-2 md:w-80 lg:w-96">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chargers, power banks, earbuds..."
            aria-label="Search products"
            className="w-full rounded-xl border border-hairline bg-surface py-3.5 pl-12 pr-4 text-[15px] text-ink shadow-[0_1px_3px_rgba(16,20,43,0.05)] outline-none transition focus:border-ultra focus:ring-2 focus:ring-ultra/25"
          />
        </div>

        <button
          onClick={() => selectCategory(null)}
          aria-pressed={categoryId === null}
          className={pillClass(categoryId === null)}
        >
          All
        </button>
        {data.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.id)}
            aria-pressed={categoryId === c.id}
            className={pillClass(categoryId === c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {activeCategory.name}:
          </span>
          <button
            onClick={() => selectSubcategory(null)}
            aria-pressed={subcategoryId === null}
            className={subPillClass(subcategoryId === null)}
          >
            All
          </button>
          {activeCategory.subcategories.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSubcategory(s.id)}
              aria-pressed={subcategoryId === s.id}
              className={subPillClass(subcategoryId === s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:mt-10 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onInquire={openInquiry} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
          <p className="font-display text-xl font-bold tracking-tight text-ink">
            Nothing matches that
          </p>
          <p className="mx-auto mt-2 max-w-[40ch] text-sm leading-relaxed text-ink-soft">
            Try a different word, or clear the filters. If you need something
            specific, message us on WhatsApp — we&apos;ll help you find it.
          </p>
          <button
            onClick={() => {
              setQuery("");
              selectCategory(null);
            }}
            className="mt-5 rounded-lg border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
          >
            Clear search & filters
          </button>
        </div>
      )}

      <SendInquiryDialog product={inquiryProduct} open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </section>
  );
}
