"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatAbsolute } from "@/lib/shared/format";
import { cn } from "@/lib/utils";

export function GreetingStrip({
  firstName,
  roleLabel,
  attentionCount,
}: {
  firstName: string;
  roleLabel: string;
  attentionCount: number;
}) {
  const now = useNow();

  const hour = now ? new Date(now).getUTCHours() : null;
  const greeting =
    hour === null
      ? "Hello"
      : hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const statusTone: "quiet" | "attention" =
    attentionCount > 0 ? "attention" : "quiet";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {greeting}, {firstName}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {roleLabel}
          {now && (
            <>
              <span aria-hidden="true"> · </span>
              {formatAbsolute(new Date(now).toISOString())}
            </>
          )}
        </p>
      </div>

      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
          statusTone === "attention"
            ? "bg-warning-50 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
            : "bg-success-50 text-success-800 dark:bg-success-900/30 dark:text-success-200"
        )}
      >
        <AtlasIcon
          name={statusTone === "attention" ? "alert" : "check-circle"}
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
        {attentionCount > 0
          ? attentionCount +
            " item" +
            (attentionCount === 1 ? "" : "s") +
            " need attention"
          : "All clear"}
      </div>
    </div>
  );
}