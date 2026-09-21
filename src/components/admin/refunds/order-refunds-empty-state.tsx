"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";

interface OrderRefundsEmptyStateProps {
  hasFilters: boolean;
}

export function OrderRefundsEmptyState({
  hasFilters,
}: OrderRefundsEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        variant="no_results"
        title="No refunds match the filters"
        description="Try widening the date range or clearing the status filter."
      />
    );
  }

  return (
    <EmptyState
      variant="no_data"
      title="No order refunds yet"
      description="Automatic refunds and admin-approved refund requests will appear here."
    />
  );
}