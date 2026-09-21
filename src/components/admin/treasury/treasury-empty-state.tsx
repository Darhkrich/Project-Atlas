"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";

interface TreasuryEmptyStateProps {
  hasFilters: boolean;
}

export function TreasuryEmptyState({ hasFilters }: TreasuryEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        variant="no_results"
        title="No treasury events match the filters"
        description="Try widening the date range or clearing the direction filter."
      />
    );
  }

  return (
    <EmptyState
      variant="no_data"
      title="No treasury events yet"
      description="Order settlements, wallet funding, provider payouts, and refunds will appear here."
    />
  );
}