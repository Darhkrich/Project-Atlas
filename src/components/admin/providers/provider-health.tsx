"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface ProviderHealthProps {
  provider: Provider;
}

export function ProviderHealth({ provider }: ProviderHealthProps) {
  const [running, setRunning] = useState(false);
  const [healthCheckResult, setHealthCheckResult] = useState<{
    api: "pass" | "fail" | "pending";
    auth: "pass" | "fail" | "pending";
    latency: "pass" | "fail" | "pending";
    timestamp: string;
  } | null>(null);

  const gaugeData = [
    {
      name: "Uptime",
      value: provider.successRate,
      fill:
        provider.healthStatus === "healthy"
          ? "#22c55e"
          : provider.healthStatus === "warning"
          ? "#f59e0b"
          : "#ef4444",
    },
  ];

  const runHealthCheck = () => {
    setRunning(true);
    setHealthCheckResult(null);
    setTimeout(() => {
      const isHealthy = provider.healthStatus === "healthy";
      setHealthCheckResult({
        api: isHealthy ? "pass" : "fail",
        auth: "pass",
        latency:
          provider.averageResponseTime < 800 ? "pass" : "fail",
        timestamp: new Date().toISOString(),
      });
      setRunning(false);
    }, 1500);
  };

  const resultIcon = (status: "pass" | "fail" | "pending") => {
    if (status === "pass")
      return <AtlasIcon name="check" className="h-3.5 w-3.5 text-success-600" />;
    if (status === "fail")
      return <AtlasIcon name="x-circle" className="h-3.5 w-3.5 text-danger-600" />;
    return <AtlasIcon name="clock" className="h-3.5 w-3.5 text-neutral-400" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Provider Health</CardTitle>
        <Button variant="outline" size="sm" onClick={runHealthCheck} disabled={running}>
          {running ? "Running..." : "Run Health Check"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radial gauge */}
        <div className="relative mx-auto h-32 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="80%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
            <p className="text-2xl font-bold">{provider.successRate}%</p>
            <p className="text-xs text-neutral-500">uptime</p>
          </div>
        </div>

        {/* Health rows */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Connection</span>
            <Badge
              variant={
                provider.healthStatus === "healthy"
                  ? "success"
                  : provider.healthStatus === "warning"
                  ? "warning"
                  : "danger"
              }
            >
              {provider.healthStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">API</span>
            <span
              className={
                provider.status === "active"
                  ? "text-success-600"
                  : "text-danger-600"
              }
            >
              {provider.status === "active" ? "Operational" : "Not Responding"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Authentication</span>
            <span className="text-success-600">Valid</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Latency</span>
            <span
              className={cn(
                provider.averageResponseTime < 800
                  ? "text-success-600"
                  : "text-warning-600"
              )}
            >
              {provider.averageResponseTime}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Error Rate</span>
            <span
              className={
                provider.successRate >= 97
                  ? "text-success-600"
                  : provider.successRate >= 90
                  ? "text-warning-600"
                  : "text-danger-600"
              }
            >
              {(100 - provider.successRate).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Last Check</span>
            <span className="text-xs text-neutral-500">
              {new Date(provider.lastHealthCheck).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Health check result */}
        {healthCheckResult && (
          <div className="mt-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
            <p className="mb-2 text-xs font-medium text-neutral-500">
              Health check result
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                {resultIcon(healthCheckResult.api)}
                <span>API reachable</span>
              </li>
              <li className="flex items-center gap-2">
                {resultIcon(healthCheckResult.auth)}
                <span>Authentication valid</span>
              </li>
              <li className="flex items-center gap-2">
                {resultIcon(healthCheckResult.latency)}
                <span>Latency within threshold</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-neutral-400">
              Checked: {new Date(healthCheckResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}