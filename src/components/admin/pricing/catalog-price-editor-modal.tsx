/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  updatePlanPricing,
  type PlanPricingRow,
  type CatalogActor,
} from "@/lib/domains/catalog";

export interface CatalogPriceEditorModalProps {
  open: boolean;
  row: PlanPricingRow | null;
  actor: CatalogActor | null;
  onClose: () => void;
}

interface Draft {
  providerCost: string;
  atlasPrice: string;
  resellerPrice: string;
  commissionRatePercent: string;
  reason: string;
}

export function CatalogPriceEditorModal({
  open,
  row,
  actor,
  onClose,
}: CatalogPriceEditorModalProps) {
  const [draft, setDraft] = useState<Draft>({
    providerCost: "",
    atlasPrice: "",
    resellerPrice: "",
    commissionRatePercent: "",
    reason: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!row) return;
    setDraft({
      providerCost: row.providerCost.toString(),
      atlasPrice: row.atlasPrice.toString(),
      resellerPrice: row.resellerPrice.toString(),
      commissionRatePercent: row.commissionRatePercent.toString(),
      reason: "",
    });
    setError(null);
  }, [row]);

  if (!open || !row || !actor) return null;

  const providerCost = Number(draft.providerCost);
  const atlasPrice = Number(draft.atlasPrice);
  const resellerPrice = Number(draft.resellerPrice);
  const commissionRatePercent = Number(draft.commissionRatePercent);

  const margin = atlasPrice - providerCost;
  const marginPercent =
    atlasPrice > 0 ? (margin / atlasPrice) * 100 : 0;

  const handleSave = () => {
    if (!Number.isFinite(providerCost) || providerCost < 0) {
      setError("Provider cost must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(atlasPrice) || atlasPrice < 0) {
      setError("Atlas price must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(resellerPrice) || resellerPrice < 0) {
      setError("Reseller price must be a non-negative number.");
      return;
    }
    if (providerCost > atlasPrice) {
      setError("Provider cost cannot exceed Atlas price.");
      return;
    }
    if (resellerPrice < atlasPrice) {
      setError("Reseller price cannot be below Atlas price.");
      return;
    }
    if (
      !Number.isFinite(commissionRatePercent) ||
      commissionRatePercent < 0 ||
      commissionRatePercent > 100
    ) {
      setError("Commission rate must be between 0 and 100.");
      return;
    }
    if (draft.reason.trim().length < 3) {
      setError("Reason is required.");
      return;
    }

    updatePlanPricing({
      planId: row.planId,
      categoryId: row.categoryId,
      network: row.network,
      changes: {
        providerCost,
        atlasPrice,
        resellerPrice,
        commissionRatePercent,
      },
      reason: draft.reason.trim(),
      actor,
    });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Edit pricing: " + row.planName}
      description={row.categoryName + (row.network ? " · " + row.network : "")}
    >
      <div className="space-y-4">
        <Field label="Provider cost (GHS)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={draft.providerCost}
            onChange={(e) =>
              setDraft({ ...draft, providerCost: e.target.value })
            }
          />
        </Field>
        <Field label="Atlas price (GHS)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={draft.atlasPrice}
            onChange={(e) =>
              setDraft({ ...draft, atlasPrice: e.target.value })
            }
          />
        </Field>
        <Field label="Reseller price (GHS)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={draft.resellerPrice}
            onChange={(e) =>
              setDraft({ ...draft, resellerPrice: e.target.value })
            }
          />
        </Field>
        <Field label="Commission rate (percent)">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={draft.commissionRatePercent}
            onChange={(e) =>
              setDraft({
                ...draft,
                commissionRatePercent: e.target.value,
              })
            }
          />
        </Field>
        <Field label="Reason for change">
          <Input
            placeholder="e.g. Provider cost update"
            value={draft.reason}
            onChange={(e) =>
              setDraft({ ...draft, reason: e.target.value })
            }
          />
        </Field>

        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
          <p className="font-medium">Margin preview</p>
          <p className="mt-1">
            {formatCurrency(margin)} ({marginPercent.toFixed(1)}%)
          </p>
          {margin < 0 && (
            <p className="mt-1 text-danger-700 dark:text-danger-300">
              Provider cost exceeds Atlas price.
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save pricing
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}