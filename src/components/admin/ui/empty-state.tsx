// components/admin/ui/empty-state.tsx

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "no_data" | "no_results";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {title}
      </p>

      {description && (
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}

      {action && <div className="mt-3">{action}</div>}

      {variant === "no_results" && !action && (
        <span className="sr-only">
          Try adjusting or clearing your filters.
        </span>
      )}
    </div>
  );
}