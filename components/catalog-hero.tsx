import { waLink } from "@/lib/site";

const HERO_IMAGE = "/uploads/aspen-10000mah-power-bank-2.jpg";

export function CatalogHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-plate">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-plate/95 via-plate/80 to-plate/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-plate/70 via-transparent to-plate/20" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,var(--color-gold)_0,var(--color-gold)_10px,transparent_10px,transparent_20px)] opacity-70"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-32 md:px-8 md:pb-10 md:pt-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-ultra/40 bg-ultra/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ultra">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <circle cx="8" cy="8" r="7" />
          </svg>
          Wangari Catalog
        </span>

        <h1 className="mt-3 max-w-[20ch] font-display text-2xl font-extrabold leading-[1.08] tracking-tight text-paper md:text-4xl">
          Your Daily Gadgets, <span className="text-ultra">Reinvented</span> in Resonance with Mother Earth.
        </h1>

        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-paper/75 md:text-base">
          Bamboo wireless chargers, power banks, and earbuds — thoughtful picks and
          sustainable choices. Browse by category and get the best price on WhatsApp.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 rounded-lg bg-ultra px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-plate transition-transform active:scale-[0.98] hover:brightness-110"
          >
            Browse Catalog
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-paper/25 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:border-ultra hover:text-ultra"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
