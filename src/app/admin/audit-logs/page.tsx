/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { AuditLogDetailDrawer } from "@/components/admin/security/audit-log-detail-drawer";
import { mockAuditLogs } from "@/lib/admin/mock/audit-logs";
import { AuditLogEntry } from "@/lib/admin/types/audit-log";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setTimeout(() => {
      setLogs(mockAuditLogs);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-audit-log-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-audit-log-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filtered = logs.filter(log => {
    if (search && !log.admin.toLowerCase().includes(search.toLowerCase()) &&
        !log.resource.toLowerCase().includes(search.toLowerCase()) &&
        !log.resourceId.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (resultFilter && log.result !== resultFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedLogs = filtered.slice((page - 1) * pageSize, page * pageSize);

  const actions = Array.from(new Set(logs.map(l => l.action)));

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export audit logs as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews(prev => [...prev, { name, filters: { search, actionFilter, resultFilter } }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setActionFilter(view.filters.actionFilter || "");
    setResultFilter(view.filters.resultFilter || "");
    setPage(1);
  };

  const handleDeleteView = (name: string) => {
    setSavedViews(prev => prev.filter(v => v.name !== name));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        description="Immutable record of security-relevant admin actions."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search admin or resource..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          {actions.map(action => <option key={action} value={action}>{action}</option>)}
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={resultFilter}
          onChange={e => { setResultFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedLogs.length === 0 ? (
            <Card><CardContent>No audit logs found.</CardContent></Card>
          ) : (
            paginatedLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/50">
                <div className="min-w-0">
                  <p className="font-medium truncate">{log.admin} {log.action} {log.resource}</p>
                  <p className="text-xs text-neutral-500">{log.resourceId} · {log.ip}</p>
                  <p className="text-xs text-neutral-400">{formatTimestamp(log.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={log.result === "success" ? "success" : "danger"}>{log.result}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>View</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages} · {filtered.length} logs
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <AuditLogDetailDrawer entry={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}