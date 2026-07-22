"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/app/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setStatus("sending");
    try {
      const res = await login(password);
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <label
        htmlFor="admin-password"
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft"
      >
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="w-full rounded-lg border border-hairline bg-paper px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-ultra focus:ring-2 focus:ring-ultra/25"
      />
      {status === "error" && (
        <p className="mt-2 text-sm font-medium text-ink">Wrong password. Try again.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-lg bg-ultra py-3 text-[15px] font-semibold text-paper transition active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending" ? "Checking..." : "Log in"}
      </button>
    </form>
  );
}
