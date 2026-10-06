"use client";

import { TOP_PRODUCTS_EMPTY } from "@/lib/merchant/analytics/labels";
import type { TopProduct } from "@/lib/merchant/analytics/types";

interface AnalyticsTopProductsProps {
  products: TopProduct[];
}

export function AnalyticsTopProducts({
  products,
}: AnalyticsTopProductsProps) {
  return (
    <section
      aria-labelledby="analytics-top-products-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2
        id="analytics-top-products-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Top products
      </h2>

      {products.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          {TOP_PRODUCTS_EMPTY}
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-4">
          {products.map((product) => (
            <li key={product.name}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {product.name}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {"GH\u20B5 "}
                  {product.revenue.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="flex-1">
                  <span
                    className="block h-1.5 rounded-full bg-brand-500"
                    style={{
                      width: Math.max(4, product.shareOfTop * 100) + "%",
                    }}
                    aria-hidden="true"
                  />
                </span>
                <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {product.unitsSold === 1
                    ? "1 unit"
                    : product.unitsSold + " units"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}