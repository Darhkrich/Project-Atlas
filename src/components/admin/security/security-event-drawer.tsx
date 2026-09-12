// components/admin/security/security-event-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  EVENT_TYPE_LABEL,
  RESOURCE_KIND_LABEL,
  SEVERITY_LABEL,
  SEVERITY_VARIANT,
  isBlockableEvent,
} from "@/lib/admin/security/constants";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import type { SecurityEvent } from "@/lib/admin/types/security";

interface SecurityEventDrawerProps {
  event: SecurityEvent | null;
  relatedEvents: SecurityEvent[];
  actorDisplay: string;
  onClose: () => void;
  onBlockIP: (ip: string) => void;
  onEndSessionsFromIP: (ip: string) => void;
  onMarkHandled: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onOpenRelated: (id: string) => void;
}

export function SecurityEventDrawer({
  event,
  relatedEvents,
  actorDisplay,
  onClose,
  onBlockIP,
  onEndSessionsFromIP,
  onMarkHandled,
  onAddNote,
  onOpenRelated,
}: SecurityEventDrawerProps) {
  const isOpen = event !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const now = useNow();
  const [noteDraft, setNoteDraft] = useState("");

  if (!event) return null;

  const canBlock = isBlockableEvent(event.type) && event.ip !== "system";

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
              Security event
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {EVENT_TYPE_LABEL[event.type]}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={SEVERITY_VARIANT[event.severity]}>
              {SEVERITY_LABEL[event.severity]}
            </Badge>
            {event.section && (
              <Badge variant="brand" size="sm">
                {SECTION_LABEL[event.section]}
              </Badge>
            )}
            {event.handled && (
              <Badge variant="success" size="sm">
                Handled
              </Badge>
            )}
          </div>

          <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-neutral-500 dark:text-neutral-400">Type</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {EVENT_TYPE_LABEL[event.type]}
            </dd>

            <dt className="text-neutral-500 dark:text-neutral-400">User</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              <p>{actorDisplay}</p>
              {event.actorName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {event.user}
                </p>
              )}
            </dd>

            <dt className="text-neutral-500 dark:text-neutral-400">IP</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {event.ip}
              </span>
              {event.countryCode && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {event.countryCode}
                </span>
              )}
            </dd>

            <dt className="text-neutral-500 dark:text-neutral-400">Time</dt>
            <dd>
              <time
                dateTime={event.timestamp}
                title={formatAbsolute(event.timestamp)}
                className="text-neutral-900 dark:text-neutral-100"
              >
                {formatRelative(event.timestamp, now)}
              </time>
            </dd>

            {event.resourceKind && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Resource
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {RESOURCE_KIND_LABEL[event.resourceKind]}
                  {event.resourceId && (
                    <span className="ml-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {event.resourceId}
                    </span>
                  )}
                </dd>
              </>
            )}

            {event.userAgent && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  User agent
                </dt>
                <dd className="break-words text-xs text-neutral-600 dark:text-neutral-400">
                  {event.userAgent}
                </dd>
              </>
            )}

            {event.details && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Details
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {event.details}
                </dd>
              </>
            )}

            {event.note && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Note
                </dt>
                <dd className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
                  {event.note}
                </dd>
              </>
            )}
          </dl>

          {relatedEvents.length > 1 && (
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                Other events from {event.ip} (
                {relatedEvents.length - 1} in the current view)
              </p>
              <ul className="mt-2 space-y-1">
                {relatedEvents
                  .filter((r) => r.id !== event.id)
                  .slice(0, 5)
                  .map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onOpenRelated(r.id)}
                        className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {EVENT_TYPE_LABEL[r.type]}
                        </span>
                        <time
                          dateTime={r.timestamp}
                          className="text-neutral-500 dark:text-neutral-400"
                        >
                          {formatRelative(r.timestamp, now)}
                        </time>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {event.resourceKind === "admin_user" && event.resourceId && (
            <div>
              <Link
                href={`/admin/audit-logs?resourceId=${event.resourceId}`}
                className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                View related entries in Audit log
              </Link>
            </div>
          )}

          <div className="space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Add a note
            </p>
            <div className="flex gap-2">
              <Input
                aria-label="Add a note to this event"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Context for other admins"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!noteDraft.trim()}
                onClick={() => {
                  onAddNote(event.id, noteDraft.trim());
                  setNoteDraft("");
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          {canBlock && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBlockIP(event.ip)}
            >
              Block {event.ip}
            </Button>
          )}
          {event.ip !== "system" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEndSessionsFromIP(event.ip)}
            >
              End sessions from IP
            </Button>
          )}
          {!event.handled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkHandled(event.id)}
            >
              Mark handled
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}