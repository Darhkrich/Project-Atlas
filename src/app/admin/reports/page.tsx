// app/(admin)/reports/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import {
  ReportsTabs,
  type ReportsTabKey,
} from "@/components/admin/reports/reports-tabs";
import { ReportCard } from "@/components/admin/reports/report-card";
import { EmptyTabState } from "@/components/admin/reports/empty-tab-state";
import { ReportBuilderModal } from "@/components/admin/reports/report-builder-modal";
import { ScheduleEditorModal } from "@/components/admin/reports/schedule-editor-modal";
import { SavedTemplatesPanel } from "@/components/admin/reports/saved-templates-panel";
import { ScheduledReportsPanel } from "@/components/admin/reports/scheduled-reports-panel";
import { ReportHistoryPanel } from "@/components/admin/reports/report-history-panel";
import {
  mockAvailableReports,
  mockReportHistory,
  mockSavedTemplates,
  mockScheduledReports,
} from "@/lib/admin/mock/reports";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  generateReport,
  defaultDateRange,
} from "@/lib/admin/reports/generators";
import { RETENTION_DAYS } from "@/lib/admin/reports/constants";
import type {
  Report,
  ReportFilter,
  ReportHistoryItem,
  SavedReportTemplate,
  ScheduledReport,
} from "@/lib/admin/types/report";

const CURRENT_ADMIN = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
};

const DEFAULT_FILTERS = { tab: "available" };

type ToastKind = "success" | "error";

interface Toast {
  kind: ToastKind;
  text: string;
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsPageInner />
    </Suspense>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-8 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ReportsPageInner() {
  const { filters, setFilter } = useUrlFilters(DEFAULT_FILTERS);
  const activeTab = (filters.tab as ReportsTabKey) ?? "available";

  const [templates, setTemplates] = useState<SavedReportTemplate[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderFilter, setBuilderFilter] = useState<ReportFilter | null>(null);
  const [scheduleEditor, setScheduleEditor] = useState<{
    open: boolean;
    editing: ScheduledReport | null;
  }>({ open: false, editing: null });
  const [toast, setToast] = useState<Toast | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<ReportHistoryItem | null>(
    null
  );

  const now = useNow();

  useEffect(() => {
    const t = window.setTimeout(() => {
      setTemplates(mockSavedTemplates);
      setScheduled(mockScheduledReports);
      setHistory(mockReportHistory);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockAvailableReports;
    return mockAvailableReports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [search]);

  const handleOpenBuilder = (report?: Report) => {
    const defaults = defaultDateRange();
    setBuilderFilter(
      report
        ? {
            reportType: report.type,
            section: report.sectionScopes.includes("all")
              ? "all"
              : report.sectionScopes[0] ?? "all",
            dateFrom: defaults.dateFrom,
            dateTo: defaults.dateTo,
            format: "csv",
          }
        : null
    );
    setBuilderOpen(true);
  };

  const handleGenerate = (filter: ReportFilter) => {
    if (filter.format !== "csv") {
      setToast({
        kind: "error",
        text: `${filter.format.toUpperCase()} is not available yet. CSV only for now.`,
      });
      return;
    }

    const { csv, rowCount, fileName, fileSizeBytes } = generateReport(filter);
    downloadCsv(fileName, csv);

    const reportName =
      mockAvailableReports.find((r) => r.type === filter.reportType)?.name ??
      filter.reportType;

    const newItem: ReportHistoryItem = {
      id: crypto.randomUUID(),
      reportName,
      reportType: filter.reportType,
      generatedAt: new Date().toISOString(),
      generatedById: CURRENT_ADMIN.id,
      generatedByName: CURRENT_ADMIN.name,
      fileName,
      format: filter.format,
      section: filter.section,
      rowCount,
      fileSizeBytes,
      expiresAt: new Date(
        Date.now() + RETENTION_DAYS * 86_400_000
      ).toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
    setToast({
      kind: "success",
      text: `Generated ${fileName} (${rowCount} rows).`,
    });
  };

  const handleSaveTemplate = (name: string, filter: ReportFilter) => {
    const tmpl: SavedReportTemplate = {
      id: crypto.randomUUID(),
      name,
      reportType: filter.reportType,
      section: filter.section,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      format: filter.format,
      createdAt: new Date().toISOString(),
      createdById: CURRENT_ADMIN.id,
      createdByName: CURRENT_ADMIN.name,
    };
    setTemplates((prev) => [tmpl, ...prev]);
    setToast({ kind: "success", text: `Saved template "${name}".` });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setToast({ kind: "success", text: "Template deleted." });
  };

  const handleApplyTemplate = (tmpl: SavedReportTemplate) => {
    setBuilderFilter({
      reportType: tmpl.reportType,
      section: tmpl.section,
      dateFrom: tmpl.dateFrom,
      dateTo: tmpl.dateTo,
      format: tmpl.format,
    });
    setBuilderOpen(true);
  };

  const handleToggleSchedule = (id: string) => {
    setScheduled((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
    const target = scheduled.find((s) => s.id === id);
    if (target) {
      setToast({
        kind: "success",
        text: `${target.reportName} ${target.enabled ? "disabled" : "enabled"}.`,
      });
    }
  };

  const handleSaveSchedule = (
    draft: Omit<ScheduledReport, "id" | "createdAt">
  ) => {
    if (scheduleEditor.editing) {
      const editingId = scheduleEditor.editing.id;
      setScheduled((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...draft } : s))
      );
      setToast({ kind: "success", text: "Schedule updated." });
    } else {
      const newSchedule: ScheduledReport = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdById: CURRENT_ADMIN.id,
        createdByName: CURRENT_ADMIN.name,
      };
      setScheduled((prev) => [newSchedule, ...prev]);
      setToast({ kind: "success", text: "Report scheduled." });
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduled((prev) => prev.filter((s) => s.id !== id));
    setToast({ kind: "success", text: "Schedule removed." });
  };

  const handleGenerateNow = (sched: ScheduledReport) => {
    const defaults = defaultDateRange();
    const filter: ReportFilter = {
      reportType: sched.reportType,
      section: sched.section,
      dateFrom: defaults.dateFrom,
      dateTo: defaults.dateTo,
      format: sched.format,
    };
    if (sched.format !== "csv") {
      setToast({
        kind: "error",
        text: `${sched.format.toUpperCase()} is not available yet.`,
      });
      return;
    }
    const { csv, rowCount, fileName, fileSizeBytes } = generateReport(filter, {
      seedSuffix: sched.id,
    });
    downloadCsv(fileName, csv);

    const newItem: ReportHistoryItem = {
      id: crypto.randomUUID(),
      reportName: sched.reportName,
      reportType: sched.reportType,
      generatedAt: new Date().toISOString(),
      generatedById: CURRENT_ADMIN.id,
      generatedByName: CURRENT_ADMIN.name,
      fileName,
      format: sched.format,
      section: sched.section,
      rowCount,
      fileSizeBytes,
      expiresAt: new Date(
        Date.now() + RETENTION_DAYS * 86_400_000
      ).toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);

    setScheduled((prev) =>
      prev.map((s) =>
        s.id === sched.id
          ? {
              ...s,
              lastRunAt: new Date().toISOString(),
              lastRunStatus: "success",
            }
          : s
      )
    );

    setToast({
      kind: "success",
      text: `Ran ${sched.reportName} (${rowCount} rows).`,
    });
  };

  const handleConfirmDownload = () => {
    if (!downloadTarget) return;
    const filter: ReportFilter = {
      reportType: downloadTarget.reportType,
      section: downloadTarget.section,
      dateFrom: defaultDateRange().dateFrom,
      dateTo: defaultDateRange().dateTo,
      format: downloadTarget.format,
    };
    const { csv, fileName } = generateReport(filter, {
      seedSuffix: downloadTarget.id,
    });
    downloadCsv(fileName, csv);
    setDownloadTarget(null);
    setToast({ kind: "success", text: `Downloaded ${fileName}.` });
  };

  const headerMeta = useMemo(() => {
    const lastRun = history[0]?.generatedAt;
    const enabledCount = scheduled.filter((s) => s.enabled).length;

    return (
      <>
        <span>{mockAvailableReports.length} report types</span>
        <span aria-hidden="true">·</span>
        <span>{enabledCount} scheduled</span>
        {lastRun && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Last generation{" "}
              <time dateTime={lastRun} title={formatAbsolute(lastRun)}>
                {formatRelative(lastRun, now)}
              </time>
            </span>
          </>
        )}
      </>
    );
  }, [history, scheduled, now]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Generate and manage operational reports."
        meta={headerMeta}
        actions={
          <Button size="sm" onClick={() => handleOpenBuilder()}>
            Generate report
          </Button>
        }
      />

      <ReportsTabs
        activeTab={activeTab}
        onChange={(tab) => setFilter("tab", tab)}
      />

      {activeTab === "available" && (
        <div
          role="tabpanel"
          id="report-panel-available"
          aria-labelledby="report-tab-available"
          className="space-y-4"
        >
          <Input
            aria-label="Search available reports"
            placeholder="Search reports..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading reports"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <EmptyTabState
                title="No reports match"
                description="Try a different search term."
                action={{
                  label: "Clear search",
                  onClick: () => setSearch(""),
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onGenerate={handleOpenBuilder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div
          role="tabpanel"
          id="report-panel-saved"
          aria-labelledby="report-tab-saved"
          className="space-y-6"
        >
          <SavedTemplatesPanel
            templates={templates}
            onApply={handleApplyTemplate}
            onDelete={handleDeleteTemplate}
            onCreate={() => handleOpenBuilder()}
          />

          <ScheduledReportsPanel
            reports={scheduled}
            onToggle={handleToggleSchedule}
            onEdit={(schedule) =>
              setScheduleEditor({ open: true, editing: schedule })
            }
            onDelete={handleDeleteSchedule}
            onGenerateNow={handleGenerateNow}
            onCreate={() => setScheduleEditor({ open: true, editing: null })}
          />

          <ReportHistoryPanel
            items={history}
            onDownload={(item) => setDownloadTarget(item)}
          />
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}

      <ReportBuilderModal
        open={builderOpen}
        initialFilter={builderFilter}
        availableReports={mockAvailableReports}
        savedTemplates={templates}
        onClose={() => setBuilderOpen(false)}
        onGenerate={handleGenerate}
        onSaveTemplate={handleSaveTemplate}
      />

      <ScheduleEditorModal
        open={scheduleEditor.open}
        editing={scheduleEditor.editing}
        availableReports={mockAvailableReports}
        onClose={() => setScheduleEditor({ open: false, editing: null })}
        onSave={handleSaveSchedule}
      />

      <ConfirmDialog
        open={downloadTarget !== null}
        title="Download report?"
        description={
          downloadTarget
            ? `${downloadTarget.fileName} will be regenerated from the current data and downloaded. Historic file contents cannot be restored.`
            : ""
        }
        confirmLabel="Download"
        onConfirm={handleConfirmDownload}
        onCancel={() => setDownloadTarget(null)}
      />
    </div>
  );
}