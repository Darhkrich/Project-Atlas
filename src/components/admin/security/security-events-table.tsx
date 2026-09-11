"use client";

import { useState } from "react";
import { SecurityEvent } from "@/lib/admin/types/security";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";

interface SecurityEventsTableProps {
  events: SecurityEvent[];
}

const severityVariantMap = {
  info: "info",
  warning: "warning",
  critical: "danger",
} as const;

const typeLabelMap: Record<string, string> = {
  login_success: "Login Success",
  login_failure: "Login Failure",
  logout: "Logout",
  password_change: "Password Change",
  role_change: "Role Change",
  permission_change: "Permission Change",
  wallet_adjustment: "Wallet Adjustment",
  api_key_change: "API Key Change",
  suspicious_activity: "Suspicious Activity",
  ip_blocked: "IP Blocked",
  ip_unblocked: "IP Unblocked",
};

export function SecurityEventsTable({ events }: SecurityEventsTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(events.length / pageSize);
  const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr className="text-left text-xs font-semibold text-neutral-500">
              <th className="px-4 py-3">Event Type</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map(event => (
              <tr key={event.id} className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3">{typeLabelMap[event.type] || event.type}</td>
                <td className="px-4 py-3">{event.user}</td>
                <td className="px-4 py-3 font-mono text-xs">{event.ip}</td>
                <td className="px-4 py-3">
                  <Badge variant={severityVariantMap[event.severity]}>{event.severity}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{new Date(event.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages} · {events.length} events
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Security Event</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
            <div className="p-4 space-y-4">
              <div><p className="text-sm text-neutral-500">Type</p><p className="font-medium">{typeLabelMap[selectedEvent.type]}</p></div>
              <div><p className="text-sm text-neutral-500">User</p><p className="font-medium">{selectedEvent.user}</p></div>
              <div><p className="text-sm text-neutral-500">IP</p><p className="font-mono">{selectedEvent.ip}</p></div>
              <div><p className="text-sm text-neutral-500">Severity</p><Badge variant={severityVariantMap[selectedEvent.severity]}>{selectedEvent.severity}</Badge></div>
              <div><p className="text-sm text-neutral-500">Timestamp</p><p>{new Date(selectedEvent.timestamp).toLocaleString()}</p></div>
              {selectedEvent.details && <div><p className="text-sm text-neutral-500">Details</p><p>{selectedEvent.details}</p></div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}