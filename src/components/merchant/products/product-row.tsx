"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { MerchantProductRow } from "@/lib/merchant/products/types";
import { PRODUCT_STATUS_LABELS } from "@/lib/merchant/products/labels";
import { StockBadge } from "./stock-badge";

interface ProductRowProps {
  product: MerchantProductRow;
  onDelete: (product: MerchantProductRow) => void;
}

function statusDotClass(status: MerchantProductRow["status"]): string {
  if (status === "Active") return "bg-success-500";
  if (status === "Draft") return "bg-warning-500";
  return "bg-neutral-400";
}

export function ProductRow({ product, onDelete }: ProductRowProps) {
  return (
    <tr className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
      <td className="px-5 py-4">
        <Link
          href={"/merchant/products/" + product.id}
          className="flex items-center gap-3"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
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
                className="h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {product.name}
            </span>
            {product.featured && (
              <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                Featured
              </span>
            )}
          </span>
        </Link>
      </td>

      <td className="px-5 py-4 text-sm text-neutral-500 dark:text-neutral-400">
        {product.sku || "\u2014"}
      </td>

      <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
        {product.categoryName}
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-col">
          {product.salePrice !== null &&
          product.salePrice < product.price ? (
            <>
              <span className="text-xs text-neutral-400 line-through">
                {"GH\u20B5 "}
                {product.price.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-danger-600 dark:text-danger-400">
                {"GH\u20B5 "}
                {product.effectivePrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {"GH\u20B5 "}
              {product.price.toFixed(2)}
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <StockBadge
          stockLevel={product.stockLevel}
          inStock={product.inStock}
        />
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <span
            className={cn("h-1.5 w-1.5 rounded-full", statusDotClass(product.status))}
            aria-hidden="true"
          />
          {PRODUCT_STATUS_LABELS[product.status]}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Link
            href={"/merchant/products/" + product.id}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            aria-label={"Edit " + product.name}
          >
            <AtlasIcon name="edit" className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
            aria-label={"Remove " + product.name}
          >
            <AtlasIcon name="trash" className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}