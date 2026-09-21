"use client";

import { useEffect, useState } from "react";
import type {
  ResellerCommissionWallet,
  WithdrawalRequest,
} from "@/lib/admin/types/reseller-commission-wallet";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  WITHDRAWAL_METHOD_DESCRIPTION,
  WITHDRAWAL_METHOD_LABEL,
  WITHDRAWAL_METHOD_VARIANT,
} from "@/lib/admin/resellers/wallet-labels";
import { MIN_REJECT_REASON_LENGTH } from "@/lib/admin/resellers/wallet-constants";

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={cn(
          strong && "font-semibold",
          !strong && "font-medium",
          muted && "text-neutral-500 dark:text-neutral-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function WalletHeading({
  wallet,
  request,
}: {
  wallet: ResellerCommissionWallet;
  request: WithdrawalRequest;
}) {
  const internal = request.method === "Wallet Credit";
  return (
    <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
      <Row label="Reseller" value={wallet.resellerName} />
      <Row label="Amount" value={formatCurrency(request.amount)} />
      <Row
        label="Atlas fee"
        value={formatCurrency(request.fee)}
        muted
      />
      <Row label="Total debit" value={formatCurrency(request.total)} strong />
      <div className="flex items-center justify-between py-1">
        <span className="text-neutral-500 dark:text-neutral-400">Method</span>
        <Badge variant={WITHDRAWAL_METHOD_VARIANT[request.method]} size="sm">
          {WITHDRAWAL_METHOD_LABEL[request.method]}
        </Badge>
      </div>
      <Row label="Current balance" value={formatCurrency(wallet.balance)} />
      {internal && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {WITHDRAWAL_METHOD_DESCRIPTION["Wallet Credit"]}
        </p>
      )}
    </div>
  );
}

interface ApproveWithdrawalModalProps {
  open: boolean;
  wallet: ResellerCommissionWallet | null;
  request: WithdrawalRequest | null;
  onClose: () => void;
  onConfirm: () => void;
  onRejectInstead: () => void;
}

export function ApproveWithdrawalModal({
  open,
  wallet,
  request,
  onClose,
  onConfirm,
  onRejectInstead,
}: ApproveWithdrawalModalProps) {
  if (!open || !wallet || !request) return null;

  const internal = request.method === "Wallet Credit";
  const exceedsBalance = request.total > wallet.balance;
  const remainingAfter = wallet.balance - request.total;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Approve withdrawal"
      description={
        wallet.resellerName + " · " + WITHDRAWAL_METHOD_LABEL[request.method]
      }
    >
      <div className="space-y-3">
        <WalletHeading wallet={wallet} request={request} />

        {!exceedsBalance && (
          <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
            <Row
              label="Remaining after approval"
              value={formatCurrency(remainingAfter)}
              strong
            />
          </div>
        )}

        {exceedsBalance && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200"
          >
            <AtlasIcon
              name="alert"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>
              {wallet.resellerName} does not have enough commission balance to
              cover the amount plus the Atlas fee. Submitting will mark it
              failed with insufficient balance. The reseller will need to
              submit a new request once their balance covers the total.
            </span>
          </div>
        )}

        {!exceedsBalance && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {internal
              ? "Approving moves the amount to the reseller's Atlas wallet and credits Atlas with the fee."
              : "Approving marks the request completed, debits the total from the reseller's commission balance, and credits Atlas with the fee."}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {exceedsBalance ? (
            <Button variant="destructive" size="sm" onClick={onRejectInstead}>
              Reject instead
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onConfirm}>
              Approve withdrawal
            </Button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

interface RejectWithdrawalModalProps {
  open: boolean;
  wallet: ResellerCommissionWallet | null;
  request: WithdrawalRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectWithdrawalModal({
  open,
  wallet,
  request,
  onClose,
  onConfirm,
}: RejectWithdrawalModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  if (!open || !wallet || !request) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REJECT_REASON_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(
        "Enter a reason of at least " +
          MIN_REJECT_REASON_LENGTH +
          " characters. This is stored in the reseller's ledger."
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
      title="Reject withdrawal"
      description={wallet.resellerName + " · " + formatCurrency(request.amount)}
    >
      <div className="space-y-4">
        <WalletHeading wallet={wallet} request={request} />

        <SettingsField
          label="Reason"
          htmlFor="reject-reason"
          required
          hint="Stored on the withdrawal history entry and visible to Atlas operations."
          error={error ?? undefined}
        >
          <textarea
            id="reject-reason"
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
            placeholder="Explain why this request is being rejected."
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The request moves to history as rejected. The reseller keeps the
          funds and can submit a new request.
        </p>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Reject request
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}