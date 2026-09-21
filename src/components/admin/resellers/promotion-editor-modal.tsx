/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import type { Reseller } from "@/lib/admin/types/reseller";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_PROMOTION_SERVICES,
  SERVICE_CATEGORY_LABEL,
} from "@/lib/admin/resellers/promotion-labels";
import {
  conflictingPromotions,
  previewImpact,
} from "@/lib/admin/resellers/promotion-projection";
import type { PromotionInput } from "@/lib/admin/mock/reseller-promotion-store";

type Scope = "all" | "tier" | "resellers" | "service";
type Service = "data" | "airtime" | "bills" | "tv" | "exam_pins" | "other";

interface PromotionEditorModalProps {
  open: boolean;
  mode: "create" | "edit";
  current?: ResellerPromotion | null;
  allPromotions: ResellerPromotion[];
  tiers: ResellerTier[];
  resellers: Reseller[];
  onClose: () => void;
  onSubmit: (input: PromotionInput) => { ok: boolean; error?: string };
}

interface Draft {
  name: string;
  description: string;
  scope: Scope;
  tierId: string;
  resellerIds: string[];
  services: Service[];
  boost: string;
  startDate: string;
  endDate: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  description: "",
  scope: "all",
  tierId: "",
  resellerIds: [],
  services: [...ALL_PROMOTION_SERVICES],
  boost: "0.5",
  startDate: "",
  endDate: "",
};

function isoDateOnly(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

function draftFrom(promo: ResellerPromotion): Draft {
  return {
    name: promo.name,
    description: promo.description,
    scope: promo.scope,
    tierId: promo.tierId ?? "",
    resellerIds: [...(promo.resellerIds ?? [])],
    services:
      promo.scope === "service"
        ? [...(promo.serviceCategories ?? [])]
        : [...ALL_PROMOTION_SERVICES],
    boost: String(promo.boostPercentPoints),
    startDate: isoDateOnly(promo.startDate),
    endDate: isoDateOnly(promo.endDate),
  };
}

export function PromotionEditorModal({
  open,
  mode,
  current,
  allPromotions,
  tiers,
  resellers,
  onClose,
  onSubmit,
}: PromotionEditorModalProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(current ? draftFrom(current) : EMPTY_DRAFT);
    setErrors({});
    setSubmitError(null);
  }, [open, current]);

  const set = (patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const previewPromo = useMemo<ResellerPromotion | null>(() => {
    if (!draft.startDate || !draft.endDate) return null;
    const startIso = draft.startDate + "T00:00:00.000Z";
    const endIso = draft.endDate + "T23:59:59.999Z";
    return {
      id: current?.id ?? "PREVIEW",
      name: draft.name || "Preview",
      description: draft.description,
      scope: draft.scope,
      tierId: draft.scope === "tier" ? draft.tierId : undefined,
      resellerIds:
        draft.scope === "resellers" ? draft.resellerIds : undefined,
      serviceCategories:
        draft.scope === "service" ? draft.services : undefined,
      boostPercentPoints: Number(draft.boost) || 0,
      startDate: startIso,
      endDate: endIso,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Preview",
    };
  }, [draft, current]);

  const impact = useMemo(
    () =>
      previewPromo
        ? previewImpact(previewPromo, tiers, resellers)
        : null,
    [previewPromo, tiers, resellers]
  );

  const conflicts = useMemo(() => {
    if (!previewPromo) return [];
    const now = Date.now();
    return conflictingPromotions(previewPromo, allPromotions, now);
  }, [previewPromo, allPromotions]);

  if (!open) return null;

  const toggleService = (service: Service) => {
    setDraft((d) => ({
      ...d,
      services: d.services.includes(service)
        ? d.services.filter((s) => s !== service)
        : [...d.services, service],
    }));
  };

  const toggleReseller = (id: string) => {
    setDraft((d) => ({
      ...d,
      resellerIds: d.resellerIds.includes(id)
        ? d.resellerIds.filter((x) => x !== id)
        : [...d.resellerIds, id],
    }));
  };

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Enter a name.";
    if (!draft.description.trim()) next.description = "Enter a description.";
    const boost = Number(draft.boost);
    if (!Number.isFinite(boost) || boost <= 0 || boost > 20) {
      next.boost = "Between 0 and 20 percentage points.";
    }
    if (!draft.startDate) next.startDate = "Choose a start date.";
    if (!draft.endDate) next.endDate = "Choose an end date.";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      next.endDate = "End date must be on or after start date.";
    }
    if (draft.scope === "tier" && !draft.tierId) {
      next.tierId = "Choose a tier.";
    }
    if (draft.scope === "resellers" && draft.resellerIds.length === 0) {
      next.resellerIds = "Choose at least one reseller.";
    }
    if (draft.scope === "service" && draft.services.length === 0) {
      next.services = "Choose at least one service.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const result = onSubmit({
      name: draft.name.trim(),
      description: draft.description.trim(),
      scope: draft.scope,
      tierId: draft.scope === "tier" ? draft.tierId : undefined,
      resellerIds:
        draft.scope === "resellers" ? draft.resellerIds : undefined,
      serviceCategories:
        draft.scope === "service" ? draft.services : undefined,
      boostPercentPoints: boost,
      startDate: draft.startDate + "T00:00:00.000Z",
      endDate: draft.endDate + "T23:59:59.999Z",
    });

    if (!result.ok) {
      setSubmitError(result.error ?? "Could not save promotion.");
      return;
    }
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "New commission boost" : "Edit commission boost"}
      description={
        mode === "create"
          ? "Boost reseller commission rates for a defined window."
          : "Changes affect what every included reseller earns going forward."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Create boost" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Name"
          htmlFor="promo-name"
          required
          error={errors.name}
        >
          <Input
            id="promo-name"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Data Boost — All Tiers"
            autoFocus
          />
        </SettingsField>

        <SettingsField
          label="Description"
          htmlFor="promo-description"
          required
          error={errors.description}
        >
          <textarea
            id="promo-description"
            className={cn(
              "min-h-[64px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="One sentence describing the boost."
          />
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Boost (percentage points)"
            htmlFor="promo-boost"
            required
            hint="Added to each base rate. +0.4 turns Gold data from 0.6% to 1.0%."
            error={errors.boost}
          >
            <Input
              id="promo-boost"
              type="number"
              min={0}
              max={20}
              step="0.1"
              value={draft.boost}
              onChange={(e) => set({ boost: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Scope" htmlFor="promo-scope" required>
            <select
              id="promo-scope"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.scope}
              onChange={(e) => set({ scope: e.target.value as Scope })}
            >
              <option value="all">All resellers</option>
              <option value="tier">Specific tier</option>
              <option value="resellers">Specific resellers</option>
              <option value="service">Specific services</option>
            </select>
          </SettingsField>
        </div>

        {draft.scope === "tier" && (
          <SettingsField
            label="Tier"
            htmlFor="promo-tier"
            required
            error={errors.tierId}
          >
            <select
              id="promo-tier"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.tierId}
              onChange={(e) => set({ tierId: e.target.value })}
            >
              <option value="">Choose a tier</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </SettingsField>
        )}

        {draft.scope === "resellers" && (
          <SettingsField
            label="Resellers"
            htmlFor="promo-resellers"
            required
            hint={
              draft.resellerIds.length +
              " of " +
              resellers.length +
              " selected"
            }
            error={errors.resellerIds}
          >
            <div
              id="promo-resellers"
              className="max-h-56 overflow-y-auto rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
            >
              <ul role="list" className="space-y-1">
                {resellers.map((r) => (
                  <li key={r.id}>
                    <label className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <input
                        type="checkbox"
                        checked={draft.resellerIds.includes(r.id)}
                        onChange={() => toggleReseller(r.id)}
                        className="h-4 w-4"
                      />
                      <span className="flex-1 truncate">{r.businessName}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {r.tierName}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </SettingsField>
        )}

        {draft.scope === "service" && (
          <SettingsField
            label="Services"
            htmlFor="promo-services"
            required
            hint={
              draft.services.length +
              " of " +
              ALL_PROMOTION_SERVICES.length +
              " selected"
            }
            error={errors.services}
          >
            <div
              id="promo-services"
              className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
            >
              {ALL_PROMOTION_SERVICES.map((s) => {
                const active = draft.services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      active
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    )}
                  >
                    {SERVICE_CATEGORY_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </SettingsField>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Start date"
            htmlFor="promo-start"
            required
            error={errors.startDate}
          >
            <Input
              id="promo-start"
              type="date"
              value={draft.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
            />
          </SettingsField>
          <SettingsField
            label="End date"
            htmlFor="promo-end"
            required
            error={errors.endDate}
          >
            <Input
              id="promo-end"
              type="date"
              value={draft.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </SettingsField>
        </div>

        {impact && impact.rows.length > 0 && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-800">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Impact preview
            </p>
            <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
              {impact.affectedResellerCount} resellers across{" "}
              {impact.affectedTierCount} tier
              {impact.affectedTierCount === 1 ? "" : "s"} would receive this
              boost.
            </p>
            <table className="mt-2 w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th scope="col" className="py-1">
                    Tier
                  </th>
                  <th scope="col" className="py-1">
                    Service
                  </th>
                  <th scope="col" className="py-1 text-right">
                    Base
                  </th>
                  <th scope="col" className="py-1 text-right">
                    Boosted
                  </th>
                </tr>
              </thead>
              <tbody>
                {impact.rows.slice(0, 8).map((row, i) => (
                  <tr
                    key={row.tierId + row.service + i}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-1">{row.tierName}</td>
                    <td className="py-1">
                      {SERVICE_CATEGORY_LABEL[row.service]}
                    </td>
                    <td className="py-1 text-right">
                      {row.baseRate.toFixed(2)}%
                    </td>
                    <td className="py-1 text-right font-medium text-success-700 dark:text-success-300">
                      {row.boostedRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {impact.rows.length > 8 && (
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                +{impact.rows.length - 8} more combinations
              </p>
            )}
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
            <p className="flex items-center gap-1.5 font-medium text-warning-900 dark:text-warning-100">
              <AtlasIcon
                name="alert"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
              {conflicts.length} overlapping boost
              {conflicts.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-1 space-y-0.5 text-warning-800 dark:text-warning-200">
              {conflicts.map((c) => (
                <li key={c.id}>
                  {c.name} ({c.boostPercentPoints}pp)
                </li>
              ))}
            </ul>
            <p className="mt-1 text-warning-800 dark:text-warning-200">
              Boosts stack additively for affected resellers.
            </p>
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {submitError}
          </p>
        )}
      </div>
    </ModalShell>
  );
}