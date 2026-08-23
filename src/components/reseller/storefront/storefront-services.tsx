"use client";

import type { ComponentProps, Dispatch, SetStateAction } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

type AtlasIconName = ComponentProps<typeof AtlasIcon>["name"];

type ResellerStorefront = {
  services: Array<{
    id: string;
    name: string;
    description: string;
    icon: AtlasIconName;
    enabled: boolean;
  }>;
};

type StorefrontServicesProps = {
  storefront: ResellerStorefront;
  setStorefront: Dispatch<SetStateAction<ResellerStorefront>>;
};

export function StorefrontServices({
  storefront,
  setStorefront,
}: StorefrontServicesProps) {
  const enabledCount = storefront.services.filter(
    (service) => service.enabled,
  ).length;

  const toggleService = (serviceId: string) => {
    setStorefront((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              enabled: !service.enabled,
            }
          : service,
      ),
    }));
  };

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
            Store Services
          </h2>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Choose which services customers can purchase from your storefront.
          </p>
        </div>

        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {enabledCount} of {storefront.services.length} enabled
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {storefront.services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => toggleService(service.id)}
            className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
              service.enabled
                ? "border-brand-200 bg-brand-50/40 shadow-sm dark:border-brand-900/50 dark:bg-brand-950/20"
                : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                service.enabled
                  ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
              }`}
            >
              <AtlasIcon name={service.icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {service.name}
                </p>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    service.enabled
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  {service.enabled && (
                    <AtlasIcon name="check" className="h-3 w-3" />
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {service.description}
              </p>

              <p
                className={`mt-2 text-[11px] font-semibold ${
                  service.enabled
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-neutral-400"
                }`}
              >
                {service.enabled ? "Visible in storefront" : "Hidden from storefront"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}