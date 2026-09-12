/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/resellers/reseller-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  WALLET_ADJUST_METHODS,
  type WalletAdjustMethod,
} from "@/lib/admin/resellers/constants";
import {
  commissionDeltaForTier,
  tierByName,
} from "@/lib/admin/resellers/helpers";
import { mockResellerTiers } from "@/lib/admin/mock/commissions";

/* ---------------------- Wallet adjustment ----------------------------- */

interface WalletAdjustModalProps {
  open: boolean;
  resellerName: string;
  currentBalance: number;
  onClose: () => void;
  onConfirm: (
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => void;
}

export function ResellerWalletAdjustModal({
  open,
  resellerName,
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
  const reasonValid = reason.trim().length >= 8;
  const signedAmount = mode === "credit" ? amount : -amount;
  const newBalance = currentBalance + signedAmount;
  const canSubmit = amountValid && reasonValid;

  const handleSubmit = () => {
    if (!amountValid) {
      setError("Enter a positive amount.");
      return;
    }
    if (!reasonValid) {
      setError("Give a reason of at least 8 characters.");
      return;
    }
    onConfirm(signedAmount, reason.trim(), method);
    onClose();
  };

  const methodHint =
    WALLET_ADJUST_METHODS.find((m) => m.value === method)?.hint ?? "";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Adjust reseller wallet"
      description={`Adjusts the balance for ${resellerName}. This action is recorded in the audit trail.`}
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
        <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
          <p className="text-neutral-500 dark:text-neutral-400">
            Current balance
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(currentBalance)}
          </p>
          {amountValid && (
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              After adjustment:{" "}
              <span
                className={
                  newBalance >= 0
                    ? "font-medium text-neutral-900 dark:text-neutral-100"
                    : "font-medium text-danger-700 dark:text-danger-300"
                }
              >
                {formatCurrency(newBalance)}
              </span>
            </p>
          )}
        </div>

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
          htmlFor="reseller-wallet-amount"
          required
        >
          <Input
            id="reseller-wallet-amount"
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
          htmlFor="reseller-wallet-method"
          hint={methodHint}
        >
          <select
            id="reseller-wallet-method"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={method}
            onChange={(e) => setMethod(e.target.value as WalletAdjustMethod)}
          >
            {WALLET_ADJUST_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="reseller-wallet-reason"
          required
          hint="Recorded on the reseller's audit trail and visible to finance."
        >
          <textarea
            id="reseller-wallet-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Commission correction for ATX-983821"
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

/* ---------------------- Suspend --------------------------------------- */

interface SuspendModalProps {
  open: boolean;
  resellerName: string;
  storefrontUsersCount: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ResellerSuspendModal({
  open,
  resellerName,
  storefrontUsersCount,
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
      title={`Suspend ${resellerName}?`}
      description="Suspending a reseller disables their storefront, blocks their sign-in, and prevents their customers from placing new orders."
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
            Suspend reseller
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {storefrontUsersCount > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
            <p className="font-medium text-warning-900 dark:text-warning-100">
              Downstream impact
            </p>
            <p className="mt-1 text-warning-800 dark:text-warning-200">
              {storefrontUsersCount.toLocaleString("en-GH")} customers shop on
              this reseller's storefront. They will not be able to place new
              orders while the account is suspended.
            </p>
          </div>
        )}

        <SettingsField
          label="Reason"
          htmlFor="reseller-suspend-reason"
          required
          hint="Recorded on the audit trail and visible to other admins."
        >
          <textarea
            id="reseller-suspend-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Suspended pending fraud investigation on order ATX-983821"
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

/* ---------------------- Notify ---------------------------------------- */

type NotifyChannel = "email" | "sms" | "push";

interface NotifyModalProps {
  open: boolean;
  resellerName: string;
  onClose: () => void;
  onConfirm: (channel: NotifyChannel, message: string) => void;
}

export function ResellerNotifyModal({
  open,
  resellerName,
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
      description={`Delivered directly to ${resellerName} through the selected channel.`}
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
        <SettingsField label="Channel" htmlFor="reseller-notify-channel">
          <select
            id="reseller-notify-channel"
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
          htmlFor="reseller-notify-message"
          required
          hint={`${message.length} characters`}
        >
          <textarea
            id="reseller-notify-message"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={5}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
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

/* ---------------------- Tier change ----------------------------------- */

interface TierChangeModalProps {
  open: boolean;
  resellerName: string;
  currentTierName?: string;
  onClose: () => void;
  onConfirm: (tierId: string) => void;
}

export function ResellerTierChangeModal({
  open,
  resellerName,
  currentTierName,
  onClose,
  onConfirm,
}: TierChangeModalProps) {
  const [selectedTierId, setSelectedTierId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedTierId("");
      setError(null);
    }
  }, [open]);

  const selectedTier = mockResellerTiers.find((t) => t.id === selectedTierId);
  const delta = commissionDeltaForTier(
    currentTierName,
    selectedTier?.name
  );
  const currentTier = tierByName(currentTierName);

  const handleSubmit = () => {
    if (!selectedTierId) {
      setError("Choose a tier.");
      return;
    }
    if (selectedTier?.name === currentTierName) {
      setError("That is already the current tier.");
      return;
    }
    onConfirm(selectedTierId);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Change tier"
      description={`Change the tier for ${resellerName}. Tier affects the commission rate on every future order.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Assign tier
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="New tier"
          htmlFor="reseller-tier-select"
          required
        >
          <select
            id="reseller-tier-select"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={selectedTierId}
            onChange={(e) => {
              setSelectedTierId(e.target.value);
              setError(null);
            }}
          >
            <option value="">Choose a tier…</option>
            {mockResellerTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} - extra cut {tier.extraCutPercent}% - min{" "}
                {formatCurrency(tier.minMonthlySales)}/mo
              </option>
            ))}
          </select>
        </SettingsField>

        {currentTier && (
          <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Current tier
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="info">{currentTier.name}</Badge>
              <span className="text-neutral-500 dark:text-neutral-400">
                extra cut {currentTier.extraCutPercent}%
              </span>
            </div>
          </div>
        )}

        {delta && selectedTier && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Impact preview
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              <dt className="text-neutral-500 dark:text-neutral-400">
                Avg base commission
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {delta.fromAvgRate}% → {delta.toAvgRate}%
              </dd>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Atlas extra cut
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {delta.extraCutDelta === 0
                  ? "Unchanged"
                  : `${delta.extraCutDelta > 0 ? "+" : ""}${delta.extraCutDelta}%`}
              </dd>
            </dl>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Commissions already recorded are not affected. New orders
              settle at the new rate.
            </p>
          </div>
        )}

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

/* ---------------------- Verification documents ------------------------ */

export interface VerificationDocument {
  id: string;
  label: string;
  type: string;
  status: "submitted" | "missing";
}

interface VerificationModalProps {
  open: boolean;
  resellerName: string;
  documents: VerificationDocument[];
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ResellerVerificationModal({
  open,
  resellerName,
  documents,
  onClose,
  onApprove,
  onReject,
}: VerificationModalProps) {
  const [mode, setMode] = useState<"review" | "reject">("review");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode("review");
      setReason("");
      setError(null);
    }
  }, [open]);

  const allSubmitted =
    documents.length > 0 && documents.every((d) => d.status === "submitted");

  const handleReject = () => {
    if (reason.trim().length < 8) {
      setError("Give a reason of at least 8 characters.");
      return;
    }
    onReject(reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Verification documents"
      description={`Documents submitted by ${resellerName}.`}
      size="md"
      footer={
        mode === "review" ? (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("reject")}
            >
              Reject
            </Button>
            <Button size="sm" onClick={onApprove} disabled={!allSubmitted}>
              Approve verification
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("review")}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
            >
              Confirm rejection
            </Button>
          </>
        )
      }
    >
      {mode === "review" ? (
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No documents submitted yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {doc.label}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {doc.type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      doc.status === "submitted" ? "success" : "danger"
                    }
                  >
                    {doc.status === "submitted" ? "Submitted" : "Missing"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          {!allSubmitted && documents.length > 0 && (
            <p className="text-xs text-warning-700 dark:text-warning-300">
              Some documents are missing. Approve is disabled until all
              required documents are submitted.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <SettingsField
            label="Rejection reason"
            htmlFor="reseller-verify-reject"
            required
            hint="Sent to the reseller with a request to resubmit."
          >
            <textarea
              id="reseller-verify-reject"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Business registration certificate expired"
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
      )}
    </ModalShell>
  );
}

/* ---------------------- Reset security -------------------------------- */

interface ResetSecurityModalProps {
  open: boolean;
  resellerName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResellerResetSecurityModal({
  open,
  resellerName,
  onClose,
  onConfirm,
}: ResetSecurityModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Reset security for ${resellerName}?`}
      description="This revokes all active sessions and sends a password reset link to the reseller's registered email. They will need to sign in again."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Reset security
          </Button>
        </>
      }
    >
      <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
        <p className="font-medium text-warning-900 dark:text-warning-100">
          When to use this
        </p>
        <p className="mt-1 text-warning-800 dark:text-warning-200">
          Use when the account may be compromised, credentials were shared,
          or an unrecognised session is active. The reseller will be notified
          by email.
        </p>
      </div>
    </ModalShell>
  );
}