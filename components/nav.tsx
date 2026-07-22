"use client";

import Link from "next/link";
import { useState } from "react";
import { SendInquiryDialog } from "./send-inquiry-dialog";
import { CartDrawer } from "./cart-drawer";

import { waLink, telLink } from "@/lib/site";
import { useCart } from "@/lib/cart";

const LINKS = [
  { href: "#catalog", label: "Catalog" },
  { href: waLink(), label: "WhatsApp" },
  { href: telLink(), label: "Call us" },
];

function GetQuoteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-paper shadow-sm transition-all hover:brightness-110 active:scale-[0.97] md:px-5"
      >
        Get a Quote
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <SendInquiryDialog product={null} open={open} onOpenChange={setOpen} />
    </>
  );
}

function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
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
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ultra px-1 text-[10px] font-bold tabular-nums text-paper">
            {count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/#top" className="flex shrink-0 items-center gap-2">
          <img src="/logo.png" alt="Wangari" className="h-16 w-auto object-contain md:h-20" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
              className="relative text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-ultra after:transition-all after:duration-200 hover:text-ultra hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={telLink()}
            className="hidden items-center gap-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ultra sm:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <CartButton />
          <GetQuoteButton />
        </div>
      </div>
    </header>
  );
}
