// components/admin/ui/environment-badge.tsx

import { cn } from "@/lib/utils";
import type { PlatformEnvironment } from "@/lib/admin/types/settings";
import {
  ENVIRONMENT_LABEL,
  ENVIRONMENT_VARIANT,
} from "@/lib/admin/settings/constant";

interface EnvironmentBadgeProps {
  environment: PlatformEnvironment;
  className?: string;
}

const variantClass: Record<PlatformEnvironment, string> = {
  development:
    "bg-neutral-100 text-neutral-700 ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-600",
  staging:
    "bg-warning-50 text-warning-800 ring-warning-300 dark:bg-warning-900/25 dark:text-warning-200 dark:ring-warning-700",
  production:
    "bg-danger-50 text-danger-800 ring-danger-300 dark:bg-danger-900/25 dark:text-danger-200 dark:ring-danger-700",
};

export function EnvironmentBadge({
  environment,
  className,
}: EnvironmentBadgeProps) {
  void ENVIRONMENT_VARIANT;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        variantClass[environment],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          environment === "production" && "bg-danger-500",
          environment === "staging" && "bg-warning-500",
          environment === "development" && "bg-neutral-400"
        )}
        aria-hidden="true"
      />
      {ENVIRONMENT_LABEL[environment]}
    </span>
  );
}