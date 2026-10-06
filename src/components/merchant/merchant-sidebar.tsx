"use client";

import { useMemo } from "react";
import { MerchantNavigation } from "./merchant-navigation";
import { cn } from "@/lib/utils";
import { useMerchantNotifications } from "@/lib/merchant/notifications/use-merchant-notifications";
import {
  merchantNavItems,
  MERCHANT_NAV_GROUP_LABELS,
  MERCHANT_NAV_GROUP_ORDER,
} from "@/lib/merchant/nav/merchant-nav-items";

export function MerchantSidebar({ className = "" }: { className?: string }) {
  const { unreadCount } = useMerchantNotifications();
  const groups = useMemo(
    () =>
      MERCHANT_NAV_GROUP_ORDER.map((group) => ({
        group,
        label: MERCHANT_NAV_GROUP_LABELS[group],
        items: merchantNavItems.filter((item) => item.group === group),
      })).filter((g) => g.items.length > 0),
    []
  );

  const badges = useMemo(
    () => ({ "/merchant/notifications": unreadCount }),
    [unreadCount]
  );

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex-1 space-y-6">
          {groups.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {group.label}
              </p>
              <MerchantNavigation
                items={group.items}
                ariaLabel={group.label + " navigation"}
                badges={badges}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}