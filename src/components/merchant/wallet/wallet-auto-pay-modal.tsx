/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MerchantAutoPayConfig,
  MerchantWalletRecord,
} from "@/lib/merchant/types/wallet";
import {
  AUTO_PAY_SOURCE_DESCRIPTION,
  AUTO_PAY_SOURCE_LABEL,
} from "@/lib/merchant/wallet/wallet-labels";

interface Props {
  open: boolean;
  config: MerchantAutoPayConfig | null;
  billing: MerchantWalletRecord | null;
  nextChargeAmount: number | null;
  onSetEnabled: (enabled: boolean) => Promise<{ ok: boolean; error?: string }>;
  onSetSource: (
    source: "card" | "billing_wallet"
  ) => Promise<{ ok: boolean; error?: string }>;
  onRequestCard: () => void;
  onClose: () => void;
}

export function WalletAutoPayModal({
  open,
  config,
  billing,
  nextChargeAmount,
  onSetEnabled,
  onSetSource,
  onRequestCard,
  onClose,
}: Props) {
  const [enabled, setEnabled] = useState(true);
  const [source, setSource] = useState<"card" | "billing_wallet">(
    "billing_wallet"
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !config) return;
    setEnabled(config.enabled);
    setSource(config.source);
    setError(null);
    setSubmitting(false);
  }, [open, config]);

  if (!config || !billing) return null;

  const hasCard = Boolean(config.cardRef);
  const billingCovers =
    nextChargeAmount !== null && billing.balance >= nextChargeAmount;

  const handleSave = async () => {
    setSubmitting(true);
    if (source !== config.source) {
      const r = await onSetSource(source);
      if (!r.ok) {
        setSubmitting(false);
        setError(r.error ?? "Could not change the auto-pay source.");
        return;
      }
    }
    if (enabled !== config.enabled) {
      const r = await onSetEnabled(enabled);
      if (!r.ok) {
        setSubmitting(false);
        setError(r.error ?? "Could not change the auto-pay status.");
        return;
      }
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Auto-pay settings"
      description="How Atlas charges your plan renewal."
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Auto-pay
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Atlas charges your plan renewal automatically when it is due.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? "Disable auto-pay" : "Enable auto-pay"}
            onClick={() => {
              setEnabled((v) => !v);
              setError(null);
            }}
            className={
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors " +
              (enabled ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700")
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

        {enabled && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Charge source
            </p>

            <button
              type="button"
              onClick={() => {
                setSource("billing_wallet");
                setError(null);
              }}
              aria-pressed={source === "billing_wallet"}
              className={
                "w-full rounded-lg border p-3 text-left transition-colors " +
                (source === "billing_wallet"
                  ? "border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30"
                  : "border-neutral-200 hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-800")
              }
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {AUTO_PAY_SOURCE_LABEL.billing_wallet}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {AUTO_PAY_SOURCE_DESCRIPTION.billing_wallet}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Balance: {formatCurrency(billing.balance)}
                {nextChargeAmount !== null &&
                  (billingCovers
                    ? " \u00B7 covers the next charge"
                    : " \u00B7 does not yet cover the next charge")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!hasCard) {
                  onRequestCard();
                  return;
                }
                setSource("card");
                setError(null);
              }}
              aria-pressed={source === "card"}
              className={
                "w-full rounded-lg border p-3 text-left transition-colors " +
                (source === "card"
                  ? "border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30"
                  : "border-neutral-200 hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-800")
              }
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {AUTO_PAY_SOURCE_LABEL.card}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {AUTO_PAY_SOURCE_DESCRIPTION.card}
              </p>
              {hasCard ? (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  On file: {config.cardBrand} ending {config.cardLast4}
                </p>
              ) : (
                <p className="mt-1 text-xs text-brand-700 dark:text-brand-300">
                  No card yet. Click to add one.
                </p>
              )}
            </button>

            {hasCard && (
              <button
                type="button"
                onClick={onRequestCard}
                className="text-xs font-medium text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              >
                Update card
              </button>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Saving" : "Save"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}