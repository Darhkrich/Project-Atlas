/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/storefront-users/storefront-user-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  SEGMENT_LABEL,
  TAG_PRESETS,
} from "@/lib/admin/storefront-users/constants";
import type { StorefrontUserSegment } from "@/lib/admin/types/storefront-user";

type NotifyChannel = "email" | "sms" | "push";

/* ------------------------ Notify ------------------------------------ */

interface NotifyModalProps {
  open: boolean;
  userName: string;
  storefrontName: string;
  onClose: () => void;
  onConfirm: (channel: NotifyChannel, message: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function StorefrontUserNotifyModal({
  open,
  userName,
  storefrontName,
  onClose,
  onConfirm,
  title = "Send notification",
  description,
  confirmLabel = "Send",
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

  const resolvedDescription =
    description ?? `Delivered to ${userName}, a customer of ${storefrontName}.`;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      description={resolvedDescription}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Channel" htmlFor="sfu-notify-channel">
          <select
            id="sfu-notify-channel"
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
          htmlFor="sfu-notify-message"
          required
          hint={`${message.length} characters`}
        >
          <textarea
            id="sfu-notify-message"
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

/* ------------------------ Suspend ----------------------------------- */

interface SuspendModalProps {
  open: boolean;
  userName: string;
  storefrontName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function StorefrontUserSuspendModal({
  open,
  userName,
  storefrontName,
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
      title={`Suspend ${userName}?`}
      description={`${userName} will be signed out and blocked from placing new orders on ${storefrontName}. Their history is preserved.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Suspend user
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Reason"
          htmlFor="sfu-suspend-reason"
          required
          hint="Recorded on the user's activity log and visible to other admins."
        >
          <textarea
            id="sfu-suspend-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Chargeback on order KW-7712"
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

/* ------------------------ Add tag ----------------------------------- */

interface AddTagModalProps {
  open: boolean;
  userName: string;
  existingTags: string[];
  presets?: string[];
  onClose: () => void;
  onConfirm: (tag: string) => void;
}

export function StorefrontUserAddTagModal({
  open,
  userName,
  existingTags,
  presets,
  onClose,
  onConfirm,
}: AddTagModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValue("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a tag name.");
      return;
    }
    if (existingTags.includes(trimmed)) {
      setError("That tag is already on this user.");
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  const sourcePresets = presets ?? TAG_PRESETS;
  const availablePresets = sourcePresets.filter(
    (p) => !existingTags.includes(p)
  );

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add tag"
      description={`Apply a tag to ${userName}. Tags help with filtering and saved views.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!value.trim()}>
            Add tag
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Tag" htmlFor="sfu-tag-input" required>
          <input
            id="sfu-tag-input"
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g. VIP"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </SettingsField>

        {availablePresets.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Suggested
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availablePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue(preset)}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
                >
                  {preset}
                </button>
              ))}
            </div>
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

/* ------------------------ Wallet freeze ----------------------------- */

interface WalletFreezeModalProps {
  open: boolean;
  userName: string;
  storefrontName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function StorefrontUserWalletFreezeModal({
  open,
  userName,
  storefrontName,
  onClose,
  onConfirm,
}: WalletFreezeModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const canSubmit = reason.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError("Give a reason of at least 10 characters.");
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Freeze wallet for ${userName}?`}
      description={`${userName} can still receive funds. They cannot spend from the wallet or request refunds on ${storefrontName}. An admin can still adjust the balance.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Freeze wallet
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Reason"
          htmlFor="sfu-wallet-freeze-reason"
          required
          hint="Recorded on the audit trail. Visible to other admins."
        >
          <textarea
            id="sfu-wallet-freeze-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Wallet under review for suspicious funding activity"
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

/* ------------------------ Wallet adjust ----------------------------- */

interface WalletAdjustModalProps {
  open: boolean;
  userName: string;
  storefrontName: string;
  currentBalance: number;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
}

export function StorefrontUserWalletAdjustModal({
  open,
  userName,
  storefrontName,
  currentBalance,
  onClose,
  onConfirm,
}: WalletAdjustModalProps) {
  const [mode, setMode] = useState<"credit" | "debit">("credit");
  const [amountInput, setAmountInput] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode("credit");
    setAmountInput("");
    setReason("");
    setError(null);
  }, [open]);

  const amount = Number(amountInput);
  const amountValid =
    amountInput.length > 0 && !Number.isNaN(amount) && amount > 0;
  const reasonValid = reason.trim().length >= 10;
  const signedAmount = mode === "credit" ? amount : -amount;
  const newBalance = currentBalance + signedAmount;
  const canSubmit = amountValid && reasonValid;

  const handleSubmit = () => {
    if (!amountValid) {
      setError("Enter a positive amount.");
      return;
    }
    if (!reasonValid) {
      setError("Give a reason of at least 10 characters.");
      return;
    }
    onConfirm(signedAmount, reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Adjust storefront user wallet"
      description={`Adjusts the wallet balance for ${userName} on ${storefrontName}. This action writes a treasury event and is visible to the reseller.`}
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
          htmlFor="sfu-wallet-amount"
          required
        >
          <Input
            id="sfu-wallet-amount"
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
          label="Reason"
          htmlFor="sfu-wallet-reason"
          required
          hint="Recorded on the audit trail and on the treasury statement."
        >
          <textarea
            id="sfu-wallet-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Correcting double credit from a failed funding"
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Adjustments write a treasury adjustment event and are
          reconciliation-eligible. Rail refunds are a separate operation and
          are not adjustable from here.
        </p>

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

/* ------------------------ Coupon ------------------------------------ */

interface CouponModalProps {
  open: boolean;
  userName: string;
  storefrontName: string;
  onClose: () => void;
  onConfirm: (code: string, amount: number, reason: string) => void;
}

export function StorefrontUserCouponModal({
  open,
  userName,
  storefrontName,
  onClose,
  onConfirm,
}: CouponModalProps) {
  const [code, setCode] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCode("");
      setAmountInput("");
      setReason("");
      setError(null);
    }
  }, [open]);

  const amount = Number(amountInput);
  const codeValid = code.trim().length >= 3;
  const amountValid =
    amountInput.length > 0 && !Number.isNaN(amount) && amount > 0;
  const reasonValid = reason.trim().length >= 8;
  const canSubmit = codeValid && amountValid && reasonValid;

  const handleSubmit = () => {
    if (!codeValid) {
      setError("Coupon code must be at least 3 characters.");
      return;
    }
    if (!amountValid) {
      setError("Enter a positive discount value.");
      return;
    }
    if (!reasonValid) {
      setError("Give a reason of at least 8 characters.");
      return;
    }
    onConfirm(code.trim().toUpperCase(), amount, reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Send coupon"
      description={`Dispatch a discount code to ${userName}, a customer of ${storefrontName}. The coupon applies only to this customer.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Send coupon
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Coupon code"
          htmlFor="sfu-coupon-code"
          required
          hint="Uppercase letters, numbers, and hyphens. Sent to the customer by email."
        >
          <input
            id="sfu-coupon-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="e.g. THANKS10"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm uppercase dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </SettingsField>

        <SettingsField
          label="Discount value (GHS)"
          htmlFor="sfu-coupon-amount"
          required
        >
          <Input
            id="sfu-coupon-amount"
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
          label="Reason"
          htmlFor="sfu-coupon-reason"
          required
          hint="Recorded on the user's audit trail."
        >
          <textarea
            id="sfu-coupon-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Goodwill for delayed delivery on ORD-1401"
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

/* ------------------------ Segment ----------------------------------- */

const SEGMENT_OPTIONS: StorefrontUserSegment[] = [
  "new",
  "repeat",
  "vip",
  "at_risk",
];

interface SegmentModalProps {
  open: boolean;
  userName: string;
  currentSegment?: StorefrontUserSegment;
  onClose: () => void;
  onConfirm: (segment: StorefrontUserSegment, note: string) => void;
}

export function StorefrontUserSegmentModal({
  open,
  userName,
  currentSegment,
  onClose,
  onConfirm,
}: SegmentModalProps) {
  const [segment, setSegment] = useState<StorefrontUserSegment>(
    currentSegment ?? "repeat"
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSegment(currentSegment ?? "repeat");
    setNote("");
    setError(null);
  }, [open, currentSegment]);

  const isSame = currentSegment === segment;

  const handleSubmit = () => {
    if (isSame) {
      setError("That is already the current segment.");
      return;
    }
    onConfirm(segment, note.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add to segment"
      description={`Reassign ${userName} to a lifecycle segment. Segments drive reporting and campaign targeting.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSame}>
            Assign segment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {currentSegment && (
          <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
            <p className="text-neutral-500 dark:text-neutral-400">
              Current segment
            </p>
            <p className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {SEGMENT_LABEL[currentSegment]}
            </p>
          </div>
        )}

        <SettingsField label="New segment" htmlFor="sfu-segment-select" required>
          <select
            id="sfu-segment-select"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value as StorefrontUserSegment);
              setError(null);
            }}
          >
            {SEGMENT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SEGMENT_LABEL[s]}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Note (optional)"
          htmlFor="sfu-segment-note"
          hint="Why is this segment being changed? Recorded on the audit trail."
        >
          <textarea
            id="sfu-segment-note"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer requested VIP status change"
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