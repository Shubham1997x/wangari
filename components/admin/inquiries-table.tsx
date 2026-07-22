"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { adminDeleteInquiry, adminMarkInquiryRead, type ProductInquiry } from "@/app/actions/admin";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function InquiriesTable({ initialData }: { initialData: { inquiries: ProductInquiry[] } }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const invalidate = () => startTransition(() => router.refresh());

  const markRead = async (id: number, read: boolean) => {
    setPendingId(id);
    try {
      await adminMarkInquiryRead({ id, read });
      invalidate();
    } catch {
      toast.error("Could not update the inquiry.");
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (id: number) => {
    setPendingId(id);
    try {
      await adminDeleteInquiry({ id });
      toast.success("Inquiry deleted.");
      invalidate();
    } catch {
      toast.error("Could not delete the inquiry.");
    } finally {
      setPendingId(null);
    }
  };

  const rows = initialData.inquiries;
  const unread = rows.filter((r) => !r.isRead).length;

  return (
    <div>
      <p className="text-sm font-semibold text-ink-soft">
        {rows.length} total{unread ? ` — ${unread} new` : ""}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-hairline bg-surface shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {["From", "Product", "Contact", "Message", "Received", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((r) => (
              <tr key={r.id} className={r.isRead ? "text-ink-soft" : "bg-tint/30"}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    {!r.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-ultra" aria-label="Unread" />}
                    <span className={r.isRead ? "" : "font-semibold text-ink"}>{r.name}</span>
                  </span>
                </td>
                <td className="px-4 py-3">{r.productName || "—"}</td>
                <td className="px-4 py-3">
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="block text-ultra hover:underline">
                      {r.email}
                    </a>
                  )}
                  <a href={`tel:${r.phone}`} className="tabular-nums hover:underline">
                    {r.phone}
                  </a>
                </td>
                <td className="max-w-[26ch] px-4 py-3">
                  <span className="line-clamp-3 whitespace-pre-line">{r.message || "—"}</span>
                </td>
                <td className="px-4 py-3 tabular-nums">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={pendingId === r.id}
                      onClick={() => markRead(r.id, !r.isRead)}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra disabled:opacity-60"
                    >
                      {r.isRead ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === r.id}
                      onClick={() => remove(r.id)}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                  No inquiries yet. They land here the moment someone sends one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
