"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";

interface OrdersEmptyStateProps {
  hasFilters: boolean;
}

export function OrdersEmptyState({ hasFilters }: OrdersEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        variant="no_results"
        title="No orders match the filters"
        description="Try widening the date range or clearing the status filter."
      />
    );
  }

  return (
    <EmptyState
      variant="no_data"
      title="No orders yet"
      description="Orders placed through Atlas Digital Services and reseller storefronts will appear here."
    />
  );
}