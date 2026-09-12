// components/admin/security/security-two-factor-panel.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { TwoFactorStatus } from "@/lib/admin/types/security";

interface SecurityTwoFactorPanelProps {
  entries: TwoFactorStatus[];
  requireTwoFactor: boolean;
  onNudgeMissing: () => void;
}

type Filter = "all" | "enabled" | "missing";

export function SecurityTwoFactorPanel({
  entries,
  requireTwoFactor,
  onNudgeMissing,
}: SecurityTwoFactorPanelProps) {
  const [filter, setFilter] = useState<Filter>("missing");
  const now = useNow();

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    if (filter === "enabled") return entries.filter((e) => e.enabled);
    return entries.filter((e) => !e.enabled);
  }, [entries, filter]);

  const enabledCount = entries.filter((e) => e.enabled).length;
  const missingCount = entries.length - enabledCount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Two-factor authentication</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {requireTwoFactor
              ? "Required by policy. Admins without 2FA are locked out at their next login."
              : "Not required by policy. Consider enabling it in Settings → Security."}
          </p>
        </div>
        {missingCount > 0 && (
          <Button variant="outline" size="sm" onClick={onNudgeMissing}>
            Nudge {missingCount} missing
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {enabledCount} enrolled · {missingCount} missing
          </span>
          <div className="ml-auto inline-flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-700">
            {(["missing", "enabled", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "rounded px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }
              >
                {f === "missing" ? "Missing" : f === "enabled" ? "Enrolled" : "All"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {filter === "missing"
              ? "Every admin has 2FA enrolled."
              : filter === "enabled"
              ? "No admins have 2FA enrolled yet."
              : "No admins found."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.adminName}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.adminEmail}
                  </p>
                  {entry.enabled && entry.lastVerifiedAt && (
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                      Last verified{" "}
                      <time
                        dateTime={entry.lastVerifiedAt}
                        title={formatAbsolute(entry.lastVerifiedAt)}
                      >
                        {formatRelative(entry.lastVerifiedAt, now)}
                      </time>
                    </p>
                  )}
                </div>
                <Badge variant={entry.enabled ? "success" : "warning"}>
                  {entry.enabled ? "Enrolled" : "Not enrolled"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}