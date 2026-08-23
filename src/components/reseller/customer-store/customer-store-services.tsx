/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { AtlasIcon, AtlasIconName } from "@/components/atlas/icons";
import { CustomerStoreProductCard } from "./customer-store-product-card";
import type {
  CustomerStoreProduct,
  CustomerStoreService,
} from "./customer-store";

type Props = {
  services: CustomerStoreService[];
  onBuy: (product: CustomerStoreProduct) => void;
  primaryColor: string;
};

export function CustomerStoreServices({
  services,
  onBuy,
  primaryColor,
}: Props) {
  return (
    <div id="services" className="space-y-10 scroll-mt-24">
      {services.map((service) => {
        const products = "products" in service ? service.products ?? [] : [];

        return (
          <section key={service.id}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                  }}
                >
                  <AtlasIcon name={service.icon} className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                    {service.name}
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
                    {service.description}
                  </p>
                </div>
              </div>

              <span className="hidden shrink-0 text-xs font-medium text-neutral-400 sm:block">
                {(products as CustomerStoreProduct[]).length} products
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(products as CustomerStoreProduct[]).map(
                (product: CustomerStoreProduct) => (
                <CustomerStoreProductCard
                  key={product.id}
                  product={product}
                  onBuy={() => onBuy(product)}
                  formatCurrency={(value: number) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(value)
                  }
                />
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}