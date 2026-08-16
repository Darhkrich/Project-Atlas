"use client";

import { Button } from "@/components/atlas/button";
import type { ServiceProduct } from "@/lib/service-products";

interface ServiceProductCardProps {
  product: ServiceProduct;
  onBuy: (product: ServiceProduct) => void;
}

export function ServiceProductCard({
  product,
  onBuy,
}: ServiceProductCardProps) {
  const isAvailable = product.available && product.status === "available";

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {product.name}
          </h3>
          {product.network && (
            <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {product.network}
            </span>
          )}
          {product.provider && (
            <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {product.provider}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {product.currency} {product.price.toFixed(2)}
          </div>
        </div>
      </div>

      {product.validity && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Valid for {product.validity}
        </p>
      )}

      <div className="mt-auto pt-4">
        <Button
          size="sm"
          className="w-full"
          disabled={!isAvailable}
          onClick={() => onBuy(product)}
        >
          {isAvailable ? "Buy" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}