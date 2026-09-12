/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/customers/customer-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  WALLET_METHOD_HINT,
  WALLET_METHOD_LABEL,
  type WalletAdjustMethod,
} from "@/lib/admin/customers/constants";

/* ------------------------------ Wallet adjust --------------------------- */

interface WalletAdjustModalProps {
  open: boolean;
  customerName: string;
  currentBalance: number;
  onClose: () => void;
  onConfirm: (
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => void;
}

export function WalletAdjustModal({
  open,
  customerName,
  currentBalance,
  onClose,
  onConfirm,
}: WalletAdjustModalProps) {
  const [mode, setMode] = useState<"credit" | "debit">("credit");
  const [amountInput, setAmountInput] = useState("");
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<WalletAdjustMethod>("atlas_wallet");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode("credit");
    setAmountInput("");
    setReason("");
    setMethod("atlas_wallet");
    setError(null);
  }, [open]);

  const amount = Number(amountInput);
  const amountValid =
    amountInput.length > 0 && !Number.isNaN(amount) && amount > 0;
  const reasonValid = reason.trim().length > 0;
  const canSubmit = amountValid && reasonValid;

  const handleSubmit = () => {
    if (!amountValid) {
      setError("Enter a positive amount.");
      return;
    }
    if (!reasonValid) {
      setError("Explain why the balance is being adjusted.");
      return;
    }
    const signed = mode === "credit" ? amount : -amount;
    onConfirm(signed, reason.trim(), method);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Adjust wallet balance"
      description={`Adjusts the balance for ${customerName}. Current balance: ${formatCurrency(currentBalance)}.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {mode === "credit" ? "Credit" : "Debit"}{" "}
            {amountValid ? formatCurrency(amount) : "wallet"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Direction
          </p>
          <div className="mt-2 inline-flex rounded-md border border-neutral-300 p-0.5 dark:border-neutral-700">
            {(["credit", "debit"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "rounded px-3 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "rounded px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }
              >
                {m === "credit" ? "Credit" : "Debit"}
              </button>
            ))}
          </div>
        </div>

        <SettingsField
          label="Amount (GHS)"
          htmlFor="wallet-adjust-amount"
          required
        >
          <Input
            id="wallet-adjust-amount"
            type="number"
            min={0}
            step={0.01}
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setError(null);
            }}
            placeholder="0.00"
          />
        </SettingsField>

        <SettingsField
          label="Method"
          htmlFor="wallet-adjust-method"
          hint={WALLET_METHOD_HINT[method]}
        >
          <select
            id="wallet-adjust-method"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as WalletAdjustMethod)
            }
          >
            {(
              Object.keys(WALLET_METHOD_LABEL) as WalletAdjustMethod[]
            ).map((m) => (
              <option key={m} value={m}>
                {WALLET_METHOD_LABEL[m]}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="wallet-adjust-reason"
          required
          hint="Recorded on the customer's activity log."
        >
          <textarea
            id="wallet-adjust-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Provider wallet empty at time of purchase"
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}

/* ------------------------------ Suspend --------------------------------- */

interface SuspendModalProps {
  open: boolean;
  customerName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function SuspendModal({
  open,
  customerName,
  onClose,
  onConfirm,
}: SuspendModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const canSubmit = reason.trim().length >= 8;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError("Give a reason of at least 8 characters.");
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Suspend ${customerName}?`}
      description="The customer will be signed out and blocked from placing orders or withdrawing. Their history is preserved and the account can be reactivated later."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Suspend customer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Reason"
          htmlFor="suspend-reason"
          required
          hint="Recorded on the customer's activity log and visible to other admins."
        >
          <textarea
            id="suspend-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Repeated chargeback pattern across multiple payment methods"
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}

/* ------------------------------ Notify ---------------------------------- */

type NotifyChannel = "email" | "sms" | "push";

interface NotifyModalProps {
  open: boolean;
  customerName: string;
  onClose: () => void;
  onConfirm: (channel: NotifyChannel, message: string) => void;
}

export function NotifyModal({
  open,
  customerName,
  onClose,
  onConfirm,
}: NotifyModalProps) {
  const [channel, setChannel] = useState<NotifyChannel>("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setChannel("email");
      setMessage("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Write a message before sending.");
      return;
    }
    onConfirm(channel, trimmed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Send notification"
      description={`Delivered directly to ${customerName} through the selected channel.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Send
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Channel" htmlFor="notify-channel">
          <select
            id="notify-channel"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={channel}
            onChange={(e) => setChannel(e.target.value as NotifyChannel)}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
        </SettingsField>

        <SettingsField
          label="Message"
          htmlFor="notify-message"
          required
          hint={`${message.length} characters`}
        >
          <textarea
            id="notify-message"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={5}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
            placeholder="Use {firstName} for personalisation."
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}