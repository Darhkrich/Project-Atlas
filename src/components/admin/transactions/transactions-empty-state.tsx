"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";

interface TransactionsEmptyStateProps {
  hasFilters: boolean;
}

export function TransactionsEmptyState({
  hasFilters,
}: TransactionsEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        variant="no_results"
        title="No transactions match the filters"
        description="Try widening the date range or clearing the kind filter."
      />
    );
  }

  return (
    <EmptyState
      variant="no_data"
      title="No transactions yet"
      description="Money movements from orders, wallet funding, withdrawals, commission credits, and refunds will appear here."
    />
  );
}