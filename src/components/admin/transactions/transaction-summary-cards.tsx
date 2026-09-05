/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface SummaryData {
  totalVolume: number;
  todayVolume: number;
  pendingAmount: number;
  failedAmount: number;
  successRate: number;
}

const sparklineData = [
  { value: 10 },
  { value: 25 },
  { value: 18 },
  { value: 40 },
  { value: 32 },
  { value: 50 },
];

export function TransactionSummaryCards({ data }: { data: SummaryData }) {
  const cards = [
    {
      label: "Total Volume",
      value: formatCurrency(data.totalVolume),
      icon: "transactions",
      gradient: "from-brand-600 to-brand-700",
      sparkColor: "#ffffff",
      textColor: "text-white",
      subColor: "text-brand-100",
    },
    {
      label: "Today's Volume",
      value: formatCurrency(data.todayVolume),
      icon: "trending-up",
      gradient: "from-blue-600 to-blue-700",
      sparkColor: "#ffffff",
      textColor: "text-white",
      subColor: "text-blue-100",
    },
    {
      label: "Pending Amount",
      value: formatCurrency(data.pendingAmount),
      icon: "clock",
      gradient: "from-warning-500 to-warning-600",
      sparkColor: "#ffffff",
      textColor: "text-white",
      subColor: "text-warning-100",
    },
    {
      label: "Failed Amount",
      value: formatCurrency(data.failedAmount),
      icon: "x-circle",
      gradient: "from-danger-500 to-danger-600",
      sparkColor: "#ffffff",
      textColor: "text-white",
      subColor: "text-danger-100",
    },
    {
      label: "Success Rate",
      value: `${data.successRate}%`,
      icon: "check",
      gradient: "from-success-500 to-success-600",
      sparkColor: "#ffffff",
      textColor: "text-white",
      subColor: "text-success-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "overflow-hidden border-0 bg-gradient-to-br text-white shadow-lg",
            card.gradient
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className={cn("text-sm font-medium", card.subColor)}>{card.label}</p>
              <AtlasIcon name={card.icon as any} className="h-5 w-5 opacity-80" />
            </div>
            <p className={cn("mt-2 text-2xl font-bold", card.textColor)}>{card.value}</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`spark-${card.label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.sparkColor} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={card.sparkColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={card.sparkColor}
                    fill={`url(#spark-${card.label})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}