import Link from "next/link";
import Image from "next/image";
import type { CatalogCategory } from "@/lib/catalog";

const STOCK_IMAGE_BY_SLUG: Record<string, string> = {
  "wireless-chargers": "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=800&q=80",
  "power-banks": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
  earbuds: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
  "charging-stations": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
  "sustainable-hampers": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
  "corporate-gifting": "https://images.unsplash.com/photo-1513885535751-8b9238bd345d?auto=format&fit=crop&w=800&q=80",
};
const FALLBACK_IMAGE = STOCK_IMAGE_BY_SLUG["wireless-chargers"];

export function CategoryTiles({ categories }: { categories: CatalogCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ultra">
            Shop by category
          </span>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            Find your gadget
          </h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/${c.slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border border-hairline bg-plate shadow-[0_1px_3px_rgba(16,20,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(26,51,32,0.25)]"
          >
            <div className="absolute inset-0">
              <Image
                src={c.image ?? STOCK_IMAGE_BY_SLUG[c.slug] ?? FALLBACK_IMAGE}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-plate/90 via-plate/20 to-transparent" />
            </div>

            <div className="relative flex flex-col items-start gap-2 p-4 md:p-5">
              <span className="font-display text-lg font-bold tracking-tight text-paper md:text-xl">
                {c.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-paper/80 transition-colors group-hover:text-ultra">
                Shop now
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
