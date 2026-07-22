import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCatalog } from "@/lib/catalog";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { StickyBar } from "@/components/sticky-bar";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { Toaster } from "@/components/ui/sonner";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const data = await getCatalog();
  return data.products.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — Wangari`,
    description: product.blurb || product.description,
    openGraph: {
      title: product.name,
      description: product.blurb || product.description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <Nav />
      <main>
        <ProductDetail product={product} />
      </main>
      <Footer />
      <StickyBar />
      <FloatingWhatsapp />
      <Toaster />
    </>
  );
}
