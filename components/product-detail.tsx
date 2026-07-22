"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import type { CatalogProduct } from "@/lib/catalog";
import { productWaLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { SendInquiryDialog } from "./send-inquiry-dialog";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const { items, addItem } = useCart();
  const inCart = items.some((i) => i.productId === product.id);
  const images = product.images.length > 0 ? product.images : [product.image];
  const [active, setActive] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const overlayBtn =
    "flex items-center justify-center rounded-full bg-paper/90 text-ink shadow-[0_1px_3px_rgba(16,20,43,0.2)] transition-colors hover:bg-ultra hover:text-paper";

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-8 md:pt-40">
      <Link
        href={`/${product.categorySlug}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ultra"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
          <path d="M14 8H3M7 3.5 2.5 8 7 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to {product.categoryName}
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <div className="relative overflow-hidden rounded-2xl border border-hairline bg-tint">
          <div className="aspect-square">
            {images[active] ? (
              <img
                src={images[active]}
                alt={`${product.name} — image ${active + 1} of ${images.length}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-soft">No image</div>
            )}
          </div>

          <button
            type="button"
            onClick={share}
            aria-label="Share this product"
            className={`${overlayBtn} absolute right-3.5 top-3.5 h-9 w-9`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="5.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="18.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8.4 10.8 15 6.9m-6.6 6.3 6.6 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className={`${overlayBtn} absolute left-3.5 top-1/2 h-10 w-10 -translate-y-1/2`}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className={`${overlayBtn} absolute right-3.5 top-1/2 h-10 w-10 -translate-y-1/2`}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col">
          {images.length > 1 && (
            <div className="mb-5 flex gap-2 md:order-last md:mb-0 md:mt-5">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1} of ${images.length}`}
                  aria-pressed={i === active}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                    i === active ? "border-ultra" : "border-hairline hover:border-ultra/50"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.subcategoryName && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ultra">
              {product.subcategoryName}
            </span>
          )}
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            {product.description || product.blurb}
          </p>

          {product.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-tint px-2.5 py-1 text-[12px] font-semibold text-ultra">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-2xl font-bold tabular-nums text-ink">
            {product.price != null ? (
              <>
                &#8377;{product.price.toLocaleString("en-IN")}{" "}
                <span className="text-sm font-medium text-ink-soft">/{product.priceUnit}</span>
              </>
            ) : (
              <span className="text-ultra">Ask for price</span>
            )}
          </p>

          <button
            type="button"
            onClick={() => addItem(product)}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-semibold transition-colors duration-300 active:scale-[0.98] ${
              inCart ? "bg-tint text-ultra hover:brightness-95" : "bg-ultra text-paper hover:brightness-110"
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

          <div className="mt-3 grid grid-cols-2 gap-3">
            <a
              href={productWaLink(product.name)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#1ebe5a] active:bg-[#159448]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setInquiryOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-tint hover:text-ultra"
            >
              Send Inquiry
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <SendInquiryDialog product={product} open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </section>
  );
}
