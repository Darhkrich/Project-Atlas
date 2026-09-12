"use client";

import Link from "next/link";
import type { Provider, ProviderService } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import {
  PROVIDER_CAPABILITY_LABEL,
  PROVIDER_PAYMENT_RAIL_LABEL,
  ROUTING_PRIORITY_LABEL,
  ROUTING_PRIORITY_VARIANT,
  SETTLEMENT_STATUS_LABEL,
} from "@/lib/admin/providers/constants";
import { serviceOperationalState } from "@/lib/admin/providers/state";

interface ProviderServicesPanelProps {
  provider: Provider;
}

export function ProviderServicesPanel({ provider }: ProviderServicesPanelProps) {
  const enabledCount = provider.services.filter(
    (s) => s.status === "enabled"
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services provided</CardTitle>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {enabledCount} enabled · {provider.services.length} total
        </span>
      </CardHeader>
      <CardContent>
        {provider.services.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No services configured yet.
          </p>
        ) : (
          <ul role="list" className="space-y-3">
            {provider.services.map((service) => (
              <ServiceRow key={service.id} provider={provider} service={service} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceRow({
  provider,
  service,
}: {
  provider: Provider;
  service: ProviderService;
}) {
  const state = serviceOperationalState(provider, service);
  const label = service.paymentRail
    ? PROVIDER_PAYMENT_RAIL_LABEL[service.paymentRail]
    : service.network
    ? `${PROVIDER_CAPABILITY_LABEL[service.capability]} · ${service.network}`
    : PROVIDER_CAPABILITY_LABEL[service.capability];

  const dataPlansHref =
    service.paymentRail === undefined
      ? `/admin/data-plans?capability=${service.capability}${
          service.network ? `&network=${encodeURIComponent(service.network)}` : ""
        }`
      : null;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <span
          aria-label={`Service status: ${state.label}`}
          title={state.headline}
          className={cn("h-2.5 w-2.5 rounded-full", state.dotClass)}
        />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {service.status === "enabled" ? "Enabled" : "Disabled"}
            {service.providerIdentifier
              ? ` · ${service.providerIdentifier}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={ROUTING_PRIORITY_VARIANT[service.routingPriority]} size="sm">
          {ROUTING_PRIORITY_LABEL[service.routingPriority]}
        </Badge>
        {service.settlementStatus && (
          <Badge variant="neutral" size="sm">
            {SETTLEMENT_STATUS_LABEL[service.settlementStatus]}
          </Badge>
        )}
        {typeof service.feePercentage === "number" && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {service.feePercentage}%
            {typeof service.fixedFee === "number"
              ? ` + ${service.fixedFee}`
              : ""}
          </span>
        )}
        {dataPlansHref && (
          <Link
            href={dataPlansHref}
            className="rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
          >
            View plans
          </Link>
        )}
      </div>
    </li>
  );
}