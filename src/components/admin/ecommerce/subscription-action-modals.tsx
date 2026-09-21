/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { MerchantSubscription } from "@/lib/admin/types/ecommerce";
import type { PlanCode } from "@/config/subscription-plans";
import { subscriptionPlans, getPlanByCode } from "@/config/subscription-plans";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";

const MIN_REASON_LENGTH = 8;

/* ======================================================================
   Change plan
   ====================================================================== */

interface ChangePlanModalProps {
  open: boolean;
  subscription: MerchantSubscription | null;
  onClose: () => void;
  onConfirm: (planCode: PlanCode) => void;
}

export function ChangePlanModal({
  open,
  subscription,
  onClose,
  onConfirm,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>("starter");

  useEffect(() => {
    if (!open || !subscription) return;
    setSelectedPlan(subscription.planCode);
  }, [open, subscription]);

  if (!open || !subscription) return null;

  const changed = selectedPlan !== subscription.planCode;
  const currentPlan = getPlanByCode(subscription.planCode);
  const newPlan = getPlanByCode(selectedPlan);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Change plan for " + subscription.merchantName}
      description="The new plan takes effect immediately. Billing adjusts on the next renewal."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!changed}
            onClick={() => {
              onConfirm(selectedPlan);
              onClose();
            }}
          >
            Change plan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="New plan" htmlFor="sub-new-plan" required>
          <select
            id="sub-new-plan"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as PlanCode)}
          >
            {subscriptionPlans.map((plan) => (
              <option key={plan.code} value={plan.code}>
                {plan.name}
              </option>
            ))}
          </select>
        </SettingsField>

        {changed && (
          <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Change summary
            </p>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  From
                </dt>
                <dd className="text-right font-medium">
                  {currentPlan.name}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  To
                </dt>
                <dd className="text-right font-medium">
                  {newPlan.name}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  {subscription.billingCycle === "annual"
                    ? "Annual price"
                    : "Monthly price"}
                </dt>
                <dd className="text-right font-medium">
                  {subscription.billingCycle === "annual"
                    ? newPlan.annualPrice
                    : newPlan.monthlyPrice}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {!changed && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Pick a different plan to enable the change action.
          </p>
        )}
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Apply discount
   ====================================================================== */

interface ApplyDiscountModalProps {
  open: boolean;
  subscription: MerchantSubscription | null;
  onClose: () => void;
  onConfirm: (discountPercent: number) => void;
}

export function ApplyDiscountModal({
  open,
  subscription,
  onClose,
  onConfirm,
}: ApplyDiscountModalProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription) return;
    setDraft(
      subscription.discountPercent !== undefined
        ? String(subscription.discountPercent)
        : ""
    );
    setError(null);
  }, [open, subscription]);

  if (!open || !subscription) return null;

  const parsed = Number(draft);
  const valid =
    draft.trim() !== "" &&
    Number.isFinite(parsed) &&
    parsed >= 0 &&
    parsed <= 100;

  const handleSubmit = () => {
    if (!valid) {
      setError("Enter a number between 0 and 100.");
      return;
    }
    onConfirm(parsed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Apply discount for " + subscription.merchantName}
      description="A discount reduces the merchant's recurring charge. Enter 0 to remove."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!valid} onClick={handleSubmit}>
            Apply discount
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <SettingsField
          label="Discount percent"
          htmlFor="sub-discount"
          required
          hint="Between 0 and 100."
          error={error ?? undefined}
        >
          <Input
            id="sub-discount"
            type="number"
            min={0}
            max={100}
            step={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 10"
            autoFocus
          />
        </SettingsField>

        {valid && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            New effective monthly charge:{" "}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {estimateDiscounted(subscription, parsed)}
            </span>
          </p>
        )}
      </div>
    </ModalShell>
  );
}

function estimateDiscounted(
  subscription: MerchantSubscription,
  discountPercent: number
): string {
  if (subscription.billingCycle === "annual") {
    const annual = subscription.amountPaid;
    return formatCurrency((annual * (1 - discountPercent / 100)) / 12) + " / mo";
  }
  return formatCurrency(subscription.amountPaid * (1 - discountPercent / 100));
}

/* ======================================================================
   Cancel subscription
   ====================================================================== */

interface CancelSubscriptionModalProps {
  open: boolean;
  subscription: MerchantSubscription | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelSubscriptionModal({
  open,
  subscription,
  onClose,
  onConfirm,
}: CancelSubscriptionModalProps) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setReason("");
    setError(null);
  }, [open]);

  if (!open || !subscription) return null;

  const matches = typed.trim() === subscription.merchantName;
  const trimmedReason = reason.trim();
  const reasonValid = trimmedReason.length >= MIN_REASON_LENGTH;
  const canSubmit = matches && reasonValid;

  const handleSubmit = () => {
    if (!matches) {
      setError("Type the merchant name exactly to confirm.");
      return;
    }
    if (!reasonValid) {
      setError(
        "Reason must be at least " + MIN_REASON_LENGTH + " characters."
      );
      return;
    }
    onConfirm(trimmedReason);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Cancel subscription for " + subscription.merchantName}
      description="The merchant keeps their storefront and data. Their plan status becomes Cancelled and no further charges are scheduled."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Cancel subscription
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100">
          <p className="font-medium">What happens next</p>
          <p className="mt-1">
            Billing stops immediately. The merchant can still sign in. Their
            invoices remain available. An admin can reactivate the
            subscription later.
          </p>
        </div>

        <SettingsField
          label={"Type " + subscription.merchantName + " to confirm"}
          htmlFor="sub-cancel-confirm"
          required
          error={error && !matches ? error : undefined}
        >
          <Input
            id="sub-cancel-confirm"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            placeholder={subscription.merchantName}
            autoComplete="off"
          />
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="sub-cancel-reason"
          required
          hint="Stored in the audit log and activity log."
          error={error && matches && !reasonValid ? error : undefined}
        >
          <textarea
            id="sub-cancel-reason"
            className={cn(
              "min-h-[80px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Merchant requested cancellation by email."
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {trimmedReason.length} / {MIN_REASON_LENGTH} minimum characters
        </p>
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Reactivate subscription
   ====================================================================== */

interface ReactivateSubscriptionModalProps {
  open: boolean;
  subscription: MerchantSubscription | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ReactivateSubscriptionModal({
  open,
  subscription,
  onClose,
  onConfirm,
}: ReactivateSubscriptionModalProps) {
  if (!open || !subscription) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Reactivate subscription for " + subscription.merchantName}
      description="The subscription returns to Active. Billing resumes on the next cycle."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Reactivate
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-100">
          <p className="flex items-start gap-2">
            <AtlasIcon
              name="info"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>
              Current status:{" "}
              <span className="font-medium capitalize">
                {subscription.status}
              </span>
              . The merchant keeps their data and storefront configuration.
            </span>
          </p>
        </div>
      </div>
    </ModalShell>
  );
}