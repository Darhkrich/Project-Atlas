"use client";

import type { QueueSummary } from "@/lib/admin/resellers/verification-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";
import { waitingLabel, waitingTone } from "@/lib/admin/resellers/verification-labels";

interface VerificationSummaryCardsProps {
  summary: QueueSummary;
  loading?: boolean;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: "warning" | "danger";
  ariaLabel: string;
}

export function VerificationSummaryCards({
  summary,
  loading,
}: VerificationSummaryCardsProps) {
  const longestTone = waitingTone(summary.longestWaitDays);

  const cards: CardDef[] = [
    {
      key: "pending",
      label: "Pending review",
      value: formatNumber(summary.pending),
      sub:
        summary.pending === 0
          ? "Queue is clear"
          : summary.pending === 1
          ? "1 reseller waiting"
          : summary.pending + " resellers waiting",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: summary.pending > 0 ? "warning" : undefined,
      ariaLabel: summary.pending + " resellers pending review",
    },
    {
      key: "longest",
      label: "Longest wait",
      value:
        summary.pending === 0
          ? "—"
          : waitingLabel(summary.longestWaitDays),
      sub: summary.longestWaitResellerName ?? "No one waiting",
      icon: "alert",
      color:
        longestTone === "danger"
          ? "text-danger-600"
          : longestTone === "warning"
          ? "text-warning-600"
          : "text-neutral-500",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight:
        longestTone === "danger"
          ? "danger"
          : longestTone === "warning"
          ? "warning"
          : undefined,
      ariaLabel:
        summary.pending === 0
          ? "No one waiting"
          : "Longest wait " +
            waitingLabel(summary.longestWaitDays) +
            " for " +
            (summary.longestWaitResellerName ?? "unknown"),
    },
    {
      key: "verified",
      label: "Verified",
      value: formatNumber(summary.verified),
      sub: "Approved resellers",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      ariaLabel: summary.verified + " resellers verified",
    },
    {
      key: "rejected",
      label: "Rejected",
      value: formatNumber(summary.rejected),
      sub:
        summary.notSubmitted > 0
          ? summary.notSubmitted + " not submitted"
          : "No rejections",
      icon: "x-circle",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      ariaLabel: summary.rejected + " resellers rejected",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Verification queue summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn(
            "h-full border-0 shadow-sm",
            card.bg,
            card.highlight === "warning" &&
              "ring-1 ring-warning-300 dark:ring-warning-800",
            card.highlight === "danger" &&
              "ring-1 ring-danger-300 dark:ring-danger-800"
          )}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                aria-hidden="true"
                className={cn("h-4 w-4 shrink-0", card.color)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold" aria-live="polite">
              {loading ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-6 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                />
              ) : (
                card.value
              )}
            </p>
            {card.sub && (
              <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                {card.sub}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}