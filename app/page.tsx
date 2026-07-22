import { getCatalog } from "@/lib/catalog";
import { Nav } from "@/components/nav";
import { CatalogHero } from "@/components/catalog-hero";
import { CategoryTiles } from "@/components/category-tiles";
import { Footer } from "@/components/footer";
import { StickyBar } from "@/components/sticky-bar";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getCatalog();

  return (
    <>
      <Nav />
      <main>
        <CatalogHero />
        <CategoryTiles categories={data.categories} />
      </main>
      <Footer />
      <StickyBar />
      <FloatingWhatsapp />
      <Toaster />
    </>
  );
}
