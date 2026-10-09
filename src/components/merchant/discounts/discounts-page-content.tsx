/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useDiscounts } from "@/lib/merchant/storefront/discounts/use-discounts";
import type { Discount } from "@/types/merchant-storefront";
import { DiscountRow } from "./discount-row";
import { DiscountsEmptyState } from "./discounts-empty-state";
import { DiscountFormModal } from "./discount-form-modal";
import { DiscountDeleteModal } from "./discount-delete-modal";

type StatusFilter = "All" | "Active" | "Disabled" | "Expired";

const FILTERS: StatusFilter[] = ["All", "Active", "Disabled", "Expired"];

export function DiscountsPageContent() {
  const { storefrontConfig } = useStorefrontConfig();
  const storefrontId = storefrontConfig.storefrontId;
  const { discounts, create, update, remove, setEnabled } =
    useDiscounts(storefrontId);

  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [deleting, setDeleting] = useState<Discount | null>(null);

  function isExpired(d: Discount): boolean {
    return typeof d.expiresAt === "number" && d.expiresAt < now;
  }

  const counts = useMemo(() => {
    let active = 0;
    let disabled = 0;
    let expired = 0;
    for (const d of discounts) {
      if (isExpired(d)) expired++;
      else if (d.enabled) active++;
      else disabled++;
    }
    return { active, disabled, expired };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discounts, now]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return discounts.filter((d) => {
      if (term.length > 0 && !d.code.toLowerCase().includes(term)) return false;
      if (status === "All") return true;
      if (status === "Expired") return isExpired(d);
      if (status === "Active") return d.enabled && !isExpired(d);
      if (status === "Disabled") return !d.enabled;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discounts, search, status, now]);

  function handleOpenCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleOpenEdit(d: Discount) {
    setEditing(d);
    setFormOpen(true);
  }

  function handleSubmit(input: Omit<Discount, "id" | "usedCount">) {
    if (editing) {
      update(editing.id, input);
    } else {
      create(input);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!deleting) return;
    remove(deleting.id);
    setDeleting(null);
  }

  const existingCodes = discounts.map((d) => d.code);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Discounts
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Codes customers can use at checkout. {discounts.length}{" "}
            {discounts.length === 1 ? "code" : "codes"} total.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:self-auto"
        >
          <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
          New discount
        </button>
      </div>

      {discounts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Active" value={counts.active} tone="success" />
          <SummaryCard label="Disabled" value={counts.disabled} tone="neutral" />
          <SummaryCard label="Expired" value={counts.expired} tone="danger" />
        </div>
      )}

      {discounts.length === 0 ? (
        <DiscountsEmptyState onCreate={handleOpenCreate} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="discount-search" className="sr-only">
                Search codes
              </label>
              <input
                id="discount-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search codes"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </div>
            <ul role="list" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const selected = status === f;
                return (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => setStatus(f)}
                      aria-pressed={selected}
                      className={
                        selected
                          ? "rounded-full border border-brand-600 bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white"
                          : "rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
                      }
                    >
                      {f}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No discounts match these filters.
            </p>
          ) : (
            <ul role="list" className="space-y-3">
              {visible.map((d) => (
                <DiscountRow
                  key={d.id}
                  discount={d}
                  now={now}
                  onToggleEnabled={(next) => setEnabled(d.id, next)}
                  onEdit={() => handleOpenEdit(d)}
                  onDelete={() => setDeleting(d)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <DiscountFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        existing={editing}
        existingCodes={existingCodes.filter(
          (c) => !editing || c !== editing.code
        )}
        onSubmit={handleSubmit}
      />

      <DiscountDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        code={deleting?.code ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  tone: "success" | "neutral" | "danger";
}

const SUMMARY_TONE: Record<SummaryCardProps["tone"], string> = {
  success:
    "border-success-200 bg-success-50 dark:border-success-900 dark:bg-success-900/20",
  neutral:
    "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
  danger:
    "border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-900/20",
};

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <div className={SUMMARY_TONE[tone] + " rounded-xl border p-4"}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}