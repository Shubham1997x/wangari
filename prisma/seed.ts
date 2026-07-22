import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SeedProduct = {
  slug: string;
  name: string;
  blurb: string;
  category: string;
  subcategory: string | null;
  price: number | null;
  image: string;
  images: string[];
  tags: string[];
};

type SeedData = {
  categories: Array<{ name: string; subcategories: string[] }>;
  products: SeedProduct[];
};

async function main() {
  const raw = await readFile(path.join(__dirname, "seed-data.json"), "utf-8");
  const data: SeedData = JSON.parse(raw);

  console.log("Clearing existing data...");
  await prisma.productTag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creating categories & subcategories...");
  const categoryMap = new Map<string, number>();
  const subcategoryMap = new Map<string, number>(); // key: `${categoryName}::${subName}`

  for (const [ci, cat] of data.categories.entries()) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: slugify(cat.name), sortOrder: ci },
    });
    categoryMap.set(cat.name, category.id);

    for (const [si, subName] of cat.subcategories.entries()) {
      const sub = await prisma.subcategory.create({
        data: { name: subName, slug: slugify(`${cat.name}-${subName}`), categoryId: category.id, sortOrder: si },
      });
      subcategoryMap.set(`${cat.name}::${subName}`, sub.id);
    }
  }

  console.log("Creating tags...");
  const allTagNames = Array.from(new Set(data.products.flatMap((p) => p.tags)));
  const tagMap = new Map<string, number>();
  for (const name of allTagNames) {
    const tag = await prisma.tag.create({ data: { name, slug: slugify(name) } });
    tagMap.set(name, tag.id);
  }

  console.log("Creating products...");
  for (const [index, p] of data.products.entries()) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) throw new Error(`Unknown category: ${p.category}`);
    const subcategoryId = p.subcategory ? subcategoryMap.get(`${p.category}::${p.subcategory}`) : undefined;

    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        blurb: p.blurb,
        description: p.blurb,
        categoryId,
        subcategoryId,
        price: p.price,
        priceUnit: "piece",
        image: p.image,
        sortOrder: index,
        isActive: true,
        images: p.images.length > 0 ? { create: p.images.map((url, i) => ({ url, sortOrder: i })) } : undefined,
        tags: {
          create: p.tags
            .map((t) => tagMap.get(t))
            .filter((id): id is number => id !== undefined)
            .map((tagId) => ({ tagId })),
        },
      },
    });
  }

  console.log(`Seeded ${data.products.length} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
