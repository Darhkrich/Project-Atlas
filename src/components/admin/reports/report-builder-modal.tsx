/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/reports/report-builder-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import {
  ALL_FORMATS,
  ALL_SECTION_SCOPES,
  FORMAT_AVAILABLE,
  FORMAT_HINT,
  FORMAT_LABEL,
  REPORT_SECTIONS_FOR_TYPE,
  REPORT_TYPE_DESCRIPTION,
  REPORT_TYPE_LABEL,
  SECTION_SCOPE_LABEL,
} from "@/lib/admin/reports/constants";
import { defaultDateRange } from "@/lib/admin/reports/generators";
import type {
  Report,
  ReportFilter,
  ReportFormat,
  ReportSectionScope,
  ReportType,
  SavedReportTemplate,
} from "@/lib/admin/types/report";

interface ReportBuilderModalProps {
  open: boolean;
  initialFilter: ReportFilter | null;
  availableReports: Report[];
  savedTemplates: SavedReportTemplate[];
  onClose: () => void;
  onGenerate: (filter: ReportFilter) => void;
  onSaveTemplate: (name: string, filter: ReportFilter) => void;
}

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function ReportBuilderModal({
  open,
  initialFilter,
  availableReports,
  savedTemplates,
  onClose,
  onGenerate,
  onSaveTemplate,
}: ReportBuilderModalProps) {
  const defaults = useMemo(() => defaultDateRange(), []);

  const [filter, setFilter] = useState<ReportFilter>(
    initialFilter ?? {
      reportType: "daily_sales",
      section: "all",
      dateFrom: defaults.dateFrom,
      dateTo: defaults.dateTo,
      format: "csv",
    }
  );
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialFilter) setFilter(initialFilter);
    setTemplateName("");
    setSavingTemplate(false);
    setError(null);
  }, [open, initialFilter]);

  const report = availableReports.find((r) => r.type === filter.reportType);
  const allowedScopes = REPORT_SECTIONS_FOR_TYPE[filter.reportType] ?? ["all"];

  useEffect(() => {
    if (!allowedScopes.includes(filter.section)) {
      const fallback = allowedScopes[0] ?? "all";
      setFilter((prev) => ({ ...prev, section: fallback }));
    }
  }, [allowedScopes, filter.section]);

  const validate = (): string | null => {
    if (!filter.dateFrom) return "Choose a start date.";
    if (!filter.dateTo) return "Choose an end date.";
    if (new Date(filter.dateFrom) > new Date(filter.dateTo)) {
      return "The start date must be before the end date.";
    }
    return null;
  };

  const handleGenerate = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onGenerate(filter);
    onClose();
  };

  const handleSaveTemplate = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const trimmed = templateName.trim();
    if (!trimmed) {
      setError("Give the template a name.");
      return;
    }
    onSaveTemplate(trimmed, filter);
    setSavingTemplate(false);
    setTemplateName("");
    setError(null);
  };

  const applyTemplate = (templateId: string) => {
    const tmpl = savedTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    setFilter({
      reportType: tmpl.reportType,
      section: tmpl.section,
      dateFrom: tmpl.dateFrom,
      dateTo: tmpl.dateTo,
      format: tmpl.format,
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Generate report"
      description={
        report
          ? `${report.name} · ${REPORT_TYPE_DESCRIPTION[filter.reportType]}`
          : "Choose a report type and range."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {savingTemplate ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSavingTemplate(false);
                  setTemplateName("");
                }}
              >
                Back
              </Button>
              <Button size="sm" onClick={handleSaveTemplate}>
                Save template
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSavingTemplate(true)}
              >
                Save as template
              </Button>
              <Button size="sm" onClick={handleGenerate}>
                Generate CSV
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {savedTemplates.length > 0 && (
          <SettingsField
            label="Load from template"
            htmlFor="builder-template"
            hint="Pre-fills the report type, section, range, and format."
          >
            <select
              id="builder-template"
              className={selectClass}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) applyTemplate(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Choose a template…</option>
              {savedTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </SettingsField>
        )}

        <SettingsField label="Report type" htmlFor="builder-type" required>
          <select
            id="builder-type"
            className={selectClass}
            value={filter.reportType}
            onChange={(e) => {
              const nextType = e.target.value as ReportType;
              const nextScopes = REPORT_SECTIONS_FOR_TYPE[nextType] ?? ["all"];
              setFilter((prev) => ({
                ...prev,
                reportType: nextType,
                section: nextScopes.includes(prev.section)
                  ? prev.section
                  : nextScopes[0] ?? "all",
              }));
            }}
          >
            {availableReports.map((r) => (
              <option key={r.type} value={r.type}>
                {r.name}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Section"
          htmlFor="builder-section"
          hint={
            allowedScopes.length === 1
              ? "This report only applies to one section."
              : "Narrow the report to a single Atlas surface."
          }
        >
          <select
            id="builder-section"
            className={selectClass}
            value={filter.section}
            onChange={(e) =>
              setFilter({
                ...filter,
                section: e.target.value as ReportSectionScope,
              })
            }
            disabled={allowedScopes.length === 1}
          >
            {ALL_SECTION_SCOPES.filter((scope) =>
              allowedScopes.includes(scope)
            ).map((scope) => (
              <option key={scope} value={scope}>
                {SECTION_SCOPE_LABEL[scope]}
              </option>
            ))}
          </select>
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="From" htmlFor="builder-from" required>
            <Input
              id="builder-from"
              type="date"
              value={filter.dateFrom}
              max={filter.dateTo || undefined}
              onChange={(e) =>
                setFilter({ ...filter, dateFrom: e.target.value })
              }
            />
          </SettingsField>
          <SettingsField label="To" htmlFor="builder-to" required>
            <Input
              id="builder-to"
              type="date"
              value={filter.dateTo}
              min={filter.dateFrom || undefined}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
            />
          </SettingsField>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Export format
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {ALL_FORMATS.map((format: ReportFormat) => {
              const isAvailable = FORMAT_AVAILABLE[format];
              const isSelected = filter.format === format;
              return (
                <label
                  key={format}
                  className={
                    isSelected
                      ? "flex cursor-pointer flex-col gap-1 rounded-md border border-brand-500 bg-brand-50 p-3 text-xs dark:border-brand-500 dark:bg-brand-900/30"
                      : "flex cursor-pointer flex-col gap-1 rounded-md border border-neutral-200 p-3 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  }
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="report-format"
                      value={format}
                      checked={isSelected}
                      disabled={!isAvailable}
                      onChange={() => setFilter({ ...filter, format })}
                      className="h-4 w-4"
                    />
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {FORMAT_LABEL[format]}
                    </span>
                    {!isAvailable && (
                      <Badge variant="neutral" size="sm">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  {FORMAT_HINT[format] && (
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {FORMAT_HINT[format]}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        {report && (
          <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              This report contains
            </p>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              {report.columns.join(" · ")}
            </p>
          </div>
        )}

        {savingTemplate && (
          <SettingsField
            label="Template name"
            htmlFor="builder-template-name"
            hint="You'll be able to load this template from the builder next time."
            required
          >
            <Input
              id="builder-template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Monthly sales - last 30 days"
            />
          </SettingsField>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}