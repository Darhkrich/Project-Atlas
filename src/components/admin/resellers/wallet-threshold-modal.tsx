/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { ResellerCommissionConfig } from "@/lib/admin/types/reseller-commission-wallet";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import {
  THRESHOLD_BOUNDS,
  FEE_PERCENT_BOUNDS,
} from "@/lib/admin/resellers/wallet-mutations";

interface Props {
  open: boolean;
  config: ResellerCommissionConfig | null;
  submitting: boolean;
  onSubmit: (patch: {
    withdrawalApprovalThreshold: number;
    withdrawalFeePercent: number;
  }) => void;
  onClose: () => void;
}

export function WalletThresholdModal({
  open,
  config,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [thresholdRaw, setThresholdRaw] = useState("");
  const [feeRaw, setFeeRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !config) return;
    setThresholdRaw(String(config.withdrawalApprovalThreshold));
    setFeeRaw(String(config.withdrawalFeePercent));
    setError(null);
  }, [open, config]);

  if (!config) return null;

  const thresholdNum = Number(thresholdRaw);
  const feeNum = Number(feeRaw);

  const thresholdValid =
    Number.isFinite(thresholdNum) &&
    Number.isInteger(thresholdNum) &&
    thresholdNum >= THRESHOLD_BOUNDS.min &&
    thresholdNum <= THRESHOLD_BOUNDS.max;

  const feeValid =
    Number.isFinite(feeNum) &&
    feeNum >= FEE_PERCENT_BOUNDS.min &&
    feeNum <= FEE_PERCENT_BOUNDS.max;

  const valid = thresholdValid && feeValid;

  const handleSubmit = () => {
    if (!thresholdValid) {
      setError(
        "Threshold must be a whole number between " +
          THRESHOLD_BOUNDS.min +
          " and " +
          THRESHOLD_BOUNDS.max +
          "."
      );
      return;
    }
    if (!feeValid) {
      setError(
        "Fee rate must be between " +
          FEE_PERCENT_BOUNDS.min +
          " and " +
          FEE_PERCENT_BOUNDS.max +
          "."
      );
      return;
    }
    onSubmit({
      withdrawalApprovalThreshold: thresholdNum,
      withdrawalFeePercent: feeNum,
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Reseller withdrawal rules"
      description="Threshold for admin approval and the Atlas fee on each withdrawal."
    >
      <div className="space-y-4">
        <SettingsField
          label="Approval threshold (GHS)"
          htmlFor="threshold"
          hint={
            "Bank Transfer and Mobile Money withdrawals whose amount plus fee is at or below this auto-approve when the reseller's commission balance covers the total. Wallet Credit withdrawals always auto-approve."
          }
        >
          <Input
            id="threshold"
            inputMode="numeric"
            aria-label="Withdrawal approval threshold in GHS"
            value={thresholdRaw}
            onChange={(e) => {
              setThresholdRaw(e.target.value);
              setError(null);
            }}
          />
        </SettingsField>

        <SettingsField
          label="Atlas fee rate (%)"
          htmlFor="fee"
          hint="Atlas takes this percentage of each withdrawal amount, charged on top of the amount. Deducted from the reseller's wallet ledger alongside the amount."
        >
          <Input
            id="fee"
            inputMode="decimal"
            aria-label="Withdrawal fee percentage"
            value={feeRaw}
            onChange={(e) => {
              setFeeRaw(e.target.value);
              setError(null);
            }}
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Currently threshold GHS{" "}
          <span className="font-medium">
            {config.withdrawalApprovalThreshold.toLocaleString("en-GH")}
          </span>
          , fee{" "}
          <span className="font-medium">{config.withdrawalFeePercent}%</span>.
          Last changed by {config.updatedBy}.
        </p>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting ? "Saving" : "Save rules"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}