"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";

interface Provider {
  name: string;
  status: "operational" | "degraded" | "down";
  successRate: number;
  latency: string;
  latencyMs: number;
}

const providers: Provider[] = [
  { name: "MTN MoMo", status: "operational", successRate: 98, latency: "120ms", latencyMs: 120 },
  { name: "Telecel", status: "degraded", successRate: 91, latency: "250ms", latencyMs: 250 },
  { name: "Visa", status: "operational", successRate: 99, latency: "80ms", latencyMs: 80 },
  { name: "Atlas Wallet", status: "operational", successRate: 100, latency: "30ms", latencyMs: 30 },
];

const statusConfig = {
  operational: { label: "Operational", variant: "success" as const, dot: "bg-success-500", bar: "bg-success-500" },
  degraded: { label: "Degraded", variant: "warning" as const, dot: "bg-warning-500", bar: "bg-warning-500" },
  down: { label: "Down", variant: "danger" as const, dot: "bg-danger-500", bar: "bg-danger-500" },
};

export function ProviderHealthCard() {
  const maxLatency = Math.max(...providers.map((p) => p.latencyMs));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Provider Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const config = statusConfig[provider.status];
          return (
            <div key={provider.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", config.dot)} />
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-neutral-500">Success Rate</p>
                  <p className="font-semibold">{provider.successRate}%</p>
                  <div className="mt-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className={cn("h-1 rounded-full", config.bar)}
                      style={{ width: `${provider.successRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-neutral-500">Latency</p>
                  <p className="font-semibold">{provider.latency}</p>
                  <div className="mt-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className={cn(
                        "h-1 rounded-full",
                        provider.latencyMs < 150
                          ? "bg-success-500"
                          : provider.latencyMs < 300
                          ? "bg-warning-500"
                          : "bg-danger-500"
                      )}
                      style={{ width: `${(provider.latencyMs / maxLatency) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}