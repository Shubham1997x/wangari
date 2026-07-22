"use server";

import { z } from "zod";

import { createSession, destroySession, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({ password: z.string().min(1, "Enter the password") });

export async function login(password: string) {
  const parsed = loginSchema.safeParse({ password });
  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    return { ok: false as const, error: "invalid_password" };
  }
  await createSession();
  return { ok: true as const };
}

export async function logout() {
  await destroySession();
}
