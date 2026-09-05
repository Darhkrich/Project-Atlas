"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

const providers = [
  { name: "MTN MoMo", successRate: 98, status: "operational" },
  { name: "Telecel", successRate: 91, status: "degraded" },
  { name: "Visa", successRate: 99, status: "operational" },
  { name: "Atlas Wallet", successRate: 100, status: "operational" },
];

const statusConfig = {
  operational: { label: "Operational", variant: "success" as const, color: "#22c55e" },
  degraded: { label: "Degraded", variant: "warning" as const, color: "#f59e0b" },
  down: { label: "Down", variant: "danger" as const, color: "#ef4444" },
};

export function PaymentProviderHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Provider Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {providers.map((provider) => {
            const config = statusConfig[provider.status];
            const gaugeData = [{ value: provider.successRate }];
            return (
              <div key={provider.name} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{provider.name}</span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <div className="relative h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="80%"
                      outerRadius="100%"
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar dataKey="value" fill={config.color} cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{provider.successRate}%</span>
                  </div>
                </div>
                <p className="text-center text-xs text-neutral-500">Success Rate</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}