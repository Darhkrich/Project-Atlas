// components/admin/audit-logs/audit-log-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ACTION_LABEL,
  RESOURCE_KIND_LABEL,
  RESULT_VARIANT,
  SOURCE_LABEL,
  SOURCE_PATH,
} from "@/lib/admin/audit-logs/constants";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import type { AuditLogEntry } from "@/lib/admin/types/audit-log";

interface AuditLogDetailDrawerProps {
  entry: AuditLogEntry | null;
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

export function AuditLogDetailDrawer({
  entry,
  onClose,
}: AuditLogDetailDrawerProps) {
  const isOpen = entry !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const now = useNow();

  if (!entry) return null;

  const sourcePath = entry.source ? SOURCE_PATH[entry.source] : null;

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
              Audit log entry
            </h2>
            <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {entry.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={RESULT_VARIANT[entry.result]}>
              {entry.result}
            </Badge>
            {entry.section && (
              <Badge variant="brand" size="sm">
                {SECTION_LABEL[entry.section]}
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {RESOURCE_KIND_LABEL[entry.resourceKind]}
            </Badge>
          </div>

          <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
            <Field label="Action">{ACTION_LABEL[entry.action]}</Field>

            <Field label="Actor">
              <p>{entry.actorName ?? entry.admin}</p>
              {entry.actorName && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.admin}
                </p>
              )}
            </Field>

            <Field label="Resource">
              {entry.resource}{" "}
              <span className="ml-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                <Copyable
                  value={entry.resourceId}
                  mono
                  label="resource ID"
                />
              </span>
            </Field>

            <Field label="Time">
              <time
                dateTime={entry.timestamp}
                title={formatAbsolute(entry.timestamp)}
              >
                {formatRelative(entry.timestamp, now)}
              </time>
            </Field>

            <Field label="IP">
              <Copyable value={entry.ip} mono label="IP address" />
            </Field>

            {entry.source && (
              <Field label="Source">
                {sourcePath ? (
                  <Link
                    href={sourcePath}
                    className="text-brand-700 hover:underline dark:text-brand-300"
                  >
                    {SOURCE_LABEL[entry.source]}
                  </Link>
                ) : (
                  SOURCE_LABEL[entry.source]
                )}
              </Field>
            )}

            {entry.userAgent && (
              <Field label="User agent">
                <span className="break-words text-xs text-neutral-600 dark:text-neutral-400">
                  {entry.userAgent}
                </span>
              </Field>
            )}

            {entry.sessionId && (
              <Field label="Session">
                <Link
                  href={`/admin/security?sessionId=${entry.sessionId}`}
                  className="font-mono text-xs text-brand-700 hover:underline dark:text-brand-300"
                >
                  {entry.sessionId}
                </Link>
              </Field>
            )}

            {entry.relatedSecurityEventId && (
              <Field label="Security event">
                <Link
                  href={`/admin/security?eventId=${entry.relatedSecurityEventId}`}
                  className="font-mono text-xs text-brand-700 hover:underline dark:text-brand-300"
                >
                  {entry.relatedSecurityEventId}
                </Link>
              </Field>
            )}
          </dl>

          {(entry.previousValue !== undefined ||
            entry.newValue !== undefined) && (
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
                    {entry.previousValue ?? "—"}
                  </p>
                </div>
                <div className="rounded-md border border-success-200 bg-success-50 p-3 dark:border-success-800/60 dark:bg-success-900/20">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-success-700 dark:text-success-300">
                    After
                  </p>
                  <p className="mt-1 break-words text-sm text-neutral-900 dark:text-neutral-100">
                    {entry.newValue ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {entry.reason && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Reason
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
                {entry.reason}
              </p>
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