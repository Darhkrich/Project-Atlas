"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface WalletSummaryData {
  totalBalance: number;
  customerBalance: number;
  resellerBalance: number;
  merchantBalance: number;
  pendingWithdrawals: number;
}

export function WalletSummaryCards({ data }: { data: WalletSummaryData }) {
  const cards: {
    label: string;
    value: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
  }[] = [
    {
      label: "Total Wallet Balance",
      value: formatCurrency(data.totalBalance),
      icon: "wallet",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
    },
    {
      label: "Customer Wallets",
      value: formatCurrency(data.customerBalance),
      icon: "user",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
    },
    {
      label: "Reseller Wallets",
      value: formatCurrency(data.resellerBalance),
      icon: "users",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
    },
    {
      label: "Merchant Wallets",
      value: formatCurrency(data.merchantBalance),
      icon: "briefcase",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
    },
    {
      label: "Pending Withdrawals",
      value: formatCurrency(data.pendingWithdrawals),
      icon: "clock",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: data.pendingWithdrawals > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "border-0 shadow-sm transition-shadow hover:shadow-md",
            card.bg,
            card.highlight && "ring-1 ring-danger-300 dark:ring-danger-800"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon name={card.icon} className={cn("h-4 w-4", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}