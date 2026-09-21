"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type {
  RegisteredDestination,
  ResellerRefundableSource,
  ResellerWalletRecord,
} from "@/lib/reseller/types/wallet";
import type {
  WalletAutoApproveConfig,
  WithdrawalKind,
} from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import {
  describeDestination,
  describeSource,
} from "@/lib/reseller/wallet/wallet-labels";
import {
  MIN_RESELLER_WITHDRAWAL_AMOUNT,
  RESELLER_WITHDRAWAL_PRESET_FRACTIONS,
} from "@/lib/reseller/wallet/wallet-constants";

type Step =
  | "kind"
  | "source"
  | "amount"
  | "confirm"
  | "processing"
  | "result";

interface SubmitResult {
  ok: boolean;
  requiresApproval?: boolean;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: ResellerWalletRecord | null;
  sources: ResellerRefundableSource[];
  destination: RegisteredDestination | null;
  config: WalletAutoApproveConfig | null;
  nowMs: number | null;
  onConfirm: (input: {
    kind: WithdrawalKind;
    amount: number;
    sourcePaymentId?: string;
  }) => Promise<SubmitResult>;
  onRequestDestination: () => void;
}

export function ResellerWithdrawModal({
  open,
  onClose,
  wallet,
  sources,
  destination,
  config,
  nowMs,
  onConfirm,
  onRequestDestination,
}: Props) {
  const [step, setStep] = useState<Step>("kind");
  const [kind, setKind] = useState<WithdrawalKind | null>(null);
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
    () => sources.filter((s) => s.remainingAmount >= MIN_RESELLER_WITHDRAWAL_AMOUNT),
    [sources]
  );

  const destinationBlocked =
    destination !== null && destination.pendingChange !== undefined;

  const hasNoDestination = destination === null;

  useEffect(() => {
    if (!open) return;
    setStep("kind");
    setKind(null);
    setSelectedSourceId(null);
    setAmountInput("");
    setAmountError(null);
    setSubmitting(false);
    setResult(null);
  }, [open]);

  if (!wallet || !config) return null;

  const selectedSource = selectedSourceId
    ? usableSources.find((s) => s.entry.id === selectedSourceId) ?? null
    : null;

  const parsedAmount = Number(amountInput);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= MIN_RESELLER_WITHDRAWAL_AMOUNT;

  const preview =
    amountValid && config
      ? computeWithdrawalTotal(parsedAmount, config.feeRatePercent)
      : { fee: 0, total: 0 };

  const exceedsBalance = amountValid && preview.total > wallet.balance;
  const exceedsThreshold = amountValid && !exceedsBalance && preview.total > config.thresholdGHS;

  const setPreset = (fraction: number) => {
    let cap = 0;
    if (kind === "refund_to_source" && selectedSource) {
      cap = selectedSource.remainingAmount;
    } else if (kind === "cash_out_to_destination") {
      const pendingTotals = 0;
      cap = wallet.balance - pendingTotals;
    }
    const raw = cap * fraction;
    setAmountInput((Math.floor(raw * 100) / 100).toFixed(2));
    setAmountError(null);
  };

  const handleKind = (next: WithdrawalKind) => {
    setKind(next);
    setSelectedSourceId(null);
    setAmountInput("");
    setAmountError(null);
    if (next === "refund_to_source") {
      if (usableSources.length === 1) {
        setSelectedSourceId(usableSources[0].entry.id);
        setStep("amount");
      } else {
        setStep("source");
      }
    } else {
      if (destinationBlocked) return;
      setStep("amount");
    }
  };

  const handleAmountContinue = () => {
    if (!amountValid) {
      setAmountError("Enter a valid amount.");
      return;
    }
    if (exceedsBalance) {
      setAmountError("Your wallet balance does not cover this plus its fee.");
      return;
    }
    if (kind === "refund_to_source" && selectedSource) {
      if (parsedAmount > selectedSource.remainingAmount) {
        setAmountError("Exceeds the remaining refundable amount on this source.");
        return;
      }
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!kind || !amountValid) return;
    setSubmitting(true);
    setStep("processing");
    const outcome = await onConfirm({
      kind,
      amount: parsedAmount,
      sourcePaymentId:
        kind === "refund_to_source" && selectedSource
          ? selectedSource.entry.id
          : undefined,
    });
    setSubmitting(false);
    if (outcome.ok) {
      setResult({
        ok: true,
        requiresApproval: outcome.requiresApproval,
        message: outcome.requiresApproval
          ? "Your " +
            (kind === "refund_to_source" ? "refund" : "withdrawal") +
            " of " +
            formatCurrency(parsedAmount) +
            " is under review. Atlas will notify you once it is approved, usually within 24 hours. The amount has already been taken from your wallet."
          : "Your " +
            (kind === "refund_to_source" ? "refund" : "withdrawal") +
            " of " +
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

  const modalTitle =
    step === "kind"
      ? "Withdraw from wallet"
      : step === "result"
      ? result?.ok
        ? "Request submitted"
        : "Request failed"
      : "Withdraw from wallet";

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={
        step === "kind"
          ? "Choose how you want to move money out of your wallet."
          : step === "amount" && kind
          ? kind === "refund_to_source"
            ? "Refund back to the funding source."
            : "Withdraw to your registered account."
          : undefined
      }
    >
      {step === "kind" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleKind("refund_to_source")}
            className="flex w-full items-start gap-4 rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-neutral-950"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300">
              <AtlasIcon name="repeat" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                Refund to source
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Send money back to the card, momo number, or bank account you funded from. No destination choice.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleKind("cash_out_to_destination")}
            disabled={hasNoDestination || destinationBlocked}
            className="flex w-full items-start gap-4 rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-neutral-950"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              <AtlasIcon name="bank" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                Withdraw to account
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {hasNoDestination
                  ? "Add a destination first to enable cash-outs."
                  : destinationBlocked
                  ? "Your destination change is under review."
                  : "Cash out commissions to your registered bank or momo account."}
              </p>
            </div>
          </button>

          {(hasNoDestination || destinationBlocked) && (
            <button
              type="button"
              onClick={onRequestDestination}
              className="text-xs font-semibold text-brand-800 hover:underline dark:text-brand-300"
            >
              {hasNoDestination ? "Add a destination" : "View pending change"}
            </button>
          )}
        </div>
      )}

      {step === "source" && kind === "refund_to_source" && (
        <div className="space-y-3">
          {usableSources.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
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
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-950 dark:text-white">
                        {describeSource(
                          source.entry.method,
                          source.entry.provider,
                          source.entry.maskedLabel
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Funded{" "}
                        {nowMs
                          ? formatRelative(source.entry.createdAt, nowMs)
                          : "recently"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                        {formatCurrency(source.remainingAmount)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        refundable
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "amount" && kind && (
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                {kind === "refund_to_source" ? "Source" : "Destination"}
              </span>
              <span className="font-medium text-neutral-950 dark:text-white">
                {kind === "refund_to_source" && selectedSource
                  ? describeSource(
                      selectedSource.entry.method,
                      selectedSource.entry.provider,
                      selectedSource.entry.maskedLabel
                    )
                  : destination
                  ? describeDestination(destination)
                  : "Not set"}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Available
              </span>
              <span className="font-medium text-neutral-950 dark:text-white">
                {kind === "refund_to_source" && selectedSource
                  ? formatCurrency(selectedSource.remainingAmount)
                  : formatCurrency(wallet.balance)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {RESELLER_WITHDRAWAL_PRESET_FRACTIONS.map((f) => (
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
                <span className="font-medium text-neutral-950 dark:text-white">
                  Total deducted
                </span>
                <span className="font-semibold text-neutral-950 dark:text-white">
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

          {exceedsThreshold && (
            <div
              role="alert"
              className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
            >
              This withdrawal is above the auto-approval limit. Atlas will review it before funds are released.
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(kind === "refund_to_source" ? "source" : "kind")}
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

      {step === "confirm" && kind && (
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Kind
              </span>
              <span className="text-sm font-medium text-neutral-950 dark:text-white">
                {kind === "refund_to_source" ? "Refund to source" : "Withdraw to account"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {kind === "refund_to_source" ? "To" : "Destination"}
              </span>
              <span className="text-sm font-medium text-neutral-950 dark:text-white">
                {kind === "refund_to_source" && selectedSource
                  ? describeSource(
                      selectedSource.entry.method,
                      selectedSource.entry.provider,
                      selectedSource.entry.maskedLabel
                    )
                  : destination
                  ? describeDestination(destination)
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Amount
              </span>
              <span className="text-sm font-medium text-neutral-950 dark:text-white">
                {formatCurrency(parsedAmount)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Fee
              </span>
              <span className="text-sm font-medium text-neutral-950 dark:text-white">
                {formatCurrency(preview.fee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 py-1 pt-2 dark:border-neutral-700">
              <span className="text-sm font-medium text-neutral-950 dark:text-white">
                Total deducted
              </span>
              <span className="text-sm font-semibold text-neutral-950 dark:text-white">
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
              Submit request
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
            />
          </div>
          <h3 className="text-xl font-semibold text-neutral-950 dark:text-white">
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