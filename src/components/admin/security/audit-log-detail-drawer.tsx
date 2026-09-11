"use client";

import { AuditLogEntry } from "@/lib/admin/types/audit-log";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";

interface AuditLogDetailDrawerProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditLogDetailDrawer({ entry, onClose }: AuditLogDetailDrawerProps) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Audit Log Entry</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-sm text-neutral-500">Timestamp</p>
            <p className="font-medium">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Admin</p>
            <p className="font-medium">{entry.admin}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Action</p>
            <p className="font-medium">{entry.action}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Resource</p>
            <p className="font-medium">{entry.resource} ({entry.resourceId})</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">IP Address</p>
            <p className="font-mono text-sm">{entry.ip}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Result</p>
            <Badge variant={entry.result === "success" ? "success" : "danger"}>{entry.result}</Badge>
          </div>
          {entry.previousValue && entry.newValue && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Previous Value</p>
                <p className="font-medium">{entry.previousValue}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">New Value</p>
                <p className="font-medium">{entry.newValue}</p>
              </div>
            </div>
          )}
          {entry.userAgent && (
            <div>
              <p className="text-sm text-neutral-500">User Agent</p>
              <p className="text-xs text-neutral-400">{entry.userAgent}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}