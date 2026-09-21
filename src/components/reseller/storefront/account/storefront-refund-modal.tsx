/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type {
  StorefrontRefundableSource,
  StorefrontUserWalletRecord,
} from "@/lib/storefront-user/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { describeSource } from "@/lib/storefront-user/wallet/wallet-labels";
import {
  MIN_STOREFRONT_REFUND_AMOUNT,
  STOREFRONT_REFUND_PRESET_FRACTIONS,
} from "@/lib/storefront-user/wallet/wallet-constants";

type Step = "source" | "amount" | "confirm" | "processing" | "result";

interface SubmitResult {
  ok: boolean;
  requiresApproval?: boolean;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: StorefrontUserWalletRecord;
  sources: StorefrontRefundableSource[];
  config: WalletAutoApproveConfig | null;
  nowMs: number | null;
  onConfirm: (input: {
    sourcePaymentId: string;
    amount: number;
  }) => Promise<SubmitResult>;
}

export function StorefrontRefundModal({
  open,
  onClose,
  wallet,
  sources,
  config,
  nowMs,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<Step>("source");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    requiresApproval?: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(sources.length === 1 ? "amount" : "source");
    setSelectedSourceId(sources.length === 1 ? sources[0].entry.id : null);
    setAmountInput("");
    setAmountError(null);
    setSubmitting(false);
    setResult(null);
  }, [open, sources]);

  if (!config) return null;

  const usableSources = sources.filter(
    (s) => s.remainingAmount >= MIN_STOREFRONT_REFUND_AMOUNT
  );

  const selectedSource = selectedSourceId
    ? usableSources.find((s) => s.entry.id === selectedSourceId) ?? null
    : null;

  const parsedAmount = Number(amountInput);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= MIN_STOREFRONT_REFUND_AMOUNT &&
    selectedSource !== null &&
    parsedAmount <= selectedSource.remainingAmount;

  const preview = amountValid
    ? computeWithdrawalTotal(parsedAmount, config.feeRatePercent)
    : { fee: 0, total: 0 };

  const exceedsBalance = amountValid && preview.total > wallet.balance;
  const exceedsThreshold =
    amountValid && !exceedsBalance && preview.total > config.thresholdGHS;

  const setPreset = (fraction: number) => {
    if (!selectedSource) return;
    const raw = selectedSource.remainingAmount * fraction;
    setAmountInput((Math.floor(raw * 100) / 100).toFixed(2));
    setAmountError(null);
  };

  const handleAmountContinue = () => {
    if (!amountValid) {
      setAmountError("Enter a valid amount within the refundable range.");
      return;
    }
    if (exceedsBalance) {
      setAmountError("Wallet balance does not cover this refund plus its fee.");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedSource || !amountValid) return;
    setSubmitting(true);
    setStep("processing");
    const outcome = await onConfirm({
      sourcePaymentId: selectedSource.entry.id,
      amount: parsedAmount,
    });
    setSubmitting(false);
    if (outcome.ok) {
      setResult({
        ok: true,
        requiresApproval: outcome.requiresApproval,
        message: outcome.requiresApproval
          ? "Your refund of " +
            formatCurrency(parsedAmount) +
            " is under review. You will see it here once approved. The amount has already been taken from your wallet."
          : "Your refund of " +
            formatCurrency(parsedAmount) +
            " is on the way back to your funding source.",
      });
    } else {
      setResult({
        ok: false,
        message: outcome.error ?? "The refund could not be submitted.",
      });
    }
    setStep("result");
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Refund to source"
      description={
        step === "source"
          ? "Choose which funding to refund."
          : step === "amount"
          ? "How much would you like back?"
          : step === "confirm"
          ? "Review the refund before submitting."
          : undefined
      }
    >
      {step === "source" && (
        <div className="space-y-3">
          {usableSources.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">
              You have no refundable funding yet.
            </p>
          ) : (
            <ul role="list" className="space-y-2">
              {usableSources.map((source) => (
                <li key={source.entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSourceId(source.entry.id);
                      setStep("amount");
                    }}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 text-left hover:border-brand-300"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {describeSource(
                          source.entry.method,
                          source.entry.provider,
                          source.entry.maskedLabel
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Funded{" "}
                        {nowMs
                          ? formatRelative(source.entry.createdAt, nowMs)
                          : "recently"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(source.remainingAmount)}
                      </p>
                      <p className="text-xs text-neutral-500">refundable</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "amount" && selectedSource && (
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Source</span>
              <span className="font-medium text-neutral-900">
                {describeSource(
                  selectedSource.entry.method,
                  selectedSource.entry.provider,
                  selectedSource.entry.maskedLabel
                )}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Refundable</span>
              <span className="font-medium text-neutral-900">
                {formatCurrency(selectedSource.remainingAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STOREFRONT_REFUND_PRESET_FRACTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPreset(f)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:border-brand-400"
              >
                {f === 1 ? "Full amount" : Math.round(f * 100) + "%"}
              </button>
            ))}
          </div>

          <AtlasInput
            label="Amount (GHS)"
            type="number"
            placeholder="0.00"
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setAmountError(null);
            }}
            error={amountError ?? undefined}
          />

          {amountValid && !exceedsBalance && (
            <div className="rounded-lg bg-neutral-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount</span>
                <span>{formatCurrency(parsedAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500">
                  Fee ({config.feeRatePercent}%)
                </span>
                <span>{formatCurrency(preview.fee)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-200 pt-1">
                <span className="font-medium text-neutral-900">
                  Total deducted
                </span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(preview.total)}
                </span>
              </div>
            </div>
          )}

          {exceedsThreshold && (
            <div
              role="alert"
              className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800"
            >
              This refund is above the auto-approval limit. It will be
              reviewed before the money is returned.
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("source")}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleAmountContinue}
              disabled={!amountValid || exceedsBalance}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && selectedSource && (
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500">Refund to</span>
              <span className="text-sm font-medium text-neutral-900">
                {describeSource(
                  selectedSource.entry.method,
                  selectedSource.entry.provider,
                  selectedSource.entry.maskedLabel
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500">Amount</span>
              <span className="text-sm font-medium text-neutral-900">
                {formatCurrency(parsedAmount)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500">Fee</span>
              <span className="text-sm font-medium text-neutral-900">
                {formatCurrency(preview.fee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 py-1 pt-2">
              <span className="text-sm font-medium text-neutral-900">
                Total deducted
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {formatCurrency(preview.total)}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            Refunds go back to the same method that funded your wallet. You
            cannot change the destination.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("amount")}
            >
              Go back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={submitting}
            >
              Submit refund
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <svg
              className="h-8 w-8 animate-spin text-brand-700"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-neutral-600"
          >
            Submitting your refund...
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div className="p-6 text-center">
          <div
            className={
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full " +
              (result.ok ? "bg-success-100" : "bg-danger-100")
            }
          >
            <AtlasIcon
              name={result.ok ? "check" : "x-circle"}
              className={
                "h-8 w-8 " +
                (result.ok ? "text-success-700" : "text-danger-700")
              }
            />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">
            {result.ok
              ? result.requiresApproval
                ? "Submitted for review"
                : "Refund on the way"
              : "Refund not submitted"}
          </h3>
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-sm text-neutral-600"
          >
            {result.message}
          </p>
          <div className="mt-6">
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </AtlasModalShell>
  );
}