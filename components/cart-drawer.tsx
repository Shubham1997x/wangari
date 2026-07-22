"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useCart } from "@/lib/cart";
import { buildBulkWaLink } from "@/lib/site";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, setQty, removeItem, clear } = useCart();

  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const hasUnpriced = items.some((i) => i.price == null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-hairline bg-paper p-0 text-ink sm:max-w-md">
        <DialogHeader className="border-b border-hairline p-5">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
            Your quote cart
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink">Your cart is empty</p>
            <p className="mt-2 text-sm text-ink-soft">
              Add products you&apos;re interested in, then send them all as one bulk quote
              request on WhatsApp.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-hairline overflow-y-auto">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="aspect-square w-14 shrink-0 overflow-hidden rounded-md border border-hairline bg-tint">
                    {item.image && (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink-soft">
                      {item.price != null ? (
                        <>
                          &#8377;{item.price.toLocaleString("en-IN")}/{item.priceUnit}
                        </>
                      ) : (
                        "Ask for price"
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums text-ink">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-tint hover:text-red-500"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M3 4h10M6.5 4V2.8a.8.8 0 0 1 .8-.8h1.4a.8.8 0 0 1 .8.8V4M4.5 4l.6 8.4a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9L12 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-hairline p-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-ink-soft">Estimated total</span>
                <span className="text-lg font-bold tabular-nums text-ink">
                  &#8377;{total.toLocaleString("en-IN")}
                  {hasUnpriced && <span className="ml-1 text-xs font-medium text-ink-soft">+ ask</span>}
                </span>
              </div>

              <a
                href={buildBulkWaLink(items)}
                target="_blank"
                rel="noreferrer"
                onClick={() => onOpenChange(false)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#1ebe5a] active:bg-[#159448]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send Quote on WhatsApp
              </a>
              <button
                type="button"
                onClick={clear}
                className="mt-2 w-full rounded-lg border border-hairline px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
