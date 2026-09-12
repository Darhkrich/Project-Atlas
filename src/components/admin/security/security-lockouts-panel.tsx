// components/admin/security/security-lockouts-panel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { LockedAccount } from "@/lib/admin/types/security";

interface SecurityLockoutsPanelProps {
  entries: LockedAccount[];
  onUnlock: (id: string) => void;
}

export function SecurityLockoutsPanel({
  entries,
  onUnlock,
}: SecurityLockoutsPanelProps) {
  const now = useNow();

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Locked accounts{" "}
          <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
            ({entries.length})
          </span>
        </CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Accounts locked out after too many failed login attempts. They
          auto-unlock when the lockout window expires.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning-200 bg-warning-50/60 p-3 dark:border-warning-800/60 dark:bg-warning-900/20"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {entry.adminName}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {entry.adminEmail}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {entry.attemptCount} attempts from{" "}
                <span className="font-mono">{entry.lastAttemptFrom}</span>
                {entry.countryCode && ` · ${entry.countryCode}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Unlocks{" "}
                <time
                  dateTime={entry.unlocksAt}
                  title={formatAbsolute(entry.unlocksAt)}
                >
                  {formatRelative(entry.unlocksAt, now)}
                </time>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnlock(entry.id)}
              >
                Unlock now
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}