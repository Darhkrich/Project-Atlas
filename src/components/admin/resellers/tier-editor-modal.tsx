/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ResellerTier,
  ServiceCategory,
  TierPercentRates,
} from "@/lib/admin/types/commission";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  MAX_PERKS,
  PERK_MAX_LENGTH,
  SERVICE_CATEGORY_LABEL,
  TIER_NAME_MAX,
} from "@/lib/admin/resellers/tier-labels";

interface TierEditorModalProps {
  open: boolean;
  mode: "create" | "edit";
  current?: ResellerTier | null;
  existingTiers: ResellerTier[];
  onClose: () => void;
  onSubmit: (input: TierDraft) => { ok: boolean; error?: string };
}

export interface TierDraft {
  name: string;
  minMonthlySales: number;
  extraCutPercent: number;
  baseCommissionRates: TierPercentRates;
  perks: string[];
}

type RateDraft = Record<ServiceCategory, string>;

interface Draft {
  name: string;
  minMonthlySales: string;
  extraCutPercent: string;
  rates: RateDraft;
  perks: string[];
  newPerk: string;
}

const RATE_KEYS: ServiceCategory[] = [
  "data",
  "airtime",
  "bills",
  "tv",
  "exam_pins",
  "other",
];

const EMPTY_DRAFT: Draft = {
  name: "",
  minMonthlySales: "0",
  extraCutPercent: "25",
  rates: {
    data: "0.4",
    airtime: "2",
    bills: "3",
    tv: "3",
    exam_pins: "3",
    other: "3",
  },
  perks: [],
  newPerk: "",
};

function draftFrom(tier: ResellerTier): Draft {
  const rates = {} as RateDraft;
  for (const key of RATE_KEYS) {
    rates[key] = String(tier.baseCommissionRates[key]);
  }
  return {
    name: tier.name,
    minMonthlySales: String(tier.minMonthlySales),
    extraCutPercent: String(tier.extraCutPercent),
    rates,
    perks: [...tier.perks],
    newPerk: "",
  };
}

export function TierEditorModal({
  open,
  mode,
  current,
  existingTiers,
  onClose,
  onSubmit,
}: TierEditorModalProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(current ? draftFrom(current) : EMPTY_DRAFT);
    setErrors({});
    setSubmitError(null);
  }, [open, current]);

  const changes = useMemo(() => {
    if (!current) return null;
    const list: { field: string; from: string; to: string }[] = [];
    const push = (field: string, from: string, to: string) => {
      if (from !== to) list.push({ field, from, to });
    };
    push("Name", current.name, draft.name.trim());
    push(
      "Min monthly revenue",
      String(current.minMonthlySales),
      draft.minMonthlySales
    );
    push(
      "Extra cut",
      `${current.extraCutPercent}%`,
      `${draft.extraCutPercent}%`
    );
    for (const key of RATE_KEYS) {
      push(
        SERVICE_CATEGORY_LABEL[key],
        `${current.baseCommissionRates[key].toFixed(2)}%`,
        `${Number(draft.rates[key]).toFixed(2)}%`
      );
    }
    push(
      "Perks",
      current.perks.join(", ") || "None",
      draft.perks.join(", ") || "None"
    );
    return list;
  }, [current, draft]);

  if (!open) return null;

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setRate = (key: ServiceCategory, value: string) =>
    setDraft((d) => ({ ...d, rates: { ...d.rates, [key]: value } }));

  const validateNumber = (
    value: string,
    min: number,
    max: number
  ): string | undefined => {
    if (!value.trim()) return "Required.";
    const n = Number(value);
    if (!Number.isFinite(n)) return "Enter a number.";
    if (n < min || n > max) return `Must be between ${min} and ${max}.`;
    return undefined;
  };

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Enter a tier name.";
    else if (draft.name.length > TIER_NAME_MAX) {
      next.name = `Must be ${TIER_NAME_MAX} characters or fewer.`;
    } else if (
      existingTiers.some(
        (t) =>
          t.id !== current?.id &&
          t.name.toLowerCase() === draft.name.trim().toLowerCase()
      )
    ) {
      next.name = "Another tier already uses that name.";
    }

    const minSalesErr = validateNumber(
      draft.minMonthlySales,
      0,
      100_000_000
    );
    if (minSalesErr) next.minMonthlySales = minSalesErr;

    const extraCutErr = validateNumber(draft.extraCutPercent, 0, 100);
    if (extraCutErr) next.extraCutPercent = extraCutErr;

    for (const key of RATE_KEYS) {
      const err = validateNumber(draft.rates[key], 0, 100);
      if (err) next[`rate_${key}`] = err;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const rates = {} as TierPercentRates;
    for (const key of RATE_KEYS) {
      rates[key] = Number(draft.rates[key]);
    }

    const result = onSubmit({
      name: draft.name.trim(),
      minMonthlySales: Number(draft.minMonthlySales),
      extraCutPercent: Number(draft.extraCutPercent),
      baseCommissionRates: rates,
      perks: draft.perks,
    });

    if (!result.ok) {
      setSubmitError(result.error ?? "Could not save the tier.");
      return;
    }
    onClose();
  };

  const addPerk = () => {
    const trimmed = draft.newPerk.trim();
    if (!trimmed) return;
    if (draft.perks.length >= MAX_PERKS) return;
    if (draft.perks.includes(trimmed)) return;
    set({
      perks: [...draft.perks, trimmed.slice(0, PERK_MAX_LENGTH)],
      newPerk: "",
    });
  };

  const removePerk = (perk: string) => {
    set({ perks: draft.perks.filter((p) => p !== perk) });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add tier" : `Edit ${current?.name ?? "tier"}`}
      description={
        mode === "create"
          ? "Define commission policy for a new reseller tier."
          : "Changes affect every reseller on this tier."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Add tier" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Tier name"
          htmlFor="tier-name"
          required
          error={errors.name}
        >
          <Input
            id="tier-name"
            value={draft.name}
            onChange={(e) => {
              set({ name: e.target.value });
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Platinum"
            autoFocus
          />
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Min monthly revenue (GHS)"
            htmlFor="tier-min"
            required
            hint="Resellers below this threshold are not eligible for this tier."
            error={errors.minMonthlySales}
          >
            <Input
              id="tier-min"
              type="number"
              min={0}
              value={draft.minMonthlySales}
              onChange={(e) => set({ minMonthlySales: e.target.value })}
            />
          </SettingsField>
          <SettingsField
            label="Extra cut (%)"
            htmlFor="tier-extra-cut"
            required
            hint="Atlas share of the markup above Atlas price."
            error={errors.extraCutPercent}
          >
            <Input
              id="tier-extra-cut"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={draft.extraCutPercent}
              onChange={(e) => set({ extraCutPercent: e.target.value })}
            />
          </SettingsField>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Base commission rates (% of order value)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {RATE_KEYS.map((key) => (
              <SettingsField
                key={key}
                label={`${SERVICE_CATEGORY_LABEL[key]} (%)`}
                htmlFor={`tier-rate-${key}`}
                required
                error={errors[`rate_${key}`]}
              >
                <Input
                  id={`tier-rate-${key}`}
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={draft.rates[key]}
                  onChange={(e) => setRate(key, e.target.value)}
                />
              </SettingsField>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Perks ({draft.perks.length}/{MAX_PERKS})
          </p>
          {draft.perks.length > 0 && (
            <ul role="list" className="mb-2 space-y-1">
              {draft.perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1 text-sm dark:bg-neutral-900"
                >
                  <span>{perk}</span>
                  <button
                    type="button"
                    onClick={() => removePerk(perk)}
                    aria-label={`Remove perk ${perk}`}
                    className="rounded-sm text-neutral-400 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          )}
          {draft.perks.length < MAX_PERKS && (
            <div className="flex gap-2">
              <Input
                aria-label="New perk"
                placeholder="e.g. Priority support"
                value={draft.newPerk}
                maxLength={PERK_MAX_LENGTH}
                onChange={(e) => set({ newPerk: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPerk();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addPerk}
                disabled={!draft.newPerk.trim()}
              >
                Add
              </Button>
            </div>
          )}
        </div>

        {changes && changes.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800 dark:bg-warning-900/20">
            <p className="mb-1 flex items-center gap-1.5 font-medium text-warning-900 dark:text-warning-100">
              <AtlasIcon
                name="alert"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
              {changes.length} change{changes.length === 1 ? "" : "s"} will
              affect every reseller on this tier
            </p>
            <ul
              role="list"
              className="space-y-0.5 text-warning-800 dark:text-warning-200"
            >
              {changes.map((c) => (
                <li key={c.field}>
                  {c.field}: <span className="line-through">{c.from}</span> →{" "}
                  {c.to}
                </li>
              ))}
            </ul>
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