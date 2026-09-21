"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import type { CustomerWalletRecord, RefundableSource } from "@/lib/customer/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { describeSource } from "@/lib/customer/wallet/wallet-labels";
import {
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_PRESET_FRACTIONS,
} from "@/lib/customer/wallet/wallet-constants";

type Step = "source" | "amount" | "confirm" | "processing" | "result";

interface SubmitResult {
  ok: boolean;
  requiresApproval?: boolean;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: CustomerWalletRecord | null;
  sources: RefundableSource[];
  config: WalletAutoApproveConfig | null;
  nowMs: number | null;
  onConfirm: (input: {
    sourcePaymentId: string;
    amount: number;
  }) => Promise<SubmitResult>;
  onSubmitted: () => void;
}

export function WithdrawFlowModal({
  open,
  onClose,
  wallet,
  sources,
  config,
  nowMs,
  onConfirm,
  onSubmitted,
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

  const usableSources = useMemo(
    () =>
      sources.filter((s) => s.remainingAmount >= MIN_WITHDRAWAL_AMOUNT),
    [sources]
  );

  useEffect(() => {
    if (!open) return;
    setStep(usableSources.length === 1 ? "amount" : "source");
    setSelectedSourceId(
      usableSources.length === 1 ? usableSources[0].transaction.id : null
    );
    setAmountInput("");
    setAmountError(null);
    setSubmitting(false);
    setResult(null);
  }, [open, usableSources]);

  if (!wallet || !config) return null;

  const selectedSource = selectedSourceId
    ? usableSources.find((s) => s.transaction.id === selectedSourceId) ?? null
    : null;

  const parsedAmount = Number(amountInput);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= MIN_WITHDRAWAL_AMOUNT &&
    selectedSource !== null &&
    parsedAmount <= selectedSource.remainingAmount;

  const preview =
    amountValid && config
      ? computeWithdrawalTotal(parsedAmount, config.feeRatePercent)
      : { fee: 0, total: 0 };

  const exceedsBalance =
    amountValid && preview.total > wallet.balance;

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
      setAmountError(
        "Enter an amount between " +
          MIN_WITHDRAWAL_AMOUNT.toFixed(2) +
          " and " +
          (selectedSource?.remainingAmount.toFixed(2) ?? "0.00") +
          "."
      );
      return;
    }
    if (exceedsBalance) {
      setAmountError("The wallet balance does not cover this refund plus its fee.");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedSource || !amountValid) return;
    setSubmitting(true);
    setStep("processing");
    const outcome = await onConfirm({
      sourcePaymentId: selectedSource.transaction.id,
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
            " is under review. Atlas will notify you once it is approved, usually within 24 hours. The amount has already been taken from your wallet balance."
          : "Your refund of " +
            formatCurrency(parsedAmount) +
            " is on the way. It will land back on your " +
            describeSource(
              selectedSource.transaction.method,
              selectedSource.transaction.provider,
              selectedSource.transaction.maskedLabel
            ) +
            " within 1 to 3 business days.",
      });
      onSubmitted();
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
          ? "Choose which funding transaction to refund."
          : step === "amount"
          ? "How much would you like to refund?"
          : step === "confirm"
          ? "Review the refund before submitting."
          : undefined
      }
    >
      {step === "source" && (
        <div className="space-y-3">
          {usableSources.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              You have no refundable funding yet. Fund your wallet first, then
              you can refund back to the original source at any time.
            </p>
          ) : (
            <ul role="list" className="space-y-2">
              {usableSources.map((source) => {
                const selected = source.transaction.id === selectedSourceId;
                return (
                  <li key={source.transaction.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSourceId(source.transaction.id);
                        setStep("amount");
                      }}
                      aria-pressed={selected}
                      className={
                        "flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors " +
                        (selected
                          ? "border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30"
                          : "border-neutral-200 hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-800")
                      }
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {describeSource(
                            source.transaction.method,
                            source.transaction.provider,
                            source.transaction.maskedLabel
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          Funded {nowMs ? formatRelative(source.transaction.createdAt, nowMs) : "recently"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(source.remainingAmount)}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          refundable
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {step === "amount" && selectedSource && (
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Source
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {describeSource(
                  selectedSource.transaction.method,
                  selectedSource.transaction.provider,
                  selectedSource.transaction.maskedLabel
                )}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Refundable
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(selectedSource.remainingAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {WITHDRAWAL_PRESET_FRACTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPreset(f)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:border-brand-400 hover:text-brand-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
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
            <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Amount
                </span>
                <span>{formatCurrency(parsedAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Fee ({config.feeRatePercent}%)
                </span>
                <span>{formatCurrency(preview.fee)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-200 pt-1 dark:border-neutral-700">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  Total deducted
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(preview.total)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Remaining balance after
                </span>
                <span>{formatCurrency(wallet.balance - preview.total)}</span>
              </div>
            </div>
          )}

          {exceedsBalance && (
            <div
              role="alert"
              className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
            >
              The wallet balance does not cover this refund plus its fee.
            </div>
          )}

          {exceedsThreshold && (
            <div
              role="alert"
              className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
            >
              This refund is above the auto-approval limit. Atlas will review
              it before funds are returned.
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                setStep(usableSources.length === 1 ? "source" : "source")
              }
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
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Refund to
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {describeSource(
                  selectedSource.transaction.method,
                  selectedSource.transaction.provider,
                  selectedSource.transaction.maskedLabel
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Amount
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(parsedAmount)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Fee
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(preview.fee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 py-1 pt-2 dark:border-neutral-700">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Total deducted
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(preview.total)}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Refunds go back to the same method that funded your wallet. You
            cannot change the destination. The amount is deducted from your
            wallet as soon as you confirm.
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
              className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400"
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
            className="text-sm text-neutral-600 dark:text-neutral-400"
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
              (result.ok
                ? "bg-success-100 dark:bg-success-900"
                : "bg-danger-100 dark:bg-danger-900")
            }
          >
            <AtlasIcon
              name={result.ok ? "check" : "x-circle"}
              className={
                "h-8 w-8 " +
                (result.ok
                  ? "text-success-700 dark:text-success-300"
                  : "text-danger-700 dark:text-danger-300")
              }
              aria-hidden="true"
            />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {result.ok
              ? result.requiresApproval
                ? "Refund submitted"
                : "Refund on the way"
              : "Refund not submitted"}
          </h3>
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
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