// components/admin/ui/sla-indicator.tsx

import { cn } from "@/lib/utils";
import { dotClassByTone, type StatusTone } from "@/lib/admin/support/status-styles";

type SlaState = "healthy" | "at_risk" | "breached" | "unknown";

const AT_RISK_WINDOW_MS = 2 * 60 * 60 * 1000;

const stateTone: Record<SlaState, StatusTone> = {
  healthy: "success",
  at_risk: "warning",
  breached: "danger",
  unknown: "neutral",
};

const stateLabel: Record<SlaState, string> = {
  healthy: "On track",
  at_risk: "At risk",
  breached: "Breached",
  unknown: "No SLA",
};

function computeState(
  dueAt: string | undefined,
  now: number | null
): SlaState {
  if (!dueAt || now === null) return "unknown";
  const remaining = new Date(dueAt).getTime() - now;
  if (Number.isNaN(remaining)) return "unknown";
  if (remaining <= 0) return "breached";
  if (remaining <= AT_RISK_WINDOW_MS) return "at_risk";
  return "healthy";
}

function formatRemaining(dueAt: string, now: number): string {
  const diff = new Date(dueAt).getTime() - now;
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let value: string;
  if (minutes < 1) value = "under a minute";
  else if (minutes < 60) value = `${minutes}m`;
  else if (hours < 24) value = `${hours}h ${minutes % 60}m`;
  else value = `${days}d ${hours % 24}h`;

  return diff >= 0 ? `Due in ${value}` : `Breached ${value} ago`;
}

interface SlaIndicatorProps {
  dueAt?: string;
  now: number | null;
  variant?: "inline" | "bar";
  createdAt?: string;
  className?: string;
}

export function SlaIndicator({
  dueAt,
  now,
  variant = "inline",
  createdAt,
  className,
}: SlaIndicatorProps) {
  const state = computeState(dueAt, now);
  const tone = stateTone[state];
  const label = dueAt && now !== null ? formatRemaining(dueAt, now) : stateLabel[state];

  if (variant === "bar" && dueAt && createdAt && now !== null) {
    const start = new Date(createdAt).getTime();
    const end = new Date(dueAt).getTime();
    const total = end - start;
    const elapsed = now - start;
    const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100;

    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            SLA
          </span>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {label}
          </span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label={`SLA progress: ${label}`}
        >
          <div
            className={cn("h-full rounded-full transition-all", dotClassByTone[tone])}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        tone === "success" && "text-success-700 dark:text-success-300",
        tone === "warning" && "text-warning-700 dark:text-warning-300",
        tone === "danger" && "text-danger-700 dark:text-danger-300",
        tone === "neutral" && "text-neutral-500 dark:text-neutral-400",
        className
      )}
      title={dueAt ? `SLA due ${new Date(dueAt).toISOString()}` : undefined}
    >
      <StatusDotInline tone={tone} />
      {label}
    </span>
  );
}

function StatusDotInline({ tone }: { tone: StatusTone }) {
  return (
    <span
      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClassByTone[tone])}
      aria-hidden="true"
    />
  );
}