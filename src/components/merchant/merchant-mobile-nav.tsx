"use client";

import { useMemo } from "react";
import { MerchantNavigation } from "./merchant-navigation";
import { MerchantDrawerShell } from "./merchant-drawer-shell";
import { useAuth } from "@/contexts/auth-context";
import { useMerchantNotifications } from "@/lib/merchant/notifications/use-merchant-notifications";
import {
  merchantNavItems,
  MERCHANT_NAV_GROUP_LABELS,
  MERCHANT_NAV_GROUP_ORDER,
} from "@/lib/merchant/nav/merchant-nav-items";

interface MerchantMobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MerchantMobileNav({ open, onClose }: MerchantMobileNavProps) {
  const { logout } = useAuth();
  const { unreadCount } = useMerchantNotifications();

  const groups = MERCHANT_NAV_GROUP_ORDER.map((group) => ({
    group,
    label: MERCHANT_NAV_GROUP_LABELS[group],
    items: merchantNavItems.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);

  const badges = useMemo(
    () => ({ "/merchant/notifications": unreadCount }),
    [unreadCount]
  );

  return (
    <MerchantDrawerShell
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
    >
      <div className="flex flex-col justify-between p-4">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {group.label}
              </p>
              <MerchantNavigation
                items={group.items}
                ariaLabel={group.label + " navigation"}
                onNavigate={onClose}
                badges={badges}
              />
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Log out
          </button>
        </div>
      </div>
    </MerchantDrawerShell>
  );
}