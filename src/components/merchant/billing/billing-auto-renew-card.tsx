"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency, formatDate } from "@/lib/shared/format";
import type {
  MerchantAutoPayConfig,
} from "@/lib/merchant/types/wallet";
import type { RenewalStatusView } from "@/lib/merchant/subscription/types";

interface Props {
  autoPay: MerchantAutoPayConfig | null;
  renewal: RenewalStatusView;
  billingBalance: number;
  billingFrozen: boolean;
  disabled?: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
}

function describeSource(
  autoPay: MerchantAutoPayConfig | null,
  billingBalance: number
): string {
  if (!autoPay) return "Configure auto-pay to renew automatically.";
  if (autoPay.source === "card") {
    if (autoPay.cardBrand && autoPay.cardLast4) {
      return (
        "Atlas will charge your " +
        autoPay.cardBrand +
        " ending " +
        autoPay.cardLast4 +
        "."
      );
    }
    return "Atlas will charge your saved card.";
  }
  return (
    "Atlas will debit your billing wallet. Balance: " +
    formatCurrency(billingBalance) +
    "."
  );
}

export function BillingAutoRenewCard({
  autoPay,
  renewal,
  billingBalance,
  billingFrozen,
  disabled,
  onToggle,
  onConfigure,
}: Props) {
  const enabled = autoPay?.enabled ?? false;
  const canToggle = !disabled && !billingFrozen && !renewal.isCancelled;

  const nextChargeLabel = renewal.isCancelled
    ? "This plan will end on " + formatDate(renewal.nextChargeAt ?? "") + "."
    : renewal.nextChargeAt
    ? "Next renewal: " + formatDate(renewal.nextChargeAt) + "."
    : "No renewal scheduled.";

  return (
    <AtlasCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Auto-renew
          </p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            {enabled
              ? describeSource(autoPay, billingBalance)
              : "Auto-renew is off. Renew manually before your cycle ends to avoid losing access."}
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {nextChargeLabel}
          </p>
          {renewal.isPastDue && (
            <p
              role="alert"
              className="mt-2 text-xs font-medium text-warning-700 dark:text-warning-300"
            >
              A charge did not go through. Update your payment method.
            </p>
          )}
          {billingFrozen && (
            <p
              role="alert"
              className="mt-2 text-xs font-medium text-danger-700 dark:text-danger-400"
            >
              Your billing wallet is frozen. Auto-renew cannot run.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? "Disable auto-renew" : "Enable auto-renew"}
            disabled={!canToggle}
            onClick={() => onToggle(!enabled)}
            className={
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 " +
              (enabled
                ? "bg-brand-600"
                : "bg-neutral-300 dark:bg-neutral-700")
            }
          >
            <span
              className={
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
                (enabled ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-end border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={onConfigure}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
        >
          <AtlasIcon name="credit-card" className="h-3.5 w-3.5" aria-hidden="true" />
          Manage payment methods
        </button>
      </div>
    </AtlasCard>
  );
}