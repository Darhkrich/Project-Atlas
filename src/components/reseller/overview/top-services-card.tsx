"use client";

import { AtlasCard } from "@/components/atlas/card";
import { SECTION_LABELS } from "@/lib/reseller/overview/labels";
import type { TopService } from "@/lib/reseller/overview/types";

interface TopServicesCardProps {
  services: TopService[];
}

export function TopServicesCard({ services }: TopServicesCardProps) {
  if (services.length === 0) return null;

  return (
    <AtlasCard className="p-5">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {SECTION_LABELS.topServices}
      </h2>
      <ul role="list" className="mt-4 space-y-4">
        {services.map((service) => (
          <li key={service.serviceId}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {service.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                {service.percentage}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
              role="img"
              aria-label={
                service.label + " accounts for " + String(service.percentage) + " percent of orders"
              }
            >
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: String(service.percentage) + "%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </AtlasCard>
  );
}