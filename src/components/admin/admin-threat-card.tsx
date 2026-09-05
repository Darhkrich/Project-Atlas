/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThreatLevel } from "@/lib/admin/types/dashboard";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
// ... rest of file

interface AdminThreatCardProps {
  threatLevel: ThreatLevel;
  attacks24h: number;
  apisBlocked24h: number;
  attackTrend: number[];
}

const threatConfig = {
  normal: { label: "Normal", variant: "success" as const },
  warning: { label: "Warning", variant: "warning" as const },
  critical: { label: "Critical", variant: "danger" as const },
};

export function AdminThreatCard({
  threatLevel,
  attacks24h,
  apisBlocked24h,
  attackTrend,
}: AdminThreatCardProps) {
  const config = threatConfig[threatLevel];
  const chartData = attackTrend.map((value, index) => ({ day: index, attacks: value }));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Cyber Attack Status</h3>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Attacks (24h)</p>
            <p className="text-xl font-semibold">{attacks24h}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">APIs Blocked (24h)</p>
            <p className="text-xl font-semibold">{apisBlocked24h}</p>
          </div>
        </div>
        <div className="mt-4 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="attacks"
                stroke={threatLevel === "critical" ? "#c56151" : threatLevel === "warning" ? "#c89c1e" : "#2d9444"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}