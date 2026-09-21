"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import type { WalletAutoApproveConfig } from "@/lib/admin/types/customer-wallet";
import {
  WALLET_APPROVAL_THRESHOLD_BOUNDS,
  WALLET_FEE_PERCENT_BOUNDS,
  WALLET_DAILY_CAP_BOUNDS,
} from "@/lib/admin/wallets/wallet-constants";

interface Props {
  open: boolean;
  config: WalletAutoApproveConfig | null;
  submitting: boolean;
  onSubmit: (patch: {
    thresholdGHS: number;
    feeRatePercent: number;
    dailyCap: number;
  }) => void;
  onClose: () => void;
}

export function WalletAutoApproveConfigModal({
  open,
  config,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [threshold, setThreshold] = useState("");
  const [feeRate, setFeeRate] = useState("");
  const [dailyCap, setDailyCap] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !config) return;
    setThreshold(String(config.thresholdGHS));
    setFeeRate(String(config.feeRatePercent));
    setDailyCap(String(config.dailyCap));
    setError(null);
  }, [open, config]);

  if (!config) return null;

  const tNum = Number(threshold);
  const fNum = Number(feeRate);
  const cNum = Number(dailyCap);

  const tValid =
    Number.isFinite(tNum) &&
    Number.isInteger(tNum) &&
    tNum >= WALLET_APPROVAL_THRESHOLD_BOUNDS.min &&
    tNum <= WALLET_APPROVAL_THRESHOLD_BOUNDS.max;

  const fValid =
    Number.isFinite(fNum) &&
    fNum >= WALLET_FEE_PERCENT_BOUNDS.min &&
    fNum <= WALLET_FEE_PERCENT_BOUNDS.max;

  const cValid =
    Number.isInteger(cNum) &&
    cNum >= WALLET_DAILY_CAP_BOUNDS.min &&
    cNum <= WALLET_DAILY_CAP_BOUNDS.max;

  const valid = tValid && fValid && cValid;

  const handleSubmit = () => {
    if (!valid) {
      setError("Check the values. Threshold and cap must be whole numbers.");
      return;
    }
    onSubmit({
      thresholdGHS: tNum,
      feeRatePercent: fNum,
      dailyCap: cNum,
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Wallet withdrawal rules"
      description="Threshold for admin approval and the fee on each refund."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="wallet-threshold"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Approval threshold (GHS)
          </label>
          <Input
            id="wallet-threshold"
            aria-label="Wallet withdrawal approval threshold in GHS"
            inputMode="numeric"
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div>
          <label
            htmlFor="wallet-fee"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Fee rate (%)
          </label>
          <Input
            id="wallet-fee"
            aria-label="Wallet withdrawal fee percentage"
            inputMode="decimal"
            value={feeRate}
            onChange={(e) => {
              setFeeRate(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div>
          <label
            htmlFor="wallet-cap"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Daily cap
          </label>
          <Input
            id="wallet-cap"
            aria-label="Daily wallet withdrawal cap"
            inputMode="numeric"
            value={dailyCap}
            onChange={(e) => {
              setDailyCap(e.target.value);
              setError(null);
            }}
          />
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Currently threshold GHS{" "}
          <span className="font-medium">
            {config.thresholdGHS.toLocaleString("en-GH")}
          </span>
          , fee{" "}
          <span className="font-medium">{config.feeRatePercent}%</span>, cap{" "}
          <span className="font-medium">{config.dailyCap}</span> per day.
        </p>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Changes apply to new requests. Requests already in the queue keep
          the rules they were evaluated under.
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