"use client";

import type { MerchantProductRow } from "@/lib/merchant/products/types";
import { ProductRow } from "./product-row";
import { ProductCard } from "./product-card";
import { ProductSelectCheckbox } from "./product-select-checkbox";

interface ProductListProps {
  rows: MerchantProductRow[];
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onDelete: (product: MerchantProductRow) => void;
}

export function ProductList({
  rows,
  isSelected,
  onToggleSelect,
  allSelected,
  someSelected,
  onToggleAll,
  onDelete,
}: ProductListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <table className="w-full text-left">
          <caption className="sr-only">Your product catalog</caption>
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <tr>
              <th scope="col" className="w-12 px-4 py-3">
                <ProductSelectCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onToggleAll}
                  label={
                    allSelected
                      ? "Deselect all products"
                      : "Select all products on this page"
                  }
                />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                SKU
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={isSelected(product.id)}
                onToggleSelect={() => onToggleSelect(product.id)}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul role="list" className="space-y-3 lg:hidden">
        {rows.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              selected={isSelected(product.id)}
              onToggleSelect={() => onToggleSelect(product.id)}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </>
  );
}