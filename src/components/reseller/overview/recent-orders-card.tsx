"use client";

import { AtlasCard } from "@/components/atlas/card";
import { SECTION_LABELS } from "@/lib/reseller/overview/labels";
import { RecentOrdersList } from "./recent-orders-list";
import { RecentOrdersTable } from "./recent-orders-table";
import type { ResellerOrderRow } from "@/lib/domains/orders/reseller-order-types";

interface RecentOrdersCardProps {
  orders: ResellerOrderRow[];
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <AtlasCard padding="none" className="overflow-hidden">
      <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 sm:px-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {SECTION_LABELS.recentOrders}
        </h2>
      </div>
      <div className="hidden lg:block">
        <RecentOrdersTable orders={orders} />
      </div>
      <div className="lg:hidden">
        <RecentOrdersList orders={orders} />
      </div>
    </AtlasCard>
  );
}