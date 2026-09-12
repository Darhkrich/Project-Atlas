// components/admin/shared/storefront-users-list.tsx
"use client";

import { mockStorefrontUsers } from "@/lib/admin/mock/storefront-users";
import type { StorefrontUser } from "@/lib/admin/types/storefront-user";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { formatCurrency } from "@/lib/admin/formatters";

interface StorefrontUsersListProps {
  storefrontId: string;
  storefrontType: "reseller" | "merchant";
  limit?: number;
}

const statusVariant: Record<
  StorefrontUser["status"],
  "success" | "danger" | "neutral"
> = {
  active: "success",
  suspended: "danger",
  inactive: "neutral",
};

export function StorefrontUsersList({
  storefrontId,
  storefrontType,
  limit,
}: StorefrontUsersListProps) {
  const all = mockStorefrontUsers.filter(
    (u) =>
      u.storefrontId === storefrontId && u.storefrontType === storefrontType
  );

  if (all.length === 0) {
    return (
      <EmptyState
        variant="no_data"
        title="No storefront users"
        description="This storefront has no registered customers yet."
      />
    );
  }

  const users = typeof limit === "number" ? all.slice(0, limit) : all;

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card key={user.id} className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                {user.name}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {user.email}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(user.totalSpent)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user.ordersCount} orders
              </p>
            </div>
            <Badge variant={statusVariant[user.status]} size="sm">
              {user.status}
            </Badge>
          </div>
        </Card>
      ))}

      {typeof limit === "number" && all.length > limit && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          +{all.length - limit} more customers
        </p>
      )}
    </div>
  );
}