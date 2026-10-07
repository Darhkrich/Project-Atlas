/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MerchantWalletRecord,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { describeDestination } from "@/lib/merchant/wallet/wallet-labels";
import {
  MERCHANT_WITHDRAWAL_PRESET_FRACTIONS,
  MIN_MERCHANT_WITHDRAWAL_AMOUNT,
} from "@/lib/merchant/wallet/wallet-constants";

type Step = "amount" | "confirm" | "processing" | "result";

interface SubmitResult {
  ok: boolean;
  requiresApproval?: boolean;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  main: MerchantWalletRecord | null;
  destination: RegisteredDestination | null;
  config: WalletAutoApproveConfig | null;
  onSubmit: (input: { amount: number }) => Promise<SubmitResult>;
  onRequestDestination: () => void;
}

export function MerchantWithdrawModal({
  open,
  onClose,
  main,
  destination,
  config,
  onSubmit,
  onRequestDestination,
}: Props) {
  const [step, setStep] = useState<Step>("amount");
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
    setStep("amount");
    setAmountInput("");
    setAmountError(null);
    setSubmitting(false);
    setResult(null);
  }, [open]);

  if (!main || !config) return null;

  const available = Math.max(0, main.balance);
  const parsedAmount = Number(amountInput);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= MIN_MERCHANT_WITHDRAWAL_AMOUNT &&
    parsedAmount <= available;

  const preview = amountValid
    ? computeWithdrawalTotal(parsedAmount, config.feeRatePercent)
    : { fee: 0, total: 0 };

  const exceedsThreshold = amountValid && preview.total > config.thresholdGHS;

  const destinationBlocked =
    destination !== null && destination.pendingChange !== undefined;

  const hasNoDestination = destination === null;

  const setPreset = (fraction: number) => {
    const raw = available * fraction;
    setAmountInput((Math.floor(raw * 100) / 100).toFixed(2));
    setAmountError(null);
  };

  const handleContinue = () => {
    if (!amountValid) {
      setAmountError(
        "Enter an amount between " +
          MIN_MERCHANT_WITHDRAWAL_AMOUNT.toFixed(2) +
          " and " +
          available.toFixed(2) +
          "."
      );
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!amountValid) return;
    setSubmitting(true);
    setStep("processing");
    const outcome = await onSubmit({ amount: parsedAmount });
    setSubmitting(false);
    if (outcome.ok) {
      setResult({
        ok: true,
        requiresApproval: outcome.requiresApproval,
        message: outcome.requiresApproval
          ? "Your withdrawal of " +
            formatCurrency(parsedAmount) +
            " is under review. Atlas will notify you once it is approved, usually within 24 hours. The amount has been deducted from your main wallet."
          : "Your withdrawal of " +
            formatCurrency(parsedAmount) +
            " is on the way.",
      });
    } else {
      setResult({
        ok: false,
        message: outcome.error ?? "The request could not be submitted.",
      });
    }
    setStep("result");
  };

  if (hasNoDestination || destinationBlocked) {
    return (
      <AtlasModalShell
        open={open}
        onClose={onClose}
        title="Withdraw from main wallet"
        description="You need a verified destination before cashing out."
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {hasNoDestination
              ? "Add a bank or momo account first. Atlas reviews every destination before it takes effect."
              : "Your destination change is under review. You can cash out once Atlas approves it."}
          </p>
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRequestDestination}>
              {hasNoDestination ? "Add destination" : "View change"}
            </Button>
          </div>
        </div>
      </AtlasModalShell>
    );
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Withdraw from main wallet"
      description={
        step === "amount"
          ? "Cash out to your registered destination."
          : step === "confirm"
          ? "Review the withdrawal before submitting."
          : undefined
      }
    >
      {step === "amount" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Destination
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {destination ? describeDestination(destination) : "Not set"}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Available
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(available)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MERCHANT_WITHDRAWAL_PRESET_FRACTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPreset(f)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:border-brand-400 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                {f === 1 ? "Full amount" : Math.round(f * 100) + "%"}
              </button>
            ))}
          </div>

          <AtlasInput
            label="Amount (GH\u20B5)"
            type="number"
            placeholder="0.00"
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setAmountError(null);
            }}
            error={amountError ?? undefined}
          />

          {amountValid && (
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
                <span>{formatCurrency(main.balance - preview.total)}</span>
              </div>
            </div>
          )}

          {exceedsThreshold && (
            <div
              role="alert"
              className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
            >
              This withdrawal is above the auto-approval limit. Atlas will
              review it before funds are released.
            </div>
          )}

          <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleContinue}
              disabled={!amountValid}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Destination
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {destination ? describeDestination(destination) : "Not set"}
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
              Submit withdrawal
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
            Submitting your request...
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
                ? "Submitted for approval"
                : "On the way"
              : "Request not submitted"}
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