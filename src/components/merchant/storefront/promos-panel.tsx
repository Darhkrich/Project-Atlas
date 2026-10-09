"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToggleRow } from "./toggle-row";
import {
  MAX_PROMO_BANNERS,
  PROMO_INTERVAL_OPTIONS,
  PROMO_PLACEMENT_DESCRIPTIONS,
  PROMO_PLACEMENT_LABELS,
  PROMO_PLACEMENT_SIZES,
  PROMO_TRANSITION_DESCRIPTIONS,
  PROMO_TRANSITION_LABELS,
} from "@/lib/merchant/storefront/promos-constants";
import type {
  MerchantStorefrontConfig,
  PromoBanner,
  PromoPlacement,
  PromoTransition,
} from "@/types/merchant-storefront";
import { PromoBannerRow } from "./promo-banner-row";
import { PromoBannerFormModal } from "./promo-banner-form-modal";
import { PromosEmptyState } from "./promos-empty-state";

interface PromosPanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
}

const PLACEMENTS: PromoPlacement[] = [
  "before_hero",
  "after_hero",
  "as_hero_background",
];

const TRANSITIONS: PromoTransition[] = ["auto", "manual", "both"];

export function PromosPanel({ draft, setField }: PromosPanelProps) {
  const banners = draft.promoBanners ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoBanner | null>(null);

  const placement = draft.promoPlacement ?? "after_hero";
  const transition = draft.promoTransition ?? "auto";
  const interval = draft.promoAutoIntervalMs ?? 5000;
  const loop = draft.promoLoop ?? true;

  const atMax = banners.length >= MAX_PROMO_BANNERS;
  const showInterval = transition === "auto" || transition === "both";
  const showCarouselControls =
    banners.length > 1 && (transition === "manual" || transition === "both");

  function handleOpenCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleOpenEdit(banner: PromoBanner) {
    setEditing(banner);
    setFormOpen(true);
  }

  function handleSubmit(input: Omit<PromoBanner, "id" | "order">) {
    if (editing) {
      const next = banners.map((b) =>
        b.id === editing.id ? { ...b, ...input } : b
      );
      setField("promoBanners", next);
    } else {
      const created: PromoBanner = {
        ...input,
        id: crypto.randomUUID(),
        order: banners.length,
      };
      setField("promoBanners", [...banners, created]);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleToggleEnabled(banner: PromoBanner, next: boolean) {
    const updated = banners.map((b) =>
      b.id === banner.id ? { ...b, enabled: next } : b
    );
    setField("promoBanners", updated);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const next = banners.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setField(
      "promoBanners",
      next.map((b, i) => ({ ...b, order: i }))
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const next = banners
      .filter((b) => b.id !== deleteTarget.id)
      .map((b, i) => ({ ...b, order: i }));
    setField("promoBanners", next.length > 0 ? next : undefined);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Banners
        </h3>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Manage the banners your customers see on the storefront.
        </p>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Placement
        </p>
        <ul role="list" className="space-y-2">
          {PLACEMENTS.map((p) => {
            const selected = placement === p;
            return (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => setField("promoPlacement", p)}
                  aria-pressed={selected}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition",
                    selected
                      ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                      : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      selected
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-neutral-900 dark:text-neutral-100"
                    )}
                  >
                    {PROMO_PLACEMENT_LABELS[p]}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {PROMO_PLACEMENT_DESCRIPTIONS[p]}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                    {PROMO_PLACEMENT_SIZES[p]}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Banners ({banners.length} of {MAX_PROMO_BANNERS})
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={atMax}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {"+ Add banner"}
          </button>
        </div>

        {banners.length === 0 ? (
          <PromosEmptyState onCreate={handleOpenCreate} />
        ) : (
          <ul role="list" className="space-y-2">
            {banners.map((banner, index) => (
              <PromoBannerRow
                key={banner.id}
                banner={banner}
                isFirst={index === 0}
                isLast={index === banners.length - 1}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                onToggleEnabled={(next) => handleToggleEnabled(banner, next)}
                onEdit={() => handleOpenEdit(banner)}
                onDelete={() => setDeleteTarget(banner)}
              />
            ))}
          </ul>
        )}
      </div>

      {banners.length > 0 && (
        <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Rotation
          </p>

          {banners.length === 1 ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
              A single banner renders statically. Add another to turn it into
              a carousel.
            </p>
          ) : (
            <>
              <ul role="list" className="space-y-2">
                {TRANSITIONS.map((t) => {
                  const selected = transition === t;
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => setField("promoTransition", t)}
                        aria-pressed={selected}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition",
                          selected
                            ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                            : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            selected
                              ? "text-brand-700 dark:text-brand-300"
                              : "text-neutral-900 dark:text-neutral-100"
                          )}
                        >
                          {PROMO_TRANSITION_LABELS[t]}
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {PROMO_TRANSITION_DESCRIPTIONS[t]}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {showInterval && (
                <div>
                  <label
                    htmlFor="promo-interval"
                    className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Rotation speed
                  </label>
                  <select
                    id="promo-interval"
                    value={String(interval)}
                    onChange={(e) =>
                      setField("promoAutoIntervalMs", Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    {PROMO_INTERVAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <ToggleRow
                label="Loop forever"
                description="Restart from the first banner after the last one."
                checked={loop}
                onChange={(next) => setField("promoLoop", next)}
              />
            </>
          )}

          {showCarouselControls && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Customers see dots and can swipe between banners.
            </p>
          )}
        </div>
      )}

      <PromoBannerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        banner={editing}
        placement={placement}
        category={draft.templateCategory}
        onSubmit={handleSubmit}
      />

      {deleteTarget && (
        <DeleteBannerConfirm
          banner={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

interface DeleteBannerConfirmProps {
  banner: PromoBanner;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteBannerConfirm({
  banner,
  onCancel,
  onConfirm,
}: DeleteBannerConfirmProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Delete banner"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Delete banner
        </h3>
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {banner.headline || "(no headline)"} will be removed. This cannot be
          undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-danger-600 px-3 py-2 text-xs font-semibold text-white hover:bg-danger-700"
          >
            Delete banner
          </button>
        </div>
      </div>
    </div>
  );
}