import Link from "next/link";

import type { CatalogProduct } from "@/lib/catalog";
import { productWaLink } from "@/lib/site";
import { useCart } from "@/lib/cart";

export function ProductCard({
  product,
  onInquire,
}: {
  product: CatalogProduct;
  onInquire: (product: CatalogProduct) => void;
}) {
  const { items, addItem } = useCart();
  const inCart = items.some((i) => i.productId === product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_1px_3px_rgba(16,20,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(16,20,43,0.1)]">
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-1 cursor-pointer flex-col text-left"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-tint">
          {product.subcategoryName && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-surface/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ultra shadow-sm backdrop-blur-sm">
              {product.subcategoryName}
            </span>
          )}
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink-soft">
              No image
            </div>
          )}
        </div>
        <div className="flex w-full flex-1 flex-col p-3.5 md:p-4">
          <h3 className="font-body text-[15px] font-semibold leading-snug tracking-tight text-ink line-clamp-2 md:text-base">
            {product.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft line-clamp-1">
            {product.blurb}
          </p>
          {product.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {product.tags.slice(0, 2).map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-tint px-2 py-0.5 text-[11px] font-semibold text-ultra"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-3">
            <p className="text-lg font-bold tabular-nums text-ink">
              {product.price != null ? (
                <>
                  &#8377;{product.price.toLocaleString("en-IN")}
                  <span className="ml-1 text-xs font-medium text-ink-soft">
                    /{product.priceUnit}
                  </span>
                </>
              ) : (
                <span className="text-base font-semibold text-ultra">Ask for price</span>
              )}
            </p>
          </div>
        </div>
      </Link>

      <div className="border-t border-hairline p-3 pt-2.5 md:p-4 md:pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors duration-300 active:scale-[0.98] ${
            inCart
              ? "bg-tint text-ultra hover:brightness-95"
              : "bg-ultra text-paper hover:brightness-110"
          }`}
        >
          {inCart ? (
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path
                d="M1.5 1.5h1.5l1.4 8.4a1 1 0 0 0 1 .83h5.7a1 1 0 0 0 1-.8l1-5.2H4.2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="13.5" r="1" fill="currentColor" />
              <circle cx="11.5" cy="13.5" r="1" fill="currentColor" />
            </svg>
          )}
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>

      <div className="grid grid-cols-2 divide-x divide-hairline border-t border-hairline">
        <a
          href={productWaLink(product.name)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-[12px] font-semibold text-ink-soft transition-colors duration-300 hover:bg-tint hover:text-[#159448]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInquire(product);
          }}
          className="flex items-center justify-center gap-1.5 bg-surface px-2 py-2.5 text-[12px] font-semibold text-ink-soft transition-colors duration-300 hover:bg-tint hover:text-ultra"
        >
          Send Inquiry
        </button>
      </div>
    </article>
  );
}
