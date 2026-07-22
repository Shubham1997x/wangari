import { adminGetTaxonomy } from "@/app/actions/admin";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export default async function AdminTaxonomy() {
  const taxonomy = await adminGetTaxonomy();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tighter text-ink">
        Categories &amp; Tags
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Categories group the catalog, subcategories refine a category, and tags mark what a
        product is for.
      </p>
      <div className="mt-6">
        <TaxonomyManager initialTaxonomy={taxonomy} />
      </div>
    </div>
  );
}
