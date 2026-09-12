/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/reported-accounts/report-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import type { ReportAction } from "@/lib/admin/reported-accounts/actions";
import { CATEGORY_LABEL } from "@/lib/admin/reported-accounts/constants";
import type { AggregatedReport } from "@/lib/admin/reported-accounts/helpers";

type NotifyChannel = "email" | "sms" | "push";

export type ResolveReportPayload =
  | { action: "warn"; channel: NotifyChannel; message: string }
  | { action: "suspend"; reason: string }
  | { action: "issue_refund"; amount: number; reason: string }
  | { action: "escalate"; team: string; note: string }
  | { action: "dismiss"; reason: string };

const ESCALATION_TEAMS = [
  "Fraud team",
  "Compliance",
  "Customer success",
  "Engineering",
  "Legal",
];

interface ResolveReportModalProps {
  open: boolean;
  report: AggregatedReport | null;
  action: ReportAction | null;
  onClose: () => void;
  onConfirm: (payload: ResolveReportPayload) => void;
}

export function ResolveReportModal({
  open,
  report,
  action,
  onClose,
  onConfirm,
}: ResolveReportModalProps) {
  const [channel, setChannel] = useState<NotifyChannel>("email");
  const [message, setMessage] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [escalationTeam, setEscalationTeam] = useState(ESCALATION_TEAMS[0]);
  const [escalationNote, setEscalationNote] = useState("");
  const [dismissReason, setDismissReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setChannel("email");
    setMessage("");
    setSuspendReason("");
    setRefundAmount("");
    setRefundReason("");
    setEscalationTeam(ESCALATION_TEAMS[0]);
    setEscalationNote("");
    setDismissReason("");
    setError(null);
  }, [open]);

  if (!open || !report || !action) return null;

  const submit = () => {
    switch (action) {
      case "warn": {
        const trimmed = message.trim();
        if (!trimmed) {
          setError("Write a message before sending the warning.");
          return;
        }
        onConfirm({ action: "warn", channel, message: trimmed });
        break;
      }
      case "suspend": {
        const trimmed = suspendReason.trim();
        if (trimmed.length < 8) {
          setError("Give a reason of at least 8 characters.");
          return;
        }
        onConfirm({ action: "suspend", reason: trimmed });
        break;
      }
      case "issue_refund": {
        const amount = Number(refundAmount);
        if (Number.isNaN(amount) || amount <= 0) {
          setError("Enter a positive refund amount.");
          return;
        }
        const trimmed = refundReason.trim();
        if (trimmed.length < 8) {
          setError("Give a reason of at least 8 characters.");
          return;
        }
        onConfirm({ action: "issue_refund", amount, reason: trimmed });
        break;
      }
      case "escalate": {
        const trimmed = escalationNote.trim();
        if (!trimmed) {
          setError("Add a note explaining the escalation.");
          return;
        }
        onConfirm({ action: "escalate", team: escalationTeam, note: trimmed });
        break;
      }
      case "dismiss": {
        const trimmed = dismissReason.trim();
        if (trimmed.length < 8) {
          setError("Give a reason of at least 8 characters.");
          return;
        }
        onConfirm({ action: "dismiss", reason: trimmed });
        break;
      }
    }
    onClose();
  };

  const titleFor: Record<ReportAction, string> = {
    warn: "Send warning",
    suspend: "Suspend account",
    issue_refund: "Issue refund",
    escalate: "Escalate report",
    dismiss: "Dismiss report",
  };

  const confirmLabelFor: Record<ReportAction, string> = {
    warn: "Send warning",
    suspend: "Suspend account",
    issue_refund: "Issue refund",
    escalate: "Escalate",
    dismiss: "Dismiss",
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={titleFor[action]}
      description={`${CATEGORY_LABEL[report.category]} report against ${
        report.accountName
      }, filed by ${report.reporterName}.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={action === "suspend" ? "destructive" : "primary"}
            onClick={submit}
          >
            {confirmLabelFor[action]}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Report summary
          </p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {report.reason}
          </p>
          {report.details && (
            <p className="mt-1 text-neutral-500 dark:text-neutral-500">
              {report.details}
            </p>
          )}
        </div>

        {action === "warn" && (
          <>
            <SettingsField label="Channel" htmlFor="report-warn-channel">
              <select
                id="report-warn-channel"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                value={channel}
                onChange={(e) => setChannel(e.target.value as NotifyChannel)}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </SettingsField>

            <SettingsField
              label="Warning message"
              htmlFor="report-warn-message"
              required
              hint="Delivered to the customer and recorded on the account."
            >
              <textarea
                id="report-warn-message"
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                placeholder="Explain the issue and what the customer must do to avoid further action."
              />
            </SettingsField>
          </>
        )}

        {action === "suspend" && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/25">
            <p className="font-medium text-danger-800 dark:text-danger-200">
              Account will be suspended
            </p>
            <p className="mt-1 text-danger-700 dark:text-danger-300">
              {report.accountName} will be signed out and blocked from placing
              new orders on {report.storefrontName}. Their history is
              preserved.
            </p>
          </div>
        )}

        {action === "suspend" && (
          <SettingsField
            label="Suspension reason"
            htmlFor="report-suspend-reason"
            required
            hint="Recorded on both the report and the customer's audit trail."
          >
            <textarea
              id="report-suspend-reason"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={suspendReason}
              onChange={(e) => {
                setSuspendReason(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Confirmed fraudulent payment method across two orders"
            />
          </SettingsField>
        )}

        {action === "issue_refund" && (
          <>
            <SettingsField
              label="Refund amount (GHS)"
              htmlFor="report-refund-amount"
              required
            >
              <Input
                id="report-refund-amount"
                type="number"
                min={0}
                step={0.01}
                value={refundAmount}
                onChange={(e) => {
                  setRefundAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
              />
            </SettingsField>

            <SettingsField
              label="Refund reason"
              htmlFor="report-refund-reason"
              required
            >
              <textarea
                id="report-refund-reason"
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                rows={3}
                value={refundReason}
                onChange={(e) => {
                  setRefundReason(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Delivery dispute resolved in customer's favour"
              />
            </SettingsField>
          </>
        )}

        {action === "escalate" && (
          <>
            <SettingsField label="Team" htmlFor="report-escalate-team">
              <select
                id="report-escalate-team"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                value={escalationTeam}
                onChange={(e) => setEscalationTeam(e.target.value)}
              >
                {ESCALATION_TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField
              label="Escalation note"
              htmlFor="report-escalate-note"
              required
              hint="Context for the receiving team."
            >
              <textarea
                id="report-escalate-note"
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                rows={4}
                value={escalationNote}
                onChange={(e) => {
                  setEscalationNote(e.target.value);
                  setError(null);
                }}
                placeholder="What should the receiving team investigate?"
              />
            </SettingsField>
          </>
        )}

        {action === "dismiss" && (
          <SettingsField
            label="Dismissal reason"
            htmlFor="report-dismiss-reason"
            required
            hint="Why is this report being closed without action?"
          >
            <textarea
              id="report-dismiss-reason"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={dismissReason}
              onChange={(e) => {
                setDismissReason(e.target.value);
                setError(null);
              }}
              placeholder="e.g. No policy violation found on review"
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

        {action === "issue_refund" && refundAmount && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Refund of {formatCurrency(Number(refundAmount) || 0)} will be
            queued for processing.
          </p>
        )}
      </div>
    </ModalShell>
  );
}