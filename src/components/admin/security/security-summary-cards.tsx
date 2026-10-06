// components/admin/security/security-summary-cards.tsx
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { SecuritySummary } from "@/lib/admin/types/security";

interface SummaryCardKey {
  key: string;
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
  filterType?: string;
  filterSeverity?: string;
  anchor?: string;
}

interface SecuritySummaryCardsProps {
  summary: SecuritySummary;
  activeFilterType: string;
  activeFilterSeverity: string;
  onFilter: (patch: { type?: string; severity?: string }) => void;
  onScrollTo: (anchor: string) => void;
}

export function SecuritySummaryCards({
  summary,
  activeFilterType,
  activeFilterSeverity,
  onFilter,
  onScrollTo,
}: SecuritySummaryCardsProps) {
  const cards: SummaryCardKey[] = [
    {
      key: "sessions",
      label: "Active sessions",
      value: summary.activeSessions,
      icon: "user",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      anchor: "sessions",
    },
    {
      key: "failed_logins",
      label: "Failed logins (24h)",
      value: summary.failedLogins24h,
      icon: "x-circle",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      filterType: "login_failure",
    },
    {
      key: "suspicious",
      label: "Suspicious activities (24h)",
      value: summary.suspiciousActivities24h,
      icon: "alert-triangle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      filterType: "suspicious_activity",
    },
    {
      key: "blocked_ips",
      label: "Blocked IPs",
      value: summary.blockedIPs,
      icon: "lock",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      anchor: "blocked-ips",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isFilterActive = Boolean(
          (card.filterType && activeFilterType === card.filterType) ||
          (card.filterSeverity && activeFilterSeverity === card.filterSeverity)
        );

        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={isFilterActive}
            onClick={() => {
              if (card.filterType) {
                onFilter({
                  type: isFilterActive ? "" : card.filterType,
                  severity: "",
                });
                return;
              }
              if (card.filterSeverity) {
                onFilter({
                  severity: isFilterActive ? "" : card.filterSeverity,
                  type: "",
                });
                return;
              }
              if (card.anchor) onScrollTo(card.anchor);
            }}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Card
              className={cn(
                "border-0 shadow-sm transition-shadow hover:shadow-md",
                card.bg,
                isFilterActive && "ring-2 ring-brand-500"
              )}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    {card.label}
                  </p>
                  <AtlasIcon
                    name= "alert"
                    className={cn("h-5 w-5", card.color)}
                  />
                </div>
                <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {card.value.toLocaleString("en-GH")}
                </p>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}