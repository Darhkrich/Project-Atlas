/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface PaymentSummaryData {
  totalVolume: number;
  successfulAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
}

const sparklineData = [
  { value: 15 },
  { value: 30 },
  { value: 22 },
  { value: 45 },
  { value: 38 },
  { value: 60 },
];

export function PaymentSummaryCards({ data }: { data: PaymentSummaryData }) {
  const cards = [
    {
      label: "Total Volume",
      value: formatCurrency(data.totalVolume),
      icon: "transactions",
      gradient: "from-brand-600 to-brand-700",
      sparkColor: "#ffffff",
    },
    {
      label: "Successful",
      value: formatCurrency(data.successfulAmount),
      icon: "check",
      gradient: "from-success-500 to-success-600",
      sparkColor: "#ffffff",
    },
    {
      label: "Pending",
      value: formatCurrency(data.pendingAmount),
      icon: "clock",
      gradient: "from-warning-500 to-warning-600",
      sparkColor: "#ffffff",
    },
    {
      label: "Failed",
      value: formatCurrency(data.failedAmount),
      icon: "x-circle",
      gradient: "from-danger-500 to-danger-600",
      sparkColor: "#ffffff",
    },
    {
      label: "Refunded",
      value: formatCurrency(data.refundedAmount),
      icon: "receipt",
      gradient: "from-neutral-600 to-neutral-700",
      sparkColor: "#ffffff",
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
              <p className="text-sm font-medium text-white/80">{card.label}</p>
              <AtlasIcon name={card.icon as any} className="h-5 w-5 opacity-80" />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`spark-payment-${card.label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.sparkColor} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={card.sparkColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={card.sparkColor}
                    fill={`url(#spark-payment-${card.label})`}
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