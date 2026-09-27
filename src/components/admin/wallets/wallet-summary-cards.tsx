"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import type {
  RegistryPoolSummary,
  RegistrySummary,
  WalletPoolType,
} from "@/lib/admin/wallets/registry-types";

interface Props {
  summary: RegistrySummary;
  activePool: WalletPoolType | "";
  onSelectPool: (pool: WalletPoolType | "") => void;
}

interface CardSpec {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  variant: "brand" | "info" | "success" | "warning" | "neutral";
  pool: WalletPoolType | null;
}

function poolByKey(
  pools: RegistryPoolSummary[],
  pool: WalletPoolType
): RegistryPoolSummary | undefined {
  return pools.find((p) => p.pool === pool);
}

function variantClass(variant: CardSpec["variant"]): string {
  if (variant === "brand") return "text-brand-700 dark:text-brand-300";
  if (variant === "info") return "text-info-700 dark:text-info-300";
  if (variant === "success") return "text-success-700 dark:text-success-300";
  if (variant === "warning") return "text-warning-700 dark:text-warning-300";
  return "text-neutral-500 dark:text-neutral-400";
}

function iconClass(variant: CardSpec["variant"]): string {
  if (variant === "brand") return "text-brand-600 dark:text-brand-400";
  if (variant === "info") return "text-info-600 dark:text-info-400";
  if (variant === "success") return "text-success-600 dark:text-success-400";
  if (variant === "warning") return "text-warning-600 dark:text-warning-400";
  return "text-neutral-400 dark:text-neutral-500";
}

export function WalletSummaryCards({
  summary,
  activePool,
  onSelectPool,
}: Props) {
  const customer = poolByKey(summary.pools, "customer");
  const storefront = poolByKey(summary.pools, "storefront_user");
  const reseller = poolByKey(summary.pools, "reseller");
  const merchantBilling = poolByKey(summary.pools, "merchant_billing");
  const merchantMain = poolByKey(summary.pools, "merchant_main");

  const merchantTotal =
    Math.round(
      ((merchantBilling?.totalBalance ?? 0) +
        (merchantMain?.totalBalance ?? 0)) *
        100
    ) / 100;
  const merchantCount =
    (merchantBilling?.walletCount ?? 0) + (merchantMain?.walletCount ?? 0);

  const cards: CardSpec[] = [
    {
      key: "customer",
      label: "Customer wallets",
      value: formatCurrency(customer?.totalBalance ?? 0),
      sub:
        formatNumber(customer?.walletCount ?? 0) +
        " wallets" +
        ((customer?.frozenCount ?? 0) > 0
          ? " · " + customer!.frozenCount + " frozen"
          : ""),
      icon: "user",
      variant: "info",
      pool: "customer",
    },
    {
      key: "storefront_user",
      label: "Storefront user wallets",
      value: formatCurrency(storefront?.totalBalance ?? 0),
      sub:
        formatNumber(storefront?.walletCount ?? 0) +
        " wallets" +
        ((storefront?.frozenCount ?? 0) > 0
          ? " · " + storefront!.frozenCount + " frozen"
          : ""),
      icon: "users",
      variant: "brand",
      pool: "storefront_user",
    },
    {
      key: "reseller",
      label: "Reseller wallets",
      value: formatCurrency(reseller?.totalBalance ?? 0),
      sub:
        formatNumber(reseller?.walletCount ?? 0) +
        " wallets" +
        ((reseller?.frozenCount ?? 0) > 0
          ? " · " + reseller!.frozenCount + " frozen"
          : ""),
      icon: "wallet",
      variant: "success",
      pool: "reseller",
    },
    {
      key: "merchant",
      label: "Merchant wallets",
      value: formatCurrency(merchantTotal),
      sub:
        formatNumber(merchantCount) +
        " wallets · billing + main",
      icon: "briefcase",
      variant: "warning",
      pool: null,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Wallet liabilities summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => {
        const isActive =
          card.pool !== null && activePool === card.pool;
        const cardBody = (
          <Card
            className={cn(
              "h-full p-4 transition-shadow",
              isActive && "ring-2 ring-brand-500"
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.12em]",
                  variantClass(card.variant)
                )}
              >
                {card.label}
              </span>
              <AtlasIcon
                name={card.icon}
                className={cn("h-4 w-4", iconClass(card.variant))}
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {card.value}
            </div>
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {card.sub}
            </div>
          </Card>
        );

        return (
          <div key={card.key}>
            {card.pool !== null ? (
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={
                  (isActive ? "Clear filter: " : "Filter by ") + card.label
                }
                onClick={() =>
                  onSelectPool(isActive ? "" : card.pool!)
                }
                className="block h-full w-full text-left"
              >
                {cardBody}
              </button>
            ) : (
              cardBody
            )}
          </div>
        );
      })}

      <div>
        <Card
          className={cn(
            "h-full p-4",
            summary.grandTotalMatchesTreasury
              ? "bg-brand-50 dark:bg-brand-900/20"
              : "bg-danger-50 dark:bg-danger-900/20"
          )}
        >
          <div className="flex items-start justify-between">
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.12em]",
                summary.grandTotalMatchesTreasury
                  ? "text-brand-700 dark:text-brand-300"
                  : "text-danger-700 dark:text-danger-300"
              )}
            >
              Total user liabilities
            </span>
            <AtlasIcon
              name="wallet"
              className={cn(
                "h-4 w-4",
                summary.grandTotalMatchesTreasury
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-danger-600 dark:text-danger-400"
              )}
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatCurrency(summary.totalBalance)}
          </div>
          <div
            className={cn(
              "mt-1 text-xs",
              summary.grandTotalMatchesTreasury
                ? "text-neutral-500 dark:text-neutral-400"
                : "text-danger-700 dark:text-danger-300"
            )}
          >
            {summary.grandTotalMatchesTreasury
              ? "Matches treasury liabilities"
              : "Does not match treasury · " +
                formatCurrency(summary.treasuryLiabilities)}
          </div>
        </Card>
      </div>
    </div>
  );
}