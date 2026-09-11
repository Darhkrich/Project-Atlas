"use client";

import Link from "next/link";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const actions: { label: string; description: string; icon: AtlasIconName; href: string }[] = [
  { label: "Create Order", description: "Place a manual order", icon: "cart", href: "/admin/orders/new" },
  { label: "Add Reseller", description: "Onboard a new reseller", icon: "users", href: "/admin/resellers/new" },
  { label: "Adjust Wallet", description: "Manual wallet adjustment", icon: "wallet", href: "/admin/wallets" },
  { label: "Send Notification", description: "Broadcast a message", icon: "bell", href: "/admin/notifications" },
];

export function QuickActionsCard() {
  return (
    <Card className="p-4 col-span-1 md:col-span-2 xl:col-span-4">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={action.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs text-neutral-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}