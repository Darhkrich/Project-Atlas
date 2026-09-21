/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Promotion,
  PromotionAudience,
  PromotionMechanic,
  PromotionServiceCategory,
  PromotionSurface,
} from "@/lib/admin/types/promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { PromotionAudienceFields } from "./promotion-audience-fields";
import {
  PromotionMechanicFields,
  type MechanicDraft,
} from "./promotion-mechanic-fields";
import {
  PromotionConditionsEditor,
  type ConditionsDraft,
} from "./promotion-conditions-editor";
import {
  MECHANIC_KIND_LABEL,
  PROMOTION_AUDIENCE_LABEL,
  PROMOTION_SERVICE_LABEL,
  mechanicSummary,
} from "@/lib/admin/promotions/promotion-labels";
import type { PromotionInput } from "@/lib/admin/mock/promotion-store";

interface PromotionEditorModalProps {
  open: boolean;
  mode: "create" | "edit";
  current?: Promotion | null;
  tiers: ResellerTier[];
  onClose: () => void;
  onSubmit: (input: PromotionInput) => { ok: boolean; error?: string };
}

interface Draft {
  name: string;
  description: string;
  audience: PromotionAudience;
  surfaces: PromotionSurface[];
  mechanic: MechanicDraft;
  conditions: ConditionsDraft;
  startDate: string;
  endDate: string;
}

const EMPTY_MECHANIC: MechanicDraft = {
  kind: "auto_discount",
  discountMode: "percent",
  discountValue: "",
  cashbackPercent: "",
  pointsPerGHS: "",
  subscriptionPercent: "",
};

const EMPTY_CONDITIONS: ConditionsDraft = {
  minOrders: "",
  firstOrderOnly: false,
  minSpendGHS: "",
  maxSpendGHS: "",
  serviceScope: [],
  tierIds: [],
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDateOnly(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

const EMPTY_DRAFT: Draft = {
  name: "",
  description: "",
  audience: "customer",
  surfaces: ["atlas_d2c"],
  mechanic: EMPTY_MECHANIC,
  conditions: EMPTY_CONDITIONS,
  startDate: today(),
  endDate: "",
};

function mechanicFrom(promo: Promotion): MechanicDraft {
  const m = promo.mechanic;
  const base = { ...EMPTY_MECHANIC, kind: m.kind };
  if (m.kind === "auto_discount") {
    return {
      ...base,
      discountMode: m.mode,
      discountValue: String(m.value),
    };
  }
  if (m.kind === "cashback") {
    return { ...base, cashbackPercent: String(m.percent) };
  }
  if (m.kind === "atlas_points") {
    return { ...base, pointsPerGHS: String(m.pointsPerGHS) };
  }
  return { ...base, subscriptionPercent: String(m.percent) };
}

function conditionsFrom(promo: Promotion): ConditionsDraft {
  const c = promo.conditions;
  return {
    minOrders: typeof c.minOrders === "number" ? String(c.minOrders) : "",
    firstOrderOnly: c.firstOrderOnly ?? false,
    minSpendGHS:
      typeof c.minSpendGHS === "number" ? String(c.minSpendGHS) : "",
    maxSpendGHS:
      typeof c.maxSpendGHS === "number" ? String(c.maxSpendGHS) : "",
    serviceScope: [...(c.serviceScope ?? [])],
    tierIds: [...(c.tierIds ?? [])],
  };
}

function draftFrom(promo: Promotion): Draft {
  return {
    name: promo.name,
    description: promo.description,
    audience: promo.audience,
    surfaces: [...promo.surfaces],
    mechanic: mechanicFrom(promo),
    conditions: conditionsFrom(promo),
    startDate: isoDateOnly(promo.startDate),
    endDate: isoDateOnly(promo.endDate),
  };
}

/* ------------------------------ Preview ------------------------------- */

interface PreviewShape {
  audienceLabel: string;
  mechanicLabel: string;
  mechanicSummaryText: string;
  services: string[];
  surfaceCount: number;
}

function buildPreview(draft: Draft): PreviewShape {
  const mechanicLabel = MECHANIC_KIND_LABEL[draft.mechanic.kind];
  let mechanicSummaryText = "";
  if (draft.mechanic.kind === "auto_discount") {
    mechanicSummaryText =
      draft.mechanic.discountMode === "percent"
        ? draft.mechanic.discountValue + "% off"
        : "GHS " + draft.mechanic.discountValue + " off";
  } else if (draft.mechanic.kind === "cashback") {
    mechanicSummaryText = draft.mechanic.cashbackPercent + "% cashback";
  } else if (draft.mechanic.kind === "atlas_points") {
    mechanicSummaryText =
      draft.mechanic.pointsPerGHS + " points per GHS";
  } else {
    mechanicSummaryText =
      draft.mechanic.subscriptionPercent + "% off subscriptions";
  }
  return {
    audienceLabel: PROMOTION_AUDIENCE_LABEL[draft.audience],
    mechanicLabel,
    mechanicSummaryText,
    services:
      draft.conditions.serviceScope.length === 0
        ? ["All services"]
        : draft.conditions.serviceScope.map(
            (s) => PROMOTION_SERVICE_LABEL[s]
          ),
    surfaceCount: draft.surfaces.length,
  };
}

/* ======================================================================
   Modal
   ====================================================================== */

export function PromotionEditorModal({
  open,
  mode,
  current,
  tiers,
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

  const preview = useMemo(() => buildPreview(draft), [draft]);

  if (!open) return null;

  const set = (patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const setMechanic = (patch: Partial<MechanicDraft>) =>
    setDraft((d) => ({ ...d, mechanic: { ...d.mechanic, ...patch } }));

  const setConditions = (patch: Partial<ConditionsDraft>) =>
    setDraft((d) => ({ ...d, conditions: { ...d.conditions, ...patch } }));

  const toggleSurface = (s: PromotionSurface) => {
    setDraft((d) => ({
      ...d,
      surfaces: d.surfaces.includes(s)
        ? d.surfaces.filter((x) => x !== s)
        : [...d.surfaces, s],
    }));
  };

  const handleAudienceChange = (audience: PromotionAudience) => {
    // Reset mechanic when audience changes if the current mechanic is not
    // valid for the new audience.
    const currentKind = draft.mechanic.kind;
    const valid =
      audience === "customer"
        ? ["auto_discount", "cashback", "atlas_points"]
        : audience === "merchant"
        ? ["auto_discount", "cashback", "subscription_discount"]
        : ["auto_discount", "cashback"];
    const nextMechanic: MechanicDraft = valid.includes(currentKind)
      ? draft.mechanic
      : { ...EMPTY_MECHANIC, kind: valid[0] as PromotionMechanic["kind"] };
    setDraft((d) => ({
      ...d,
      audience,
      mechanic: nextMechanic,
      conditions:
        audience === "reseller"
          ? d.conditions
          : { ...d.conditions, tierIds: [] },
    }));
  };

  const buildMechanic = (): PromotionMechanic => {
    const m = draft.mechanic;
    if (m.kind === "auto_discount") {
      return {
        kind: "auto_discount",
        mode: m.discountMode,
        value: Number(m.discountValue),
      };
    }
    if (m.kind === "cashback") {
      return { kind: "cashback", percent: Number(m.cashbackPercent) };
    }
    if (m.kind === "atlas_points") {
      return { kind: "atlas_points", pointsPerGHS: Number(m.pointsPerGHS) };
    }
    return {
      kind: "subscription_discount",
      percent: Number(m.subscriptionPercent),
    };
  };

  const parseOptional = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Enter a name.";
    if (!draft.description.trim()) next.description = "Enter a description.";
    if (draft.surfaces.length === 0) {
      next.surfaces = "Choose at least one surface.";
    }
    if (!draft.startDate) next.startDate = "Choose a start date.";
    if (!draft.endDate) next.endDate = "Choose an end date.";
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      next.endDate = "End date must be after start date.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input: PromotionInput = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      audience: draft.audience,
      surfaces: draft.surfaces,
      mechanic: buildMechanic(),
      conditions: {
        minOrders: parseOptional(draft.conditions.minOrders),
        firstOrderOnly: draft.conditions.firstOrderOnly || undefined,
        minSpendGHS: parseOptional(draft.conditions.minSpendGHS),
        maxSpendGHS: parseOptional(draft.conditions.maxSpendGHS),
        serviceScope:
          draft.conditions.serviceScope.length > 0
            ? draft.conditions.serviceScope
            : undefined,
        tierIds:
          draft.audience === "reseller" && draft.conditions.tierIds.length > 0
            ? draft.conditions.tierIds
            : undefined,
      },
      startDate: draft.startDate + "T00:00:00.000Z",
      endDate: draft.endDate + "T23:59:59.999Z",
    };

    const result = onSubmit(input);
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
      title={mode === "create" ? "New promotion" : "Edit promotion"}
      description={
        mode === "create"
          ? "Define a discount, cashback, or points campaign for one audience."
          : "Changes affect live behaviour for every included account."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Create promotion" : "Save changes"}
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
            placeholder="e.g. Welcome discount for new customers"
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
            placeholder="One sentence describing what the promotion does."
          />
        </SettingsField>

        <PromotionAudienceFields
          audience={draft.audience}
          surfaces={draft.surfaces}
          errors={errors}
          onAudienceChange={handleAudienceChange}
          onToggleSurface={toggleSurface}
        />

        <PromotionMechanicFields
          audience={draft.audience}
          draft={draft.mechanic}
          errors={errors}
          onChange={setMechanic}
        />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Conditions
          </p>
          <div className="space-y-3">
            <PromotionConditionsEditor
              audience={draft.audience}
              draft={draft.conditions}
              tiers={tiers}
              errors={errors}
              onChange={setConditions}
            />
          </div>
        </div>

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

        <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-800">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Preview
          </p>
          <dl className="mt-2 space-y-1 text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between gap-3">
              <dt>Audience</dt>
              <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                {preview.audienceLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Mechanic</dt>
              <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                {preview.mechanicLabel} — {preview.mechanicSummaryText}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Services</dt>
              <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                {preview.services.join(", ")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Surfaces</dt>
              <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                {preview.surfaceCount} selected
              </dd>
            </div>
          </dl>
        </div>

        {submitError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            <AtlasIcon
              name="alert"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>{submitError}</span>
          </p>
        )}
      </div>
    </ModalShell>
  );
}