/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Provider,
  ProviderAuditEntry,
  ProviderAuditScope,
} from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { providerAuditToCsv } from "@/lib/admin/providers/csv-export";

interface ProviderAuditLogProps {
  provider: Provider;
  auditLog: ProviderAuditEntry[];
}

const PAGE_SIZE = 10;
const SCOPES: (ProviderAuditScope | "")[] = [
  "",
  "provider",
  "service",
  "routing",
  "configuration",
  "credentials",
];

export function ProviderAuditLog({
  provider,
  auditLog,
}: ProviderAuditLogProps) {
  const now = useNow();
  const [scope, setScope] = useState<ProviderAuditScope | "">("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setScope("");
  }, [provider.id]);

  const sorted = useMemo(
    () =>
      [...auditLog].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [auditLog]
  );

  const filtered = scope ? sorted.filter((e) => e.scope === scope) : sorted;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleExport = () => {
    const csv = providerAuditToCsv(provider, filtered);
    downloadCsv(
      `atlas-provider-${provider.id}-audit-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      csv
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Audit log</CardTitle>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter audit by scope"
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as ProviderAuditScope | "");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            {SCOPES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? titleCase(s) : "All scopes"}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {sorted.length === 0
              ? "No audit entries recorded."
              : "No entries match this scope."}
          </p>
        ) : (
          <>
            <ul role="list" className="space-y-3">
              {visible.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0 dark:border-neutral-800"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {titleCase(entry.scope)}
                      </Badge>
                      <p className="text-sm font-medium">{entry.action}</p>
                    </div>
                    {(entry.previousValue || entry.newValue) && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {entry.previousValue && (
                          <>
                            <span className="line-through">
                              {entry.previousValue}
                            </span>
                            {" → "}
                          </>
                        )}
                        {entry.newValue}
                      </p>
                    )}
                    {entry.reason && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Reason: {entry.reason}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {entry.admin}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
                    title={formatDateTime(entry.timestamp)}
                  >
                    {formatRelative(entry.timestamp, now)}
                  </span>
                </li>
              ))}
            </ul>
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="mt-3 text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}