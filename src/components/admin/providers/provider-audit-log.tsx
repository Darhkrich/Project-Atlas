/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { AuditEntry } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";

export function ProviderAuditLog({ providerId, auditLogs }: { providerId: string; auditLogs: AuditEntry[] }) {
  const exportCsv = () => {
    const csv = "Timestamp,Admin,Action\n" + auditLogs.map(e => `${e.timestamp},${e.admin},${e.action}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Audit Log</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-neutral-400">No audit entries.</p>
        ) : (
          <ul className="space-y-2">
            {auditLogs.map(log => (
              <li key={log.id} className="text-sm">
                <span className="font-medium">{log.admin}</span> {log.action}
                {log.previousValue && log.newValue && (
                  <span className="text-neutral-500"> ({log.previousValue} → {log.newValue})</span>
                )}
                {log.reason && <span className="text-neutral-500"> · {log.reason}</span>}
                <span className="text-xs text-neutral-400"> · {new Date(log.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}