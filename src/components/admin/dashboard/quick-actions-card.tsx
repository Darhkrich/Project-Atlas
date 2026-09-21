// components/admin/dashboard/quick-actions-card.tsx
"use client";

import Link from "next/link";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Can, PERMISSIONS, type Permission } from "@/lib/admin/rbac";
import { routes } from "@/lib/admin/routes";

interface ActionSpec {
  label: string;
  description: string;
  icon: AtlasIconName;
  href: string;
  permission: Permission;
}

const ACTIONS: ActionSpec[] = [
  {
    label: "Create Order",
    description: "Place a manual order",
    icon: "cart",
    href: routes.orders,
    permission: PERMISSIONS.ORDERS_MANAGE,
  },
  {
    label: "Add Reseller",
    description: "Onboard a new reseller",
    icon: "users",
    href: routes.resellers,
    permission: PERMISSIONS.RESELLERS_EDIT,
  },
  {
    label: "Adjust Wallet",
    description: "Manual wallet adjustment",
    icon: "wallet",
    href: routes.wallets,
    permission: PERMISSIONS.WALLETS_ADJUST,
  },
  {
    label: "Send Notification",
    description: "Broadcast a message",
    icon: "bell",
    href: routes.notifications,
    permission: PERMISSIONS.NOTIFICATIONS_MANAGE,
  },
];

export function QuickActionsCard() {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Quick Actions
      </h2>
      <ul
        role="list"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ACTIONS.map((action) => (
          <li key={action.label}>
            <Can permission={action.permission}>
              <Link
                href={action.href}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <AtlasIcon
                    name={action.icon}
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-neutral-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Can>
          </li>
        ))}
      </ul>
    </Card>
  );
}