// components/admin/audit-logs/financial-audit-detail-drawer.tsx
"use client";

import { useId, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import {
  extractChangeMetadata,
  type FinancialAuditRow,
} from "@/lib/admin/audit-logs/financial-projection";

interface FinancialAuditDetailDrawerProps {
  row: FinancialAuditRow | null;
  onClose: () => void;
}

function Copyable({
  value,
  mono,
  label,
}: {
  value: string;
  mono?: boolean;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span className={mono ? "truncate font-mono" : "truncate"}>{value}</span>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={handleCopy}
        className="shrink-0 rounded px-1 text-[10px] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-900 dark:text-neutral-100">
        {children}
      </dd>
    </>
  );
}

export function FinancialAuditDetailDrawer({
  row,
  onClose,
}: FinancialAuditDetailDrawerProps) {
  const isOpen = row !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const now = useNow();

  if (!row) return null;

  const change = extractChangeMetadata(row.metadata);

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              Financial audit entry
            </h2>
            <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {row.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" size="sm">
              {row.resourceLabel}
            </Badge>
            {row.section && (
              <Badge variant="brand" size="sm">
                {SECTION_LABEL[row.section]}
              </Badge>
            )}
          </div>

          <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
            <Field label="Action">{row.actionLabel}</Field>
            <Field label="Action code">
              <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                {row.action}
              </span>
            </Field>

            <Field label="Actor">
              <p>{row.actorName}</p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {row.actorEmail}
              </p>
            </Field>

            <Field label="Resource">
              {row.resourceLabel}{" "}
              <span className="ml-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                <Copyable
                  value={row.resourceId}
                  mono
                  label="resource ID"
                />
              </span>
            </Field>

            <Field label="Time">
              <time
                dateTime={row.timestamp}
                title={formatAbsolute(row.timestamp)}
              >
                {formatRelative(row.timestamp, now)}
              </time>
            </Field>
          </dl>

          {change && (
            <div className="space-y-3">
              {(change.previousValue !== undefined ||
                change.newValue !== undefined) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Change
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-danger-200 bg-danger-50 p-3 dark:border-danger-800/60 dark:bg-danger-900/20">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-danger-700 dark:text-danger-300">
                        Before
                      </p>
                      <p className="mt-1 break-words text-sm text-neutral-900 dark:text-neutral-100">
                        {change.previousValue ?? "\u2014"}
                      </p>
                    </div>
                    <div className="rounded-md border border-success-200 bg-success-50 p-3 dark:border-success-800/60 dark:bg-success-900/20">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-success-700 dark:text-success-300">
                        After
                      </p>
                      <p className="mt-1 break-words text-sm text-neutral-900 dark:text-neutral-100">
                        {change.newValue ?? "\u2014"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {change.reason && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Reason
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
                    {change.reason}
                  </p>
                </div>
              )}

              {change.other.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Details
                  </p>
                  <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-xs">
                    {change.other.map(({ key, value }) => (
                      <Field key={key} label={key}>
                        <span className="break-words">{value}</span>
                      </Field>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}