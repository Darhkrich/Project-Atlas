/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { PlanPricing } from "@/lib/admin/types/plan-pricing";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface PlanPricingDetailDrawerProps {
  plan: PlanPricing | null;
  onClose: () => void;
  onSave?: (plan: PlanPricing, changes: {
    providerCost: number;
    atlasPrice: number;
    resellerPrice: number;
    commissionRate: number;
    status: "active" | "inactive";
    reason: string;
  }) => void;
}

export function PlanPricingDetailDrawer({
  plan,
  onClose,
  onSave,
}: PlanPricingDetailDrawerProps) {
  const [providerCost, setProviderCost] = useState(plan?.providerCost ?? 0);
  const [atlasPrice, setAtlasPrice] = useState(plan?.atlasPrice ?? 0);
  const [resellerPrice, setResellerPrice] = useState(plan?.resellerPrice ?? 0);
  const [commissionRate, setCommissionRate] = useState(plan?.commissionRate ?? 0);
  const [status, setStatus] = useState<"active" | "inactive">(plan?.status ?? "active");
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!plan) return null;

  const currentMargin = plan.atlasPrice - plan.providerCost;
  const currentMarginPercent =
    plan.atlasPrice > 0 ? (currentMargin / plan.atlasPrice) * 100 : 0;

  const newMargin = atlasPrice - providerCost;
  const newMarginPercent = atlasPrice > 0 ? (newMargin / atlasPrice) * 100 : 0;

  const marginDiff = newMarginPercent - currentMarginPercent;

  const hasChanges =
    providerCost !== plan.providerCost ||
    atlasPrice !== plan.atlasPrice ||
    resellerPrice !== plan.resellerPrice ||
    commissionRate !== plan.commissionRate ||
    status !== plan.status;

  const handleSave = () => {
    if (onSave) {
      onSave(plan, {
        providerCost,
        atlasPrice,
        resellerPrice,
        commissionRate,
        status,
        reason,
      });
    }
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold">{plan.planName}</h2>
            <p className="text-xs text-neutral-500">
              {plan.serviceCategory}
              {plan.network && ` · ${plan.network}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Current margin */}
          <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <p className="text-xs font-medium text-neutral-500">
              Current Margin
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-bold",
                currentMarginPercent >= 10
                  ? "text-success-600"
                  : currentMarginPercent >= 5
                  ? "text-warning-600"
                  : "text-danger-600"
              )}
            >
              {formatCurrency(currentMargin)} ({currentMarginPercent.toFixed(2)}%)
            </p>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Provider Cost (GHS)
              </label>
              <Input
                type="number"
                value={providerCost}
                onChange={(e) => setProviderCost(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Atlas Price (GHS)
              </label>
              <Input
                type="number"
                value={atlasPrice}
                onChange={(e) => setAtlasPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Reseller Price (GHS)
              </label>
              <Input
                type="number"
                value={resellerPrice}
                onChange={(e) => setResellerPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Commission Rate (%)
              </label>
              <Input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">Status</label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Reason for Change
              </label>
              <Input
                placeholder="e.g., Provider cost update"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* New margin preview */}
          {hasChanges && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-900/20">
              <p className="text-xs font-medium text-brand-700 dark:text-brand-300">
                Preview of Changes
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Current Margin</span>
                  <span>{currentMarginPercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>New Margin</span>
                  <span>{newMarginPercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Change</span>
                  <span
                    className={
                      marginDiff >= 0 ? "text-success-600" : "text-danger-600"
                    }
                  >
                    {marginDiff >= 0 ? "+" : ""}
                    {marginDiff.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!hasChanges}
            onClick={() => setShowConfirm(true)}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Pricing Change"
        description={`Apply these price changes to ${plan.planName}? This will affect all future transactions.`}
        confirmLabel="Confirm"
        danger={marginDiff < 0}
        onConfirm={handleSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}