"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/app/actions/auth";

const NAV = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/taxonomy", label: "Categories & Tags" },
  { to: "/admin/inquiries", label: "Inquiries" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2 md:h-14 md:flex-nowrap md:py-0 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.png" alt="Wangari" className="h-7 w-auto object-contain" />
            <span className="rounded-md bg-tint px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ultra">
              Admin
            </span>
          </Link>
          <nav className="-mx-5 flex w-full items-center gap-1 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:w-auto sm:px-0 sm:pb-0 md:gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  pathname === item.to ? "bg-ultra text-paper" : "text-ink-soft hover:text-ultra"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="ml-2 shrink-0 whitespace-nowrap rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
            >
              View website
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 whitespace-nowrap rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ultra hover:text-ultra"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
