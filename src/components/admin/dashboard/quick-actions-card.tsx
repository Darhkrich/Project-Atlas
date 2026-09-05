/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const actions = [
  { label: "Create Order", icon: "cart", href: "/admin/orders/new" },
  { label: "Add Reseller", icon: "users", href: "/admin/resellers/new" },
  { label: "Adjust Wallet", icon: "wallet", href: "/admin/wallets/adjust" },
  { label: "Send Notification", icon: "bell", href: "/admin/notifications/new" },
];

export function QuickActionsCard() {
  return (
    <Card className="p-3">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Quick Actions</h3>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center justify-start gap-2 rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name={action.icon as AtlasIconName} className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}