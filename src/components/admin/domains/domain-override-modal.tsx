/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { StorefrontDomain } from "@/lib/domains/types";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";

const MIN_REASON_LENGTH = 8;

export type DomainOverrideMode = "force-verify" | "force-fail";

interface DomainOverrideModalProps {
  open: boolean;
  mode: DomainOverrideMode;
  domain: StorefrontDomain | null;
  storefrontName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function DomainOverrideModal({
  open,
  mode,
  domain,
  storefrontName,
  onClose,
  onConfirm,
}: DomainOverrideModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open, mode]);

  if (!open || !domain || !domain.customDomain) return null;

  const hostname = domain.customDomain.hostname;
  const isVerify = mode === "force-verify";

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(
        "Reason must be at least " +
          MIN_REASON_LENGTH +
          " characters. This is written to the audit log."
      );
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isVerify ? "Force verify domain" : "Mark domain as failed"}
      description={
        isVerify
          ? "Overrides the DNS check. Use when the owner has configured DNS correctly but the automatic check has not confirmed it."
          : "Marks the domain as failed without running a check. Use when support has confirmed the owner's DNS is incorrect."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isVerify ? "primary" : "destructive"}
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isVerify ? "Force verify" : "Mark as failed"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Storefront
            </span>
            <span className="font-medium">{storefrontName}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Hostname
            </span>
            <span className="font-mono text-xs">{hostname}</span>
          </div>
        </div>

        <div
          className={cn(
            "rounded-md border p-3 text-xs",
            isVerify
              ? "border-info-200 bg-info-50 text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-100"
              : "border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100"
          )}
        >
          <p className="font-medium">What happens next</p>
          <p className="mt-1">
            {isVerify
              ? "The domain is marked verified immediately and becomes the storefront's primary address. The action is recorded in the audit log with your reason."
              : "The domain is marked as failed and stops being the primary address. The owner can retry verification from their dashboard. The action is recorded in the audit log with your reason."}
          </p>
        </div>

        <SettingsField
          label="Reason for override"
          htmlFor="domain-override-reason"
          required
          hint="Stored in the audit log. Visible to other admins."
          error={error ?? undefined}
        >
          <textarea
            id="domain-override-reason"
            className={cn(
              "min-h-[88px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder={
              isVerify
                ? "e.g. Owner confirmed DNS setup during support call. Checked externally and record is live."
                : "e.g. Owner's CNAME points to a third-party host. Confirmed with DNS lookup."
            }
            autoFocus
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {trimmed.length} / {MIN_REASON_LENGTH} minimum characters
        </p>
      </div>
    </ModalShell>
  );
}