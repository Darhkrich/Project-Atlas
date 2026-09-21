/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import type { AutoApproveConfig } from "@/lib/admin/types/merchant-money";

interface Props {
  open: boolean;
  config: AutoApproveConfig | null;
  submitting: boolean;
  onSubmit: (patch: {
    thresholdGHS: number;
    feeRatePercent: number;
    dailyCap: number;
  }) => void;
  onClose: () => void;
}

export function AutoApproveConfigModal({
  open,
  config,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [threshold, setThreshold] = useState("5000");
  const [feeRate, setFeeRate] = useState("0.5");
  const [dailyCap, setDailyCap] = useState("2");

  useEffect(() => {
    if (open && config) {
      setThreshold(String(config.thresholdGHS));
      setFeeRate(String(config.feeRatePercent));
      setDailyCap(String(config.dailyCap));
    }
  }, [open, config]);

  if (!config) return null;

  const thresholdNum = Number(threshold);
  const feeNum = Number(feeRate);
  const capNum = Number(dailyCap);
  const invalid =
    !Number.isFinite(thresholdNum) ||
    thresholdNum < 0 ||
    !Number.isFinite(feeNum) ||
    feeNum < 0 ||
    feeNum > 100 ||
    !Number.isFinite(capNum) ||
    capNum < 0 ||
    !Number.isInteger(capNum);

  return (
    <ModalShell open={open} onClose={onClose} title="Auto-approve rules">
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Applies to new withdrawals only. Withdrawals already in the queue keep
          the rules they were evaluated under.
        </p>

        <div>
          <label
            htmlFor="threshold"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Threshold (GHS)
          </label>
          <Input
            id="threshold"
            aria-label="Auto-approve threshold in GHS"
            inputMode="decimal"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Amount plus fee at or below this auto-approves when details match,
            no open dispute, and the daily cap is not reached.
          </p>
        </div>

        <div>
          <label
            htmlFor="fee"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Withdrawal fee (%)
          </label>
          <Input
            id="fee"
            aria-label="Withdrawal fee percentage"
            inputMode="decimal"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Deducted from the settlement wallet alongside the withdrawal amount.
          </p>
        </div>

        <div>
          <label
            htmlFor="cap"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Daily cap
          </label>
          <Input
            id="cap"
            aria-label="Daily withdrawal cap"
            inputMode="numeric"
            value={dailyCap}
            onChange={(e) => setDailyCap(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Counts non-rejected withdrawals per merchant per calendar day.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={invalid || submitting}
            onClick={() =>
              onSubmit({
                thresholdGHS: thresholdNum,
                feeRatePercent: feeNum,
                dailyCap: capNum,
              })
            }
          >
            {submitting ? "Saving" : "Save rules"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}