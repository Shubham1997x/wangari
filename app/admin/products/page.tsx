import { adminGetTaxonomy, adminListProducts } from "@/app/actions/admin";
import { ProductsClient } from "./ProductsClient";

export default async function AdminProducts() {
  const [products, taxonomy] = await Promise.all([adminListProducts(), adminGetTaxonomy()]);

  return <ProductsClient initialProducts={products} taxonomy={taxonomy} />;
}
