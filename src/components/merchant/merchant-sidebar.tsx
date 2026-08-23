"use client";

import { MerchantNavItem, merchantNavItems } from "@/lib/merchant-navigation";
import { MerchantNavigation } from "./merchant-navigation";
import { cn } from "@/lib/utils";

const groupLabels: Record<MerchantNavItem["group"], string> = {
  overview: "Overview",
  business: "Business",
  store: "Store",
  billing: "Billing",
  support: "Support",
};

export function MerchantSidebar({ className = "" }: { className?: string }) {
  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex-1 space-y-6">
          {Object.entries(groupLabels).map(([group, label]) => {
            const items = merchantNavItems.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {label}
                </p>
                <MerchantNavigation items={items} ariaLabel={`${label} navigation`} />
              </div>
            );
          })}
        </div>

        {/* Optional: if you want a bottom card, we can add a neutral "Need help?" card.
            For now, no promo card is included to keep it clean and business-focused. */}
      </div>
    </aside>
  );
}