"use client";

import { Provider, ProviderService } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";

interface ProviderServicesPanelProps {
  provider: Provider;
}

const healthConfig: Record<string, { label: string; variant: "success" | "warning" | "danger"; dot: string }> = {
  healthy: { label: "Healthy", variant: "success", dot: "bg-success-500" },
  warning: { label: "Degraded", variant: "warning", dot: "bg-warning-500" },
  critical: { label: "Critical", variant: "danger", dot: "bg-danger-500" },
};

function ServiceRow({ service }: { service: ProviderService }) {
  const health = service.healthStatus || "healthy";
  const config = healthConfig[health];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", config.dot)} />
        <div>
          <p className="text-sm font-medium capitalize">
            {service.serviceCategory.replace(/_/g, " ")}
          </p>
          {service.network && (
            <p className="text-xs text-neutral-500">{service.network}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={config.variant}>{config.label}</Badge>
        <Badge variant={service.status === "enabled" ? "success" : "neutral"}>
          {service.status}
        </Badge>
        <Badge variant="info" className="capitalize">
          {service.routingPriority}
        </Badge>
        {service.providerIdentifier && (
          <span className="font-mono text-xs text-neutral-500">
            {service.providerIdentifier}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProviderServicesPanel({ provider }: ProviderServicesPanelProps) {
  const enabledCount = provider.services.filter((s) => s.status === "enabled").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services Provided</CardTitle>
        <span className="text-xs text-neutral-500">
          {enabledCount} enabled · {provider.services.length} total
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {provider.services.length === 0 ? (
          <p className="text-sm text-neutral-400">No services configured.</p>
        ) : (
          provider.services.map((svc) => <ServiceRow key={svc.id} service={svc} />)
        )}
      </CardContent>
    </Card>
  );
}