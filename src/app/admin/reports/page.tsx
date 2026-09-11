/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import {
  mockAvailableReports,
  mockSavedTemplates,
  mockReportHistory,
  mockScheduledReports,
} from "@/lib/admin/mock/reports";
import {
  ReportFilter,
  SavedReportTemplate,
  ScheduledReport,
} from "@/lib/admin/types/report";

// Deterministic formatter
function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"available" | "saved">("available");
  const [search, setSearch] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [confirmGenerate, setConfirmGenerate] = useState<ReportFilter | null>(null);
  const [filter, setFilter] = useState<ReportFilter>({
    reportType: "daily_sales",
    dateFrom: "",
    dateTo: "",
    format: "csv",
  });
  const [templates, setTemplates] = useState<SavedReportTemplate[]>(mockSavedTemplates);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>(mockScheduledReports);

  const filteredReports = mockAvailableReports.filter(
    r =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    console.log("Generating report with filter:", filter);
    setConfirmGenerate(null);
    setShowBuilder(false);
  };

  const handleSaveTemplate = () => {
    const newTemplate: SavedReportTemplate = {
      id: `SRT-${Date.now()}`,
      name: `Template ${templates.length + 1}`,
      ...filter,
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleApplyTemplate = (templateId: string) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setFilter({
        reportType: tmpl.reportType,
        dateFrom: tmpl.dateFrom,
        dateTo: tmpl.dateTo,
        format: tmpl.format,
      });
      setShowBuilder(true);
    }
  };

  const toggleScheduled = (id: string) => {
    setScheduled(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Generate and manage operational reports."
        actions={<Button size="sm" onClick={() => setShowBuilder(true)}>Generate Report</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "available" ? "border-brand-600 text-brand-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Available Reports
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "saved" ? "border-brand-600 text-brand-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Saved & Scheduled
        </button>
      </div>

      {activeTab === "available" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search reports..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle>{report.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">{report.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">Columns: {report.columns.join(", ")}</p>
                  {report.lastGenerated && (
                    <p className="text-xs text-neutral-400 mt-1">Last generated: {formatTimestamp(report.lastGenerated)}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setFilter(prev => ({ ...prev, reportType: report.type }));
                      setShowBuilder(true);
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === "saved" && (
        <div className="space-y-6">
          {/* Saved Templates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-sm text-neutral-400">No saved templates.</p>
              ) : (
                <div className="space-y-2">
                  {templates.map(tmpl => (
                    <div key={tmpl.id} className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900">
                      <span>{tmpl.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleApplyTemplate(tmpl.id)}>Apply</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Reports */}
          <Card>
            <CardHeader><CardTitle>Scheduled Reports</CardTitle></CardHeader>
            <CardContent>
              {scheduled.length === 0 ? (
                <p className="text-sm text-neutral-400">No scheduled reports.</p>
              ) : (
                <div className="space-y-2">
                  {scheduled.map(sched => (
                    <div key={sched.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{sched.reportName}</span>
                        <Badge variant={sched.enabled ? "success" : "neutral"}>{sched.enabled ? "Enabled" : "Disabled"}</Badge>
                        <span className="text-xs text-neutral-500 ml-2">Next: {formatTimestamp(sched.nextRunAt)}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toggleScheduled(sched.id)}>
                        {sched.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report History */}
          <Card>
            <CardHeader><CardTitle>Report History</CardTitle></CardHeader>
            <CardContent>
              {mockReportHistory.length === 0 ? (
                <p className="text-sm text-neutral-400">No generated reports yet.</p>
              ) : (
                <ul className="space-y-2">
                  {mockReportHistory.map(item => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.fileName}</span>
                      <span className="text-xs text-neutral-500">{formatTimestamp(item.generatedAt)}</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBuilder(false)} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Generate Report</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Report Type</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={filter.reportType}
                  onChange={e => setFilter({ ...filter, reportType: e.target.value as ReportFilter["reportType"] })}
                >
                  {mockAvailableReports.map(r => <option key={r.type} value={r.type}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Input type="date" placeholder="From" value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })} />
                <Input type="date" placeholder="To" value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Export Format</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={filter.format}
                  onChange={e => setFilter({ ...filter, format: e.target.value as ReportFilter["format"] })}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setConfirmGenerate(filter)}>Generate</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <ConfirmDialog
        open={confirmGenerate !== null}
        title="Confirm Generate Report"
        description={`Generate report with current filters?`}
        confirmLabel="Generate"
        onConfirm={handleGenerate}
        onCancel={() => setConfirmGenerate(null)}
      />
    </div>
  );
}