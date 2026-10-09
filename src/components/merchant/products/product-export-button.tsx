"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { downloadProductsCsv } from "@/lib/merchant/products/csv";

interface ProductExportButtonProps {
  visibleProductIds: string[];
}

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

export function ProductExportButton({
  visibleProductIds,
}: ProductExportButtonProps) {
  const { getProductsForStore } = useStoreProducts();
  const { storefrontConfig } = useStorefrontConfig();

  const slug = storefrontConfig.slug || "my-store";

  function handleExport() {
    if (visibleProductIds.length === 0) return;
    const products = getProductsForStore(slug);
    const idSet = new Set(visibleProductIds);
    const visible = products.filter((p) => idSet.has(p.id));
    const filename =
      "atlas-products-" + slug + "-" + todayStamp() + ".csv";
    downloadProductsCsv(visible, filename);
  }

  const disabled = visibleProductIds.length === 0;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      aria-label="Export visible products as CSV"
    >
      <AtlasIcon name="download" className="h-4 w-4" aria-hidden="true" />
      Export view
    </button>
  );
}