"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { mockPayoutRuns } from "@/lib/admin/mock/commissions";
import { PayoutRun, PAYOUT_RUN_STATUS_LABELS } from "@/lib/admin/types/commission";
import { formatCurrency } from "@/lib/admin/formatters";

const statusVariantMap: Record<string, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};

export function PayoutRunsView() {
  const [selected, setSelected] = useState<PayoutRun | null>(null);

  const columns: Column<PayoutRun>[] = [
    {
      key: "id",
      header: "Payout ID",
      cell: (p) => <span className="font-mono text-xs">{p.id}</span>,
    },
    {
      key: "date",
      header: "Date",
      cell: (p) => new Date(p.date).toLocaleString(),
    },
    {
      key: "total",
      header: "Total Amount",
      cell: (p) => <span className="font-semibold">{formatCurrency(p.totalAmount)}</span>,
    },
    {
      key: "resellers",
      header: "Resellers",
      cell: (p) => p.resellerCount,
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => (
        <Badge variant={statusVariantMap[p.status]}>
          {PAYOUT_RUN_STATUS_LABELS[p.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (p) => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
          View
        </Button>
      ),
    },
  ];

  const pendingCount = mockPayoutRuns.filter((p) => p.status === "pending").length;
  const completedCount = mockPayoutRuns.filter((p) => p.status === "completed").length;
  const failedCount = mockPayoutRuns.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-0 bg-success-50 shadow-sm dark:bg-success-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Completed Payouts</p>
            <p className="mt-1 text-2xl font-bold text-success-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-warning-50 shadow-sm dark:bg-warning-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Pending Payouts</p>
            <p className="mt-1 text-2xl font-bold text-warning-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-danger-50 shadow-sm dark:bg-danger-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Failed Payouts</p>
            <p className="mt-1 text-2xl font-bold text-danger-600">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payout Runs</CardTitle>
          <Button size="sm">New Payout Run</Button>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={columns}
            data={mockPayoutRuns}
            isLoading={false}
            rowKey={(p) => p.id}
            pageSize={10}
            currentPage={1}
            onPageChange={() => {}}
            emptyMessage="No payout runs found."
          />
        </CardContent>
      </Card>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Payout {selected.id}</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Date</span>
                <span>{new Date(selected.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Amount</span>
                <span className="font-semibold">
                  {formatCurrency(selected.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Resellers</span>
                <span>{selected.resellerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <Badge variant={statusVariantMap[selected.status]}>
                  {PAYOUT_RUN_STATUS_LABELS[selected.status]}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Commission IDs</p>
                <ul className="mt-1 space-y-1">
                  {selected.commissionIds.map((id) => (
                    <li key={id} className="font-mono text-xs">
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}