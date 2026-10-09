"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { MerchantProductRow } from "@/lib/merchant/products/types";
import { PRODUCT_STATUS_LABELS } from "@/lib/merchant/products/labels";
import { StockBadge } from "./stock-badge";
import { ProductSelectCheckbox } from "./product-select-checkbox";

interface ProductCardProps {
  product: MerchantProductRow;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: (product: MerchantProductRow) => void;
}

function statusDotClass(status: MerchantProductRow["status"]): string {
  if (status === "Active") return "bg-success-500";
  if (status === "Draft") return "bg-warning-500";
  return "bg-neutral-400";
}

export function ProductCard({
  product,
  selected,
  onToggleSelect,
  onDelete,
}: ProductCardProps) {
  const hasSale =
    product.salePrice !== null && product.salePrice < product.price;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 dark:bg-neutral-900",
        selected
          ? "border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-900/10"
          : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <ProductSelectCheckbox
            checked={selected}
            onChange={onToggleSelect}
            label={"Select " + product.name}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {selected ? "Selected" : "Select"}
          </span>
        </span>
      </div>

      <Link
        href={"/merchant/products/" + product.id}
        className="flex items-start gap-3"
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {product.primaryImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.primaryImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <AtlasIcon
              name="package"
              className="h-6 w-6 text-neutral-400"
              aria-hidden="true"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {product.name}
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {product.categoryName}
          </span>
          {product.sku && (
            <span className="mt-0.5 block text-xs text-neutral-400 dark:text-neutral-500">
              {product.sku}
            </span>
          )}
          <span className="mt-2 flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="text-xs text-neutral-400 line-through">
                  {"GH\u20B5 "}
                  {product.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-danger-600 dark:text-danger-400">
                  {"GH\u20B5 "}
                  {product.effectivePrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {"GH\u20B5 "}
                {product.price.toFixed(2)}
              </span>
            )}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1.5">
          <StockBadge
            stockLevel={product.stockLevel}
            inStock={product.inStock}
          />
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                statusDotClass(product.status)
              )}
              aria-hidden="true"
            />
            {PRODUCT_STATUS_LABELS[product.status]}
          </span>
        </span>
      </Link>

      <div className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <Link
          href={"/merchant/products/" + product.id}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="edit" className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-danger-50 hover:text-danger-700 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
        >
          <AtlasIcon name="trash" className="h-3.5 w-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>
    </div>
  );
}