"use client";

import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface AnalyticsSummaryData {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  successRate: number;
  avgOrderValue: number;
  comparison: {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    successRate: number;
    avgOrderValue: number;
  };
}

export function AnalyticsSummaryCards({ data }: { data: AnalyticsSummaryData }) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: "sales",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      change: data.comparison.totalRevenue,
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      icon: "orders",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      change: data.comparison.totalOrders,
    },
    {
      label: "Active Users",
      value: data.activeUsers.toLocaleString(),
      icon: "users",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      change: data.comparison.activeUsers,
    },
    {
      label: "Success Rate",
      value: `${data.successRate}%`,
      icon: "check",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      change: data.comparison.successRate,
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(data.avgOrderValue),
      icon: "receipt",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      change: data.comparison.avgOrderValue,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(card => (
        <Card key={card.label} className={cn("border-0 shadow-sm", card.bg)}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
              <AtlasIcon name={card.icon as any} className={cn("h-5 w-5", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className={cn("text-xs mt-1", card.change >= 0 ? "text-success-600" : "text-danger-600")}>
              {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}% vs previous period
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}