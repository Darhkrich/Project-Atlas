// components/admin/audit-logs/audit-log-pagination.tsx
"use client";

import { Button } from "@/components/admin/ui/button";

interface AuditLogPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function AuditLogPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: AuditLogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Audit log pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Page {page} of {totalPages} · {totalCount.toLocaleString("en-GH")}{" "}
        entries
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}