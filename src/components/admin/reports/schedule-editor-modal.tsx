/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
// components/admin/reports/schedule-editor-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import {
  ALL_SCHEDULES,
  FORMAT_AVAILABLE,
  FORMAT_LABEL,
  REPORT_SECTIONS_FOR_TYPE,
  SCHEDULE_LABEL,
  SECTION_SCOPE_LABEL,
} from "@/lib/admin/reports/constants";
import type {
  Report,
  ReportFormat,
  ReportRecipient,
  ReportSchedule,
  ReportSectionScope,
  ReportType,
  ScheduledReport,
} from "@/lib/admin/types/report";

type ScheduleDraft = Omit<ScheduledReport, "id" | "createdAt">;

interface ScheduleEditorModalProps {
  open: boolean;
  editing: ScheduledReport | null;
  availableReports: Report[];
  onClose: () => void;
  onSave: (draft: ScheduleDraft) => void;
}

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmptySchedule(report: Report | undefined): ScheduleDraft {
  const today = new Date();
  const nextRun = new Date(today.getTime() + 86_400_000);
  nextRun.setUTCHours(6, 0, 0, 0);

  return {
    reportName: report?.name ?? "",
    reportType: report?.type ?? "daily_sales",
    schedule: "daily",
    format: "csv",
    section: "all",
    recipients: [],
    deliveryMethod: "email",
    timezone: "Africa/Accra",
    nextRunAt: nextRun.toISOString(),
    enabled: true,
    lastRunAt: undefined,
    lastRunStatus: undefined,
    createdById: undefined,
    createdByName: undefined,
  };
}

export function ScheduleEditorModal({
  open,
  editing,
  availableReports,
  onClose,
  onSave,
}: ScheduleEditorModalProps) {
  const [draft, setDraft] = useState<ScheduleDraft>(() =>
    buildEmptySchedule(availableReports[0])
  );
  const [recipientInput, setRecipientInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { id: _id, createdAt: _createdAt, ...rest } = editing;
      void _id;
      void _createdAt;
      setDraft(rest);
    } else {
      setDraft(buildEmptySchedule(availableReports[0]));
    }
    setRecipientInput("");
    setError(null);
  }, [open, editing, availableReports]);

  const allowedScopes = REPORT_SECTIONS_FOR_TYPE[draft.reportType] ?? ["all"];

  useEffect(() => {
    if (!allowedScopes.includes(draft.section)) {
      setDraft((prev) => ({
        ...prev,
        section: allowedScopes[0] ?? "all",
      }));
    }
  }, [allowedScopes, draft.section]);

  const addRecipient = () => {
    const email = recipientInput.trim();
    if (!email) return;
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (draft.recipients.some((r) => r.email === email)) {
      setError("That email is already on the list.");
      return;
    }
    const recipient: ReportRecipient = {
      id: crypto.randomUUID(),
      email,
    };
    setDraft((prev) => ({
      ...prev,
      recipients: [...prev.recipients, recipient],
    }));
    setRecipientInput("");
    setError(null);
  };

  const removeRecipient = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r.id !== id),
    }));
  };

  const handleSave = () => {
    if (!draft.reportName) {
      setError("Choose a report to schedule.");
      return;
    }
    if (draft.recipients.length === 0) {
      setError("Add at least one recipient.");
      return;
    }
    setError(null);
    onSave(draft);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={editing ? "Edit scheduled report" : "Schedule a report"}
      description="Atlas will generate the report and email it to the recipients at the cadence you set. Times are in Ghana time."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            {editing ? "Save changes" : "Schedule report"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Report" htmlFor="schedule-report" required>
          <select
            id="schedule-report"
            className={selectClass}
            value={draft.reportType}
            onChange={(e) => {
              const type = e.target.value as ReportType;
              const report = availableReports.find((r) => r.type === type);
              const scopes = REPORT_SECTIONS_FOR_TYPE[type] ?? ["all"];
              setDraft((prev) => ({
                ...prev,
                reportType: type,
                reportName: report?.name ?? prev.reportName,
                section: scopes.includes(prev.section)
                  ? prev.section
                  : scopes[0] ?? "all",
              }));
            }}
            disabled={Boolean(editing)}
          >
            {availableReports.map((r) => (
              <option key={r.type} value={r.type}>
                {r.name}
              </option>
            ))}
          </select>
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Section"
            htmlFor="schedule-section"
            hint={
              allowedScopes.length === 1
                ? "This report only applies to one section."
                : undefined
            }
          >
            <select
              id="schedule-section"
              className={selectClass}
              value={draft.section}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  section: e.target.value as ReportSectionScope,
                }))
              }
              disabled={allowedScopes.length === 1}
            >
              {allowedScopes.map((scope) => (
                <option key={scope} value={scope}>
                  {SECTION_SCOPE_LABEL[scope]}
                </option>
              ))}
            </select>
          </SettingsField>

          <SettingsField label="Cadence" htmlFor="schedule-cadence" required>
            <select
              id="schedule-cadence"
              className={selectClass}
              value={draft.schedule}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  schedule: e.target.value as ReportSchedule,
                }))
              }
            >
              {ALL_SCHEDULES.map((s) => (
                <option key={s} value={s}>
                  {SCHEDULE_LABEL[s]}
                </option>
              ))}
            </select>
          </SettingsField>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Format
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["csv", "excel", "pdf"] as ReportFormat[]).map((format) => {
              const isAvailable = FORMAT_AVAILABLE[format];
              const isSelected = draft.format === format;
              return (
                <button
                  key={format}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setDraft((prev) => ({ ...prev, format }))}
                  className={
                    isSelected
                      ? "inline-flex items-center gap-2 rounded-md border border-brand-500 bg-brand-50 px-3 py-1.5 text-sm dark:border-brand-500 dark:bg-brand-900/30"
                      : "inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
                  }
                >
                  {FORMAT_LABEL[format]}
                  {!isAvailable && (
                    <Badge variant="neutral" size="sm">
                      Coming soon
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Recipients
          </legend>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Who receives the report by email.
          </p>

          <div className="mt-2 flex gap-2">
            <Input
              aria-label="Add recipient email"
              value={recipientInput}
              onChange={(e) => {
                setRecipientInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRecipient();
                }
              }}
              placeholder="name@atlas.com"
            />
            <Button variant="outline" size="sm" onClick={addRecipient}>
              Add
            </Button>
          </div>

          {draft.recipients.length === 0 ? (
            <p className="mt-2 text-xs text-warning-700 dark:text-warning-300">
              No recipients yet. Add at least one.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {draft.recipients.map((r) => (
                <li
                  key={r.id}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800"
                >
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {r.name ?? r.email}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${r.email}`}
                    onClick={() => removeRecipient(r.id)}
                    className="text-neutral-500 hover:text-danger-600 dark:text-neutral-400 dark:hover:text-danger-400"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Summary
          </p>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {SCHEDULE_LABEL[draft.schedule]} ·{" "}
            {SECTION_SCOPE_LABEL[draft.section]} · {FORMAT_LABEL[draft.format]} ·
            Ghana time
          </p>
        </div>

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