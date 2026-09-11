/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReportSummaryCards } from "@/components/admin/reported-accounts/report-summary-cards";
import { ReportFilters } from "@/components/admin/reported-accounts/report-filters";
import { ReportCard } from "@/components/admin/reported-accounts/report-card";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { CustomerReport, Customer } from "@/lib/admin/types/customer";
import { cn } from "@/lib/utils";

interface ReportWithCustomer extends CustomerReport {
  customerId: string;
  customerName: string;
}

const PAGE_SIZE = 10;

export default function ReportedAccountsPage() {
  const [reports, setReports] = useState<ReportWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [confirmSuspend, setConfirmSuspend] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    reporterType: string;
  }>({
    search: "",
    status: "",
    reporterType: "",
  });

  useEffect(() => {
    setTimeout(() => {
      const data = mockCustomers.flatMap((c) =>
        (c.reports || []).map((r) => ({
          ...r,
          customerId: c.id,
          customerName: c.name,
        }))
      );
      setReports(data);
      setLoading(false);
    }, 500);
  }, []);

  const selectedCustomer: Customer | null = useMemo(() => {
    if (!selectedCustomerId) return null;
    return mockCustomers.find((c) => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId]);

  // Filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (
        filters.search &&
        !r.customerName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !r.reporterName.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.reporterType && r.reporterType !== filters.reporterType)
        return false;
      return true;
    });
  }, [reports, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);
  const paginated = filteredReports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Summary data
  const summaryData = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    actionTaken: reports.filter((r) => r.status === "action_taken").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  // Handlers
  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "", reporterType: "" });
    setPage(1);
  };

  const handleTakeAction = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "action_taken" as const,
              actionTimestamp: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleDismiss = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "dismissed" as const,
              actionTimestamp: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleSuspend = (customerId: string) => {
    setConfirmSuspend(customerId);
  };

  const confirmSuspendCustomer = () => {
    if (!confirmSuspend) return;
    // Update the reports to show action taken
    setReports((prev) =>
      prev.map((r) =>
        r.customerId === confirmSuspend && r.status === "pending"
          ? {
              ...r,
              status: "action_taken" as const,
              actionTaken: "Account suspended",
              actionTimestamp: new Date().toISOString(),
            }
          : r
      )
    );
    console.log(`Suspended customer ${confirmSuspend}`);
    setConfirmSuspend(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export reports as ${format}`);
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reported Accounts"
        description="Review and act on reports submitted by resellers and merchants."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <ReportSummaryCards
        data={summaryData}
        onFilterAll={() => filterByStatus("")}
        onFilterPending={() => filterByStatus("pending")}
        onFilterActionTaken={() => filterByStatus("action_taken")}
        onFilterDismissed={() => filterByStatus("dismissed")}
      />

      <ReportFilters onFilterChange={handleFilterChange} />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {filteredReports.length} report
          {filteredReports.length === 1 ? "" : "s"}
          {Object.values(filters).some((v) => v) ? " (filtered)" : ""}
        </span>
      </div>

      {/* Report list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <AtlasIcon
            name="check"
            className="mx-auto h-8 w-8 text-success-500"
          />
          <p className="mt-2 text-sm text-neutral-500">
            {Object.values(filters).some((v) => v)
              ? "No reports match your filters."
              : "No reported accounts. All clear!"}
          </p>
          {Object.values(filters).some((v) => v) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={resetFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewCustomer={handleViewCustomer}
              onTakeAction={handleTakeAction}
              onDismiss={handleDismiss}
              onSuspend={handleSuspend}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Customer detail drawer */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Suspend confirmation */}
      <ConfirmDialog
        open={confirmSuspend !== null}
        title="Confirm Suspend Customer"
        description="Are you sure you want to suspend this customer account? This restricts their access immediately."
        confirmLabel="Suspend"
        danger
        onConfirm={confirmSuspendCustomer}
        onCancel={() => setConfirmSuspend(null)}
      />
    </div>
  );
}