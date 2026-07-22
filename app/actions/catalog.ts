"use server";

import { prisma } from "@/lib/db";

export async function submitProductInquiry(input: {
  productId: number | null;
  productName: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}) {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (name.length < 2 || phone.length < 10) {
    return { ok: false as const, error: "Please provide a valid name and phone number." };
  }

  try {
    await prisma.productEnquiry.create({
      data: {
        name,
        phone,
        email: input.email.trim(),
        message: input.message.trim(),
        productId: input.productId,
        productName: input.productName,
      },
    });
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Something went wrong. Please try again." };
  }
}
