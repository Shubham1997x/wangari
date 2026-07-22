"use client";

import { useState, type FormEvent } from "react";

import { Dialog, DialogContent } from "./ui/dialog";
import type { CatalogProduct } from "@/lib/catalog";
import { submitProductInquiry } from "@/app/actions/catalog";
import { waLink } from "@/lib/site";

type Status = "idle" | "sending" | "done" | "error";

const inputClass =
  "w-full rounded-full border border-hairline bg-surface px-5 py-3 text-[15px] text-ink outline-none transition focus:border-ultra focus:ring-2 focus:ring-ultra/25";
const textareaClass =
  "w-full rounded-2xl border border-hairline bg-surface px-5 py-3 text-[15px] text-ink outline-none transition focus:border-ultra focus:ring-2 focus:ring-ultra/25";
const labelClass = "mb-1.5 ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft";

function LeafMark() {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-ultra">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M5 19c2-4 5-7 9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function SendInquiryDialog({
  product,
  open,
  onOpenChange,
}: {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");

  const handleOpenChange = (next: boolean) => {
    if (!next) setStatus("idle");
    onOpenChange(next);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await submitProductInquiry({
        productId: product?.id ?? null,
        productName: product?.name ?? "General Inquiry",
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden border-hairline bg-surface p-0 text-ink sm:max-w-md sm:rounded-3xl">
        <div className="relative overflow-hidden bg-plate px-6 pb-6 pt-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-ultra/20 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <LeafMark />
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-paper">Let&apos;s talk</p>
              <p className="mt-0.5 text-[13px] leading-snug text-paper/70">
                {product ? (
                  <>
                    About <span className="font-semibold text-ultra">{product.name}</span>
                  </>
                ) : (
                  "We reply within a working day"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {status === "done" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-ultra">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                  <path d="M5 12.5 10 17 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="font-display text-lg font-bold text-ink">Message sent</p>
              <p className="max-w-[32ch] text-sm leading-relaxed text-ink-soft">
                It&apos;s on our desk. We&apos;ll get back to you within a working day, or reach us
                sooner on WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="mt-1 rounded-full bg-ultra px-6 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inq-name" className={labelClass}>
                    Name
                  </label>
                  <input id="inq-name" name="name" required minLength={2} className={inputClass} autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="inq-phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="inq-phone"
                    name="phone"
                    type="tel"
                    required
                    pattern="[+]?[0-9\s-]{10,15}"
                    className={inputClass}
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="inq-email" className={labelClass}>
                  Email <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input id="inq-email" name="email" type="email" className={inputClass} autoComplete="email" />
              </div>
              <div>
                <label htmlFor="inq-message" className={labelClass}>
                  Message <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="inq-message"
                  name="message"
                  rows={3}
                  maxLength={500}
                  className={textareaClass}
                  placeholder="Quantity, customization, delivery timeline..."
                />
              </div>
              {status === "error" && (
                <p className="rounded-xl bg-tint px-3.5 py-2.5 text-sm font-medium text-ink">
                  That did not go through. Check the details, or message us directly on{" "}
                  <a href={waLink()} target="_blank" rel="noreferrer" className="text-ultra underline">
                    WhatsApp
                  </a>
                  .
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-ultra py-3.5 text-sm font-bold uppercase tracking-wide text-paper transition active:scale-[0.98] disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send message"}
                {status !== "sending" && (
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
