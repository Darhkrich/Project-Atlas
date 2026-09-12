// components/admin/audit-logs/audit-log-empty-state.tsx
"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";
import { Button } from "@/components/admin/ui/button";

interface AuditLogEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function AuditLogEmptyState({
  hasActiveFilters,
  onClearFilters,
}: AuditLogEmptyStateProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {hasActiveFilters ? (
        <EmptyState
          variant="no_results"
          title="No entries match these filters"
          description="Try a broader time range, clear the actor or action filter, or reset everything."
          action={
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          variant="no_data"
          title="No audit entries yet"
          description="Actions performed by admins are recorded here automatically."
        />
      )}
    </div>
  );
}