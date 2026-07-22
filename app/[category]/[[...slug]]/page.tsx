import { notFound } from "next/navigation";

import { getCatalog } from "@/lib/catalog";
import { Nav } from "@/components/nav";
import { CatalogPage } from "@/components/catalog-page";
import { Footer } from "@/components/footer";
import { StickyBar } from "@/components/sticky-bar";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string; slug?: string[] }>;
}) {
  const { category: categorySlug, slug = [] } = await params;
  const data = await getCatalog();

  const category = data.categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const [subcategorySlug] = slug;

  const subcategory = subcategorySlug
    ? category.subcategories.find((s) => s.slug === subcategorySlug)
    : undefined;
  if (subcategorySlug && !subcategory) notFound();

  return (
    <>
      <Nav />
      <main>
        <CatalogPage
          key={`${categorySlug}/${subcategorySlug ?? ""}`}
          initialData={data}
          navigable
          initialCategoryId={category.id}
          initialSubcategoryId={subcategory?.id ?? null}
        />
      </main>
      <Footer />
      <StickyBar />
      <FloatingWhatsapp />
      <Toaster />
    </>
  );
}
