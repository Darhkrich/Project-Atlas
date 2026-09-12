/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/merchants/merchant-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { subscriptionPlans } from "@/config/subscription-plans";
import { formatCurrency } from "@/lib/admin/formatters";
import type {
  Merchant,
  SubscriptionPlan,
} from "@/lib/admin/types/merchant";
import { planChangeImpact } from "@/lib/admin/merchants/helpers";

type NotifyChannel = "email" | "sms" | "push";

/* ------------------------ Suspend ------------------------------------ */

interface SuspendModalProps {
  open: boolean;
  merchantName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function MerchantSuspendModal({
  open,
  merchantName,
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
      title={`Suspend ${merchantName}?`}
      description="Suspending a merchant disables their storefront, blocks their sign-in, and stops new orders."
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
            Suspend merchant
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
          <p className="font-medium text-warning-900 dark:text-warning-100">
            Downstream impact
          </p>
          <p className="mt-1 text-warning-800 dark:text-warning-200">
            The storefront will be taken offline and shoppers will see an
            unavailable page. Existing orders are not affected.
          </p>
        </div>

        <SettingsField
          label="Reason"
          htmlFor="merchant-suspend-reason"
          required
          hint="Recorded on the merchant's audit trail and visible to other admins."
        >
          <textarea
            id="merchant-suspend-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Repeated chargebacks on storefront orders"
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

/* ------------------------ Notify ------------------------------------- */

interface NotifyModalProps {
  open: boolean;
  merchantName: string;
  onClose: () => void;
  onConfirm: (channel: NotifyChannel, message: string) => void;
}

export function MerchantNotifyModal({
  open,
  merchantName,
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
      description={`Delivered directly to ${merchantName} through the selected channel.`}
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
        <SettingsField label="Channel" htmlFor="merchant-notify-channel">
          <select
            id="merchant-notify-channel"
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
          htmlFor="merchant-notify-message"
          required
          hint={`${message.length} characters`}
        >
          <textarea
            id="merchant-notify-message"
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

/* ------------------------ Plan change -------------------------------- */

interface PlanChangeModalProps {
  open: boolean;
  merchant: Merchant | null;
  onClose: () => void;
  onConfirm: (planCode: SubscriptionPlan) => void;
}

export function MerchantPlanChangeModal({
  open,
  merchant,
  onClose,
  onConfirm,
}: PlanChangeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    merchant?.subscription.planId ?? "starter"
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (merchant) setSelectedPlan(merchant.subscription.planId);
    setAcknowledged(false);
    setError(null);
  }, [open, merchant]);

  if (!merchant) return null;

  const impact = planChangeImpact(merchant, selectedPlan);
  const isSamePlan = selectedPlan === merchant.subscription.planId;
  const hasBlockingIssues = impact.blockingIssues.length > 0;
  const canConfirm =
    !isSamePlan && (!hasBlockingIssues || acknowledged);

  const handleSubmit = () => {
    if (isSamePlan) {
      setError("That is already the current plan.");
      return;
    }
    if (hasBlockingIssues && !acknowledged) {
      setError(
        "Acknowledge the plan limit warnings before continuing."
      );
      return;
    }
    onConfirm(selectedPlan);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Change subscription plan"
      description={`Change the plan for ${merchant.businessName}. The new plan takes effect on the next billing cycle.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canConfirm}>
            {impact.direction === "downgrade"
              ? "Downgrade plan"
              : impact.direction === "upgrade"
              ? "Upgrade plan"
              : "Change plan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="New plan"
          htmlFor="merchant-plan-select"
          required
        >
          <select
            id="merchant-plan-select"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={selectedPlan}
            onChange={(e) => {
              setSelectedPlan(e.target.value as SubscriptionPlan);
              setAcknowledged(false);
              setError(null);
            }}
          >
            {subscriptionPlans.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name} - {p.monthlyPrice}/mo
              </option>
            ))}
          </select>
        </SettingsField>

        {!isSamePlan && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Impact preview
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              <dt className="text-neutral-500 dark:text-neutral-400">
                Direction
              </dt>
              <dd className="capitalize text-neutral-900 dark:text-neutral-100">
                {impact.direction}
              </dd>
              <dt className="text-neutral-500 dark:text-neutral-400">
                MRR change
              </dt>
              <dd
                className={
                  impact.mrrDelta > 0
                    ? "text-success-700 dark:text-success-300"
                    : impact.mrrDelta < 0
                    ? "text-danger-700 dark:text-danger-300"
                    : "text-neutral-900 dark:text-neutral-100"
                }
              >
                {impact.mrrDelta > 0 ? "+" : ""}
                {formatCurrency(impact.mrrDelta)}
              </dd>
              <dt className="text-neutral-500 dark:text-neutral-400">
                New MRR
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {formatCurrency(impact.toMrr)}
              </dd>
            </dl>
          </div>
        )}

        {hasBlockingIssues && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/25">
            <p className="font-medium text-danger-800 dark:text-danger-200">
              Plan limits exceeded
            </p>
            <ul className="mt-1 space-y-1 text-danger-700 dark:text-danger-300">
              {impact.blockingIssues.map((issue) => (
                <li key={issue}>· {issue}</li>
              ))}
            </ul>
            <label className="mt-2 flex items-start gap-2 text-danger-900 dark:text-danger-100">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  setError(null);
                }}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                I understand this merchant will exceed the new plan's limits
                and accept responsibility for the downgrade.
              </span>
            </label>
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

/* ------------------------ Contract MRR ------------------------------- */

interface ContractMrrModalProps {
  open: boolean;
  merchantName: string;
  currentMrr: number;
  onClose: () => void;
  onConfirm: (value: number, reason: string) => void;
}

export function MerchantContractMrrModal({
  open,
  merchantName,
  currentMrr,
  onClose,
  onConfirm,
}: ContractMrrModalProps) {
  const [amount, setAmount] = useState(String(currentMrr || ""));
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount(String(currentMrr || ""));
    setReason("");
    setError(null);
  }, [open, currentMrr]);

  const num = Number(amount);
  const amountValid =
    amount.length > 0 && !Number.isNaN(num) && num >= 0;
  const reasonValid = reason.trim().length >= 8;
  const canSubmit = amountValid && reasonValid;

  const handleSubmit = () => {
    if (!amountValid) {
      setError("Enter a valid non-negative amount.");
      return;
    }
    if (!reasonValid) {
      setError("Give a reason of at least 8 characters.");
      return;
    }
    onConfirm(num, reason.trim());
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Update contract MRR"
      description={`Set the negotiated monthly recurring revenue for ${merchantName}. Enterprise merchants contribute their contract value to Atlas MRR.`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Save contract MRR
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Contract MRR (GHS)"
          htmlFor="merchant-contract-mrr"
          required
          hint={`Currently ${formatCurrency(currentMrr)} per month.`}
        >
          <Input
            id="merchant-contract-mrr"
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
          />
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="merchant-contract-reason"
          required
          hint="Recorded on the audit trail."
        >
          <textarea
            id="merchant-contract-reason"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Annual contract renegotiated, new pricing effective Q4"
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

/* ------------------------ Store toggle ------------------------------- */

interface StoreToggleModalProps {
  open: boolean;
  merchantName: string;
  storeName: string;
  mode: "enable" | "disable" | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function MerchantStoreToggleModal({
  open,
  merchantName,
  storeName,
  mode,
  onClose,
  onConfirm,
}: StoreToggleModalProps) {
  if (!mode) return null;

  const isDisable = mode === "disable";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isDisable ? `Disable ${storeName}?` : `Enable ${storeName}?`}
      description={
        isDisable
          ? `Shoppers visiting ${storeName} will see an unavailable page. The merchant's account and subscription are unchanged.`
          : `Bring ${storeName} back online. Shoppers will be able to place orders again immediately.`
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isDisable ? "destructive" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isDisable ? "Disable store" : "Enable store"}
          </Button>
        </>
      }
    >
      <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
        <p className="text-neutral-500 dark:text-neutral-400">Merchant</p>
        <p className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
          {merchantName}
        </p>
      </div>
    </ModalShell>
  );
}

/* ------------------------ Reset security ----------------------------- */

interface ResetSecurityModalProps {
  open: boolean;
  merchantName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function MerchantResetSecurityModal({
  open,
  merchantName,
  onClose,
  onConfirm,
}: ResetSecurityModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Reset security for ${merchantName}?`}
      description="This revokes all active sessions and sends a password reset link to the merchant's registered email. They will need to sign in again."
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
          or an unrecognised session is active. The merchant will be notified
          by email.
        </p>
      </div>
    </ModalShell>
  );
}

/* ------------------------ Verify -------------------------------------- */

interface VerifyModalProps {
  open: boolean;
  merchantName: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function MerchantVerifyModal({
  open,
  merchantName,
  onClose,
  onApprove,
  onReject,
}: VerifyModalProps) {
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
      title="Verification decision"
      description={`Approve or reject verification for ${merchantName}.`}
      size="md"
      footer={
        mode === "review" ? (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMode("reject")}>
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApprove();
                onClose();
              }}
            >
              Approve verification
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setMode("review")}>
              Back
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReject}>
              Confirm rejection
            </Button>
          </>
        )
      }
    >
      {mode === "review" ? (
        <div className="space-y-3">
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              What verification covers
            </p>
            <ul className="mt-1 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li>· Business registration and ownership</li>
              <li>· Settlement account details</li>
              <li>· Contact person identity</li>
            </ul>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Approve only after confirming the merchant's documents match their
            storefront details.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <SettingsField
            label="Rejection reason"
            htmlFor="merchant-verify-reject"
            required
            hint="Sent to the merchant with a request to resubmit."
          >
            <textarea
              id="merchant-verify-reject"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Business registration certificate does not match the storefront name"
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