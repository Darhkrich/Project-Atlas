"use client";

import { useMemo, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { projectProviderPayoutPreviewForPeriod } from "@/lib/domains/treasury/provider-payout-projection";
import type { ProviderPayoutPreview } from "@/lib/domains/treasury/provider-payout-types";
import type { PayoutOrderInput } from "@/lib/domains/treasury/provider-payout-types";
import type { ServiceCategory } from "@/lib/domains/catalog";

export interface ProviderOption {
  id: string;
  name: string;
}

export function ProviderPayoutCreateModal({
  open,
  availablePeriodIds,
  providers,
  orders,
  catalog,
  onClose,
  onSubmit,
}: {
  open: boolean;
  availablePeriodIds: string[];
  providers: ProviderOption[];
  orders: PayoutOrderInput[];
  catalog: ServiceCategory[];
  onClose: () => void;
  onSubmit: (input: {
    periodId: string;
    providerId: string;
    providerName: string;
    notes?: string;
  }) => void;
}) {
  const [periodId, setPeriodId] = useState<string>(
    availablePeriodIds[0] ?? ""
  );
  const [providerId, setProviderId] = useState<string>(
    providers[0]?.id ?? ""
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const providerNameById = useMemo(
    () => new Map(providers.map((p) => [p.id, p.name])),
    [providers]
  );

  const previews: ProviderPayoutPreview[] = useMemo(() => {
    if (!periodId) return [];
    try {
      return projectProviderPayoutPreviewForPeriod({
        periodId,
        orders,
        catalog,
        providerNameById,
      });
    } catch {
      return [];
    }
  }, [periodId, orders, catalog, providerNameById]);

  const selectedPreview = useMemo(
    () => previews.find((p) => p.providerId === providerId) ?? null,
    [previews, providerId]
  );

  if (!open) return null;

  const handleConfirm = () => {
    if (!periodId) {
      setError("Pick a period.");
      return;
    }
    if (!providerId) {
      setError("Pick a provider.");
      return;
    }
    if (!selectedPreview || selectedPreview.totalAmount <= 0) {
      setError(
        "No payable amount for this provider in the selected period."
      );
      return;
    }
    onSubmit({
      periodId,
      providerId,
      providerName: selectedPreview.providerName,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="New provider payout batch"
      description="One batch per provider and period. Only completed periods."
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Period
            </span>
            <select
              aria-label="Period"
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
            >
              {availablePeriodIds.length === 0 && (
                <option value="">No closed periods available</option>
              )}
              {availablePeriodIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Provider
            </span>
            <select
              aria-label="Provider"
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Notes (optional)
          </span>
          <Input
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context for approvers"
          />
        </label>

        {selectedPreview && (
          <section className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <p className="text-sm font-medium">Preview</p>
              <p className="text-sm tabular-nums">
                {formatCurrency(selectedPreview.totalAmount)} ·{" "}
                {selectedPreview.orderCount} orders
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Preview lines</caption>
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      Plan
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      Orders
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      Excluded
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPreview.lines.map((line) => (
                    <tr
                      key={line.id}
                      className="border-t border-neutral-100 dark:border-neutral-800/60"
                    >
                      <td className="px-3 py-2">{line.planName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {line.orderCount}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-warning-700 dark:text-warning-300">
                        {line.excludedOrderCount > 0
                          ? line.excludedOrderCount
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedPreview.excludedOrderCount > 0 && (
              <p className="border-t border-neutral-200 px-3 py-2 text-xs text-warning-700 dark:border-neutral-800 dark:text-warning-300">
                {selectedPreview.excludedOrderCount} orders excluded because
                their plans lack a configured provider cost.
              </p>
            )}
          </section>
        )}

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
          <Button size="sm" onClick={handleConfirm}>
            Create draft
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}