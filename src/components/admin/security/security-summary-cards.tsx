/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { mockSecuritySummary } from "@/lib/admin/mock/security";

export function SecuritySummaryCards() {
  const summary = mockSecuritySummary;
  const cards = [
    { label: "Active Sessions", value: summary.activeSessions, icon: "user", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-900/20" },
    { label: "Failed Logins (24h)", value: summary.failedLogins24h, icon: "x-circle", color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-900/20" },
    { label: "Suspicious Activities", value: summary.suspiciousActivities24h, icon: "alert", color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-900/20" },
    { label: "Blocked IPs", value: summary.blockedIPs, icon: "lock", color: "text-info-600", bg: "bg-info-50 dark:bg-info-900/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.label} className={cn("border-0 shadow-sm", card.bg)}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
              <AtlasIcon name={card.icon as any} className={cn("h-5 w-5", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}