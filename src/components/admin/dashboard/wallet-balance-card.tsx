// components/admin/dashboard/wallet-balance-card.tsx
"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { useDashboard } from "@/lib/admin/hooks/use-dashboard";
import { formatCurrency } from "@/lib/shared/format";

export function WalletBalanceCard() {
  const { snapshot } = useDashboard();
  const b = snapshot.metrics.walletLiabilityBreakdown;
  const total = snapshot.metrics.walletLiability;

  const rows = [
    { key: "customer", label: "Customer wallets", value: b.customer },
    { key: "reseller", label: "Reseller wallets", value: b.reseller },
    {
      key: "merchantMain",
      label: "Merchant main",
      value: b.merchantMain,
    },
    {
  key: "merchantBilling",
      label: "Merchant billing",
      value: b.merchantBilling,
    },
  ];

  const maxValue = Math.max(...rows.map((r) => r.value), 1);

  return (
    <DashboardCard
      title="Funds Held"
      value={formatCurrency(total)}
      icon="wallet"
      delta={snapshot.deltas.walletLiability}
      deltaLabel="vs prev"
      href="/admin/wallets"
      mainChart={
        <div className="space-y-2 pt-1">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                <span>{row.label}</span>
                <span className="tabular-nums">
                  {formatCurrency(row.value)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-warning-500"
                  style={{ width: (row.value / maxValue) * 100 + "%" }}
                />
              </div>
            </div>
          ))}
        </div>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Customer"
            value={formatCurrency(b.customer)}
            status="warning"
          />
          <SubCardWithChart
            label="Reseller"
            value={formatCurrency(b.reseller)}
            status="warning"
          />
          <SubCardWithChart
            label="Merchant"
            value={formatCurrency(b.merchantMain + b.merchantBilling)}
            status="warning"
          />
        </>
      }
    />
  );
}