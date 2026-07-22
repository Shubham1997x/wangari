import { prisma } from "@/lib/db";

export type CatalogSubcategory = {
  id: number;
  name: string;
  slug: string;
};

export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  subcategories: CatalogSubcategory[];
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  description: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  price: number | null;
  priceUnit: string;
  image: string;
  images: string[];
  tags: string[];
};

export type CatalogData = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
};

export async function getCatalog(): Promise<CatalogData> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
  ]);

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image ?? products.find((p) => p.categoryId === c.id && p.image)?.image ?? null,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
      })),
    })),
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      blurb: p.blurb,
      description: p.description,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      subcategoryId: p.subcategoryId,
      subcategoryName: p.subcategory?.name ?? null,
      subcategorySlug: p.subcategory?.slug ?? null,
      price: p.price,
      priceUnit: p.priceUnit,
      image: p.image,
      images: p.images.map((img) => img.url),
      tags: p.tags.map((t) => t.tag.name),
    })),
  };
}
