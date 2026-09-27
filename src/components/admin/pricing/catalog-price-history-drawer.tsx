"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { formatRelative } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { PlanPricingRow } from "@/lib/domains/catalog";
import {
  getAuditEntries,
  subscribeToAuditStore,
  type AuditEntry,
} from "@/lib/domains/audit";

export function CatalogPriceHistoryDrawer({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: PlanPricingRow | null;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const now = useNow();

  useEffect(() => {
    if (!open || !row) return undefined;
    const load = () => {
      const all = getAuditEntries();
      setEntries(
        all
          .filter(
            (e) =>
              e.resourceId === row.planId &&
              e.action === "catalog.pricing.update"
          )
          .sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : -1
          )
      );
    };
    load();
    const unsubscribe = subscribeToAuditStore(load);
    return unsubscribe;
  }, [open, row]);

  if (!open || !row) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Price history: " + row.planName}
      description={row.categoryName + (row.network ? " · " + row.network : "")}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No pricing changes recorded for this plan yet.
        </p>
      ) : (
        <ul role="list" className="space-y-3">
          {entries.map((entry) => {
            const meta = (entry.metadata ?? {}) as {
              atlasPrice?: number;
              providerCost?: number;
              resellerPrice?: number;
              commissionRatePercent?: number;
              previousAtlasPrice?: number;
              previousProviderCost?: number;
              reason?: string;
            };
            return (
              <li
                key={entry.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.actorName}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {now ? formatRelative(entry.createdAt, now) : ""}
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {entry.actorEmail}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  {meta.previousAtlasPrice !== undefined &&
                    meta.atlasPrice !== undefined && (
                      <Row
                        label="Atlas price"
                        from={meta.previousAtlasPrice}
                        to={meta.atlasPrice}
                      />
                    )}
                  {meta.previousProviderCost !== undefined &&
                    meta.providerCost !== undefined && (
                      <Row
                        label="Provider cost"
                        from={meta.previousProviderCost}
                        to={meta.providerCost}
                      />
                    )}
                  {meta.resellerPrice !== undefined && (
                    <Row
                      label="Reseller price"
                      from={undefined}
                      to={meta.resellerPrice}
                    />
                  )}
                  {meta.commissionRatePercent !== undefined && (
                    <Row
                      label="Commission %"
                      from={undefined}
                      to={meta.commissionRatePercent}
                    />
                  )}
                </dl>
                {meta.reason && (
                  <p className="mt-2 text-xs italic text-neutral-600 dark:text-neutral-400">
                    {meta.reason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </ModalShell>
  );
}

function Row({
  label,
  from,
  to,
}: {
  label: string;
  from?: number;
  to: number;
}) {
  return (
    <div className="col-span-2 flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="tabular-nums">
        {from !== undefined ? from.toFixed(2) + " → " : ""}
        {to.toFixed(2)}
      </span>
    </div>
  );
}