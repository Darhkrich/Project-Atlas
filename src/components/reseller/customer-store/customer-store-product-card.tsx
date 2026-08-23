"use client";

import type { CustomerStoreProduct } from "./customer-store";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";

type Props = {
  product: CustomerStoreProduct;
  formatCurrency: (value: number) => string;
  onBuy: () => void;
};

export function CustomerStoreProductCard({
  product,
  formatCurrency,
  onBuy,
}: Props) {
  return (
    <AtlasCard className="group relative flex h-full flex-col overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {product.popular && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-brand-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Popular
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
            <AtlasIcon name={product.icon} className="h-6 w-6" />
          </div>

          {product.network && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {product.network}
            </span>
          )}
        </div>

        <div className="mt-5">
          <h3 className="text-base font-bold text-neutral-950 dark:text-white">
            {product.name}
          </h3>

          <p className="mt-1 min-h-10 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Price
            </p>

            <p className="mt-0.5 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatCurrency(product.price)}
            </p>
          </div>

          {product.validity && (
            <div className="text-right">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Validity
              </p>

              <p className="mt-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {product.validity}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-neutral-100 p-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBuy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Buy Now
          <AtlasIcon name="arrow-right" className="h-4 w-4" />
        </button>
      </div>
    </AtlasCard>
  );
}