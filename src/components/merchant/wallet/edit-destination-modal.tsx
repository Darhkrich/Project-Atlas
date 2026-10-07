/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import type { RegisteredDestination } from "@/lib/merchant/types/wallet";
import {
  MAX_MERCHANT_DESTINATION_REASON_LENGTH,
  MIN_MERCHANT_DESTINATION_REASON_LENGTH,
} from "@/lib/merchant/wallet/wallet-constants";

interface Props {
  open: boolean;
  destination: RegisteredDestination | null;
  onSubmit: (input: {
    method: "momo" | "bank";
    provider: string;
    accountNumber: string;
    nameOnAccount: string;
    reason: string;
  }) => void;
  onClose: () => void;
}

const MOMO_PROVIDERS = ["MTN", "Telecel", "AirtelTigo"];
const BANK_PROVIDERS = [
  "GCB",
  "Ecobank",
  "Fidelity",
  "Absa",
  "Stanbic",
  "CalBank",
];

const INITIAL_ADD_REASON = "Initial withdrawal account setup";

export function EditDestinationModal({
  open,
  destination,
  onSubmit,
  onClose,
}: Props) {
  const [method, setMethod] = useState<"momo" | "bank">("momo");
  const [provider, setProvider] = useState("MTN");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnAccount, setNameOnAccount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasVerifiedAccount =
    destination !== null && destination.verifiedAt !== null;
  const isChange = hasVerifiedAccount;

  useEffect(() => {
    if (!open) return;
    setMethod(destination?.method ?? "momo");
    setProvider(destination?.provider ?? "MTN");
    setAccountNumber(destination?.accountNumber ?? "");
    setNameOnAccount(destination?.nameOnAccount ?? "");
    setReason("");
    setError(null);
    setSubmitting(false);
  }, [open, destination]);

  const providerList = method === "momo" ? MOMO_PROVIDERS : BANK_PROVIDERS;
  const trimmedReason = reason.trim();

  const reasonValid =
    !isChange ||
    (trimmedReason.length >= MIN_MERCHANT_DESTINATION_REASON_LENGTH &&
      trimmedReason.length <= MAX_MERCHANT_DESTINATION_REASON_LENGTH);

  const valid =
    provider.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    nameOnAccount.trim().length > 0 &&
    reasonValid;

  const handleSubmit = () => {
    if (!valid) {
      setError(
        isChange
          ? "Fill every field and explain the change in at least " +
              MIN_MERCHANT_DESTINATION_REASON_LENGTH +
              " characters."
          : "Fill every field."
      );
      return;
    }
    setSubmitting(true);
    onSubmit({
      method,
      provider,
      accountNumber: accountNumber.trim(),
      nameOnAccount: nameOnAccount.trim(),
      reason: isChange ? trimmedReason : INITIAL_ADD_REASON,
    });
  };

  const hasError = error !== null;

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={isChange ? "Change withdrawal account" : "Add withdrawal account"}
      description={
        isChange
          ? "Atlas reviews every change before it takes effect. You cannot cash out until the new account is verified."
          : "Atlas reviews every new account before it can receive payouts."
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="merchant-dest-method"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Account type
          </label>
          <select
            id="merchant-dest-method"
            value={method}
            onChange={(e) => {
              const next = e.target.value as "momo" | "bank";
              setMethod(next);
              setProvider(next === "momo" ? "MTN" : "GCB");
              setError(null);
            }}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="momo">Mobile Money</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="merchant-dest-provider"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Provider
          </label>
          <select
            id="merchant-dest-provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setError(null);
            }}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {providerList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <AtlasInput
          label={method === "momo" ? "Mobile money number" : "Account number"}
          type="tel"
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value);
            setError(null);
          }}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={hasError ? "merchant-dest-error" : undefined}
        />

        <AtlasInput
          label="Name on account"
          type="text"
          value={nameOnAccount}
          onChange={(e) => {
            setNameOnAccount(e.target.value);
            setError(null);
          }}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={hasError ? "merchant-dest-error" : undefined}
        />

        {isChange && (
          <div>
            <label
              htmlFor="merchant-dest-reason"
              className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
            >
              Reason for change
            </label>
            <textarea
              id="merchant-dest-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              aria-invalid={hasError ? "true" : undefined}
              aria-describedby={hasError ? "merchant-dest-error" : undefined}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Explain why this account is being changed."
            />
          </div>
        )}

        {error && (
          <p
            id="merchant-dest-error"
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!valid || submitting}
            aria-busy={submitting}
          >
            {submitting
              ? isChange
                ? "Submitting"
                : "Adding"
              : isChange
              ? "Submit for review"
              : "Add account"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}