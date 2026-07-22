"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

// ── Products ────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  categoryId: number;
  categoryName: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  price: number | null;
  priceUnit: string;
  image: string;
  images: string[];
  sortOrder: number;
  isActive: boolean;
  tagIds: number[];
}

export async function adminListProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      tags: { select: { tagId: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    blurb: p.blurb,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    subcategoryId: p.subcategoryId,
    subcategoryName: p.subcategory?.name ?? null,
    price: p.price,
    priceUnit: p.priceUnit,
    image: p.image,
    images: p.images.map((pi) => pi.url),
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    tagIds: p.tags.map((pt) => pt.tagId),
  }));
}

const productInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  name: z.string().trim().min(2).max(160),
  blurb: z.string().trim().max(300).optional().default(""),
  categoryId: z.number().int().positive(),
  subcategoryId: z.number().int().positive().nullable().optional().default(null),
  price: z.number().min(0).nullable().optional().default(null),
  priceUnit: z.string().trim().min(1).max(20).default("piece"),
  image: z.string().trim().max(300).optional().default(""),
  images: z.array(z.string().trim().min(1).max(300)).max(12).optional().default([]),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  tagIds: z.array(z.number().int().positive()).optional().default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

async function resolveSubcategory(
  categoryId: number,
  subcategoryId: number | null
): Promise<number | null> {
  if (!subcategoryId) return null;
  const row = await prisma.subcategory.findFirst({
    where: { id: subcategoryId, categoryId },
    select: { id: true },
  });
  return row ? subcategoryId : null;
}

async function writeProductTags(productId: number, tagIds: number[]): Promise<void> {
  await prisma.productTag.deleteMany({ where: { productId } });
  if (tagIds.length === 0) return;
  await prisma.productTag.createMany({
    data: tagIds.map((tagId) => ({ productId, tagId })),
  });
}

async function writeProductImages(productId: number, urls: string[]): Promise<void> {
  await prisma.productImage.deleteMany({ where: { productId } });
  if (urls.length === 0) return;
  await prisma.productImage.createMany({
    data: urls.map((url, i) => ({ productId, url, sortOrder: i })),
  });
}

function normalizeImages(image: string, images: string[]): { image: string; images: string[] } {
  const deduped = [...new Set(images)];
  if (image && !deduped.includes(image)) return { image, images: [image, ...deduped] };
  if (!image && deduped.length > 0) return { image: deduped[0], images: deduped };
  return { image, images: deduped };
}

async function unlinkUploads(urls: string[]): Promise<void> {
  await Promise.all(
    urls
      .filter((url) => url.startsWith("/uploads/"))
      .map((url) => fs.unlink(path.join(process.cwd(), "public", url)).catch(() => {}))
  );
}

export async function adminCreateProduct(input: ProductInput) {
  await requireAdmin();
  const data = productInputSchema.parse(input);
  const subcategoryId = await resolveSubcategory(data.categoryId, data.subcategoryId);
  const { image, images } = normalizeImages(data.image, data.images);
  try {
    const product = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        blurb: data.blurb,
        description: data.blurb,
        categoryId: data.categoryId,
        subcategoryId,
        price: data.price,
        priceUnit: data.priceUnit,
        image,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
    await writeProductTags(product.id, data.tagIds);
    await writeProductImages(product.id, images);
    return { ok: true as const, id: product.id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false as const, error: "duplicate_slug" };
    }
    console.error("CREATE PRODUCT ERROR", err);
    throw err;
  }
}

export async function adminUpdateProduct(input: ProductInput & { id: number }) {
  await requireAdmin();
  const data = productInputSchema.extend({ id: z.number().int().positive() }).parse(input);
  const subcategoryId = await resolveSubcategory(data.categoryId, data.subcategoryId);
  const { image, images } = normalizeImages(data.image, data.images);
  const previous = await prisma.product.findUnique({
    where: { id: data.id },
    select: { image: true, images: { select: { url: true } } },
  });
  try {
    await prisma.product.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        name: data.name,
        blurb: data.blurb,
        description: data.blurb,
        categoryId: data.categoryId,
        subcategoryId,
        price: data.price,
        priceUnit: data.priceUnit,
        image,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
    await writeProductTags(data.id, data.tagIds);
    await writeProductImages(data.id, images);
    if (previous) {
      const kept = new Set([image, ...images]);
      const removed = [previous.image, ...previous.images.map((pi) => pi.url)].filter(
        (url) => url && !kept.has(url)
      );
      await unlinkUploads(removed);
    }
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false as const, error: "duplicate_slug" };
    }
    throw err;
  }
}

export async function adminDeleteProduct(id: number) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, images: { select: { url: true } } },
  });
  await prisma.productTag.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  if (product) {
    await unlinkUploads([...new Set([product.image, ...product.images.map((pi) => pi.url)])]);
  }
  return { ok: true as const };
}

export interface ReorderableProduct {
  id: number;
  name: string;
  image: string;
  sortOrder: number;
}

export async function adminListProductsByCategory(categoryId: number): Promise<ReorderableProduct[]> {
  await requireAdmin();
  const products = await prisma.product.findMany({
    where: { categoryId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, name: true, image: true, sortOrder: true },
  });
  return products;
}

export async function adminReorderProducts(input: { categoryId: number; orderedProductIds: number[] }) {
  await requireAdmin();
  const data = z
    .object({
      categoryId: z.number().int().positive(),
      orderedProductIds: z.array(z.number().int().positive()),
    })
    .parse(input);
  await prisma.$transaction(
    data.orderedProductIds.map((id, index) =>
      prisma.product.update({
        where: { id, categoryId: data.categoryId },
        data: { sortOrder: index },
      })
    )
  );
  return { ok: true as const };
}

// ── Taxonomy ────────────────────────────────────────────────────────────────

export interface AdminTaxonomy {
  categories: Array<{
    id: number;
    name: string;
    image: string | null;
    productCount: number;
    subcategories: Array<{ id: number; name: string; productCount: number }>;
  }>;
  tags: Array<{ id: number; name: string; productCount: number }>;
}

export async function adminGetTaxonomy(): Promise<AdminTaxonomy> {
  await requireAdmin();
  const [categories, subcategories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    prisma.subcategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);
  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
      productCount: c._count.products,
      subcategories: subcategories
        .filter((s) => s.categoryId === c.id)
        .map((s) => ({ id: s.id, name: s.name, productCount: s._count.products })),
    })),
    tags: tags.map((t) => ({ id: t.id, name: t.name, productCount: t._count.products })),
  };
}

const nameSchema = z.object({ name: z.string().trim().min(2).max(80) });
const idSchema = z.object({ id: z.number().int().positive() });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function adminCreateCategory(input: { name: string }) {
  await requireAdmin();
  const data = nameSchema.parse(input);
  try {
    const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
    await prisma.category.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminRenameCategory(input: { id: number; name: string }) {
  await requireAdmin();
  const data = idSchema.merge(nameSchema).parse(input);
  try {
    await prisma.category.update({
      where: { id: data.id },
      data: { name: data.name, slug: slugify(data.name) },
    });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminSetCategoryImage(input: { id: number; image: string | null }) {
  await requireAdmin();
  const data = idSchema.extend({ image: z.string().trim().max(300).nullable() }).parse(input);
  await prisma.category.update({ where: { id: data.id }, data: { image: data.image } });
  return { ok: true as const };
}

export async function adminDeleteCategory(input: { id: number }) {
  await requireAdmin();
  const data = idSchema.parse(input);
  const inUse = await prisma.product.count({ where: { categoryId: data.id } });
  if (inUse > 0) return { ok: false as const, error: "in_use" };
  await prisma.subcategory.deleteMany({ where: { categoryId: data.id } });
  await prisma.category.delete({ where: { id: data.id } });
  return { ok: true as const };
}

export async function adminCreateSubcategory(input: { name: string; categoryId: number }) {
  await requireAdmin();
  const data = nameSchema.extend({ categoryId: z.number().int().positive() }).parse(input);
  try {
    const max = await prisma.subcategory.aggregate({
      where: { categoryId: data.categoryId },
      _max: { sortOrder: true },
    });
    await prisma.subcategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: slugify(data.name),
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminRenameSubcategory(input: { id: number; name: string }) {
  await requireAdmin();
  const data = idSchema.merge(nameSchema).parse(input);
  try {
    await prisma.subcategory.update({
      where: { id: data.id },
      data: { name: data.name, slug: slugify(data.name) },
    });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminDeleteSubcategory(input: { id: number }) {
  await requireAdmin();
  const data = idSchema.parse(input);
  const inUse = await prisma.product.count({ where: { subcategoryId: data.id } });
  if (inUse > 0) return { ok: false as const, error: "in_use" };
  await prisma.subcategory.delete({ where: { id: data.id } });
  return { ok: true as const };
}

export async function adminCreateTag(input: { name: string }) {
  await requireAdmin();
  const data = nameSchema.parse(input);
  try {
    await prisma.tag.create({ data: { name: data.name, slug: slugify(data.name) } });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminRenameTag(input: { id: number; name: string }) {
  await requireAdmin();
  const data = idSchema.merge(nameSchema).parse(input);
  try {
    await prisma.tag.update({
      where: { id: data.id },
      data: { name: data.name, slug: slugify(data.name) },
    });
    return { ok: true as const };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false as const, error: "duplicate" };
    throw err;
  }
}

export async function adminDeleteTag(input: { id: number }) {
  await requireAdmin();
  const data = idSchema.parse(input);
  await prisma.productTag.deleteMany({ where: { tagId: data.id } });
  await prisma.tag.delete({ where: { id: data.id } });
  return { ok: true as const };
}

// ── Inquiries ───────────────────────────────────────────────────────────────

export interface ProductInquiry {
  id: number;
  productId: number | null;
  productName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function adminListInquiries(): Promise<{ inquiries: ProductInquiry[] }> {
  await requireAdmin();
  const inquiries = await prisma.productEnquiry.findMany({
    where: { isDeleted: false },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return {
    inquiries: inquiries.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      isRead: r.isRead,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function adminMarkInquiryRead(input: { id: number; read: boolean }) {
  await requireAdmin();
  const data = idSchema.extend({ read: z.boolean() }).parse(input);
  await prisma.productEnquiry.update({
    where: { id: data.id },
    data: { isRead: data.read },
  });
  return { ok: true as const };
}

export async function adminDeleteInquiry(input: { id: number }) {
  await requireAdmin();
  const data = idSchema.parse(input);
  await prisma.productEnquiry.update({ where: { id: data.id }, data: { isDeleted: true } });
  return { ok: true as const };
}
