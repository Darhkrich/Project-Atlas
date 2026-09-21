/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { Reseller } from "@/lib/admin/types/reseller";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  warningsForApprove,
  warningsForReactivate,
  type StorefrontOperationWarning,
} from "@/lib/admin/resellers/storefront-projection";
import { STOREFRONT_STATUS_LABEL } from "@/lib/admin/resellers/storefront-labels";

const MIN_REASON_LENGTH = 10;

export type StorefrontActionMode = "approve" | "disable" | "reactivate";

interface StorefrontActionModalProps {
  open: boolean;
  mode: StorefrontActionMode;
  storefront: UnifiedStorefront | null;
  owner: Reseller | undefined;
  onClose: () => void;
  onApprove: () => void;
  onDisable: (reason: string) => void;
  onReactivate: () => void;
}

export function StorefrontActionModal({
  open,
  mode,
  storefront,
  owner,
  onClose,
  onApprove,
  onDisable,
  onReactivate,
}: StorefrontActionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open, mode]);

  if (!open || !storefront) return null;

  const warnings: StorefrontOperationWarning[] =
    mode === "approve"
      ? warningsForApprove(owner)
      : mode === "reactivate"
      ? warningsForReactivate(owner)
      : [];

  const trimmedReason = reason.trim();
  const reasonValid = trimmedReason.length >= MIN_REASON_LENGTH;

  const handleSubmit = () => {
    if (mode === "disable") {
      if (!reasonValid) {
        setError(
          `Reason must be at least ${MIN_REASON_LENGTH} characters.`
        );
        return;
      }
      onDisable(trimmedReason);
    } else if (mode === "approve") {
      onApprove();
    } else {
      onReactivate();
    }
    onClose();
  };

  const title =
    mode === "approve"
      ? "Approve storefront"
      : mode === "disable"
      ? "Disable storefront"
      : "Reactivate storefront";

  const description =
    mode === "approve"
      ? `${storefront.storeName} becomes publicly visible at its URL.`
      : mode === "disable"
      ? `${storefront.storeName} goes offline immediately. Customers cannot place new orders.`
      : `${storefront.storeName} becomes publicly visible again.`;

  const submitLabel =
    mode === "approve"
      ? "Approve storefront"
      : mode === "disable"
      ? "Disable storefront"
      : "Reactivate storefront";

  const submitVariant = mode === "disable" ? "destructive" : "primary";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={submitVariant}
            size="sm"
            onClick={handleSubmit}
            disabled={mode === "disable" && !reasonValid}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <Row label="Storefront" value={storefront.storeName} strong />
          <Row label="Owner" value={storefront.ownerName} />
          <Row
            label="Current status"
            value={STOREFRONT_STATUS_LABEL[storefront.status]}
          />
          <Row
            label="Revenue (30d)"
            value={formatCurrency(storefront.revenue30d)}
          />
          <Row label="Users" value={String(storefront.usersCount)} />
        </div>

        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w) => (
              <div
                key={w.kind}
                role="alert"
                className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100"
              >
                <AtlasIcon
                  name="alert"
                  aria-hidden="true"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}

        {mode === "disable" && (
          <SettingsField
            label="Reason"
            htmlFor="storefront-disable-reason"
            required
            hint="Stored on the storefront and visible in its detail view."
            error={error ?? undefined}
          >
            <textarea
              id="storefront-disable-reason"
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
              placeholder="e.g. Reseller's storefront is showing incorrect pricing. Disabling until resolved."
              autoFocus
            />
          </SettingsField>
        )}

        {mode === "disable" && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {trimmedReason.length} / {MIN_REASON_LENGTH} minimum characters
          </p>
        )}
      </div>
    </ModalShell>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={cn(strong ? "font-semibold" : "font-medium")}>
        {value}
      </span>
    </div>
  );
}