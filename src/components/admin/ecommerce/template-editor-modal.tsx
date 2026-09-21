/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  EcommerceTemplate,
  TemplateCategory,
} from "@/lib/admin/types/ecommerce-template";
import type { PlanCode } from "@/config/subscription-plans";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_PLAN_CODES,
  ALL_TEMPLATE_CATEGORIES,
  PLAN_CODE_LABEL,
  PLAN_CODE_VARIANT,
  TEMPLATE_CATEGORY_LABEL,
} from "@/lib/admin/templates/template-labels";
import { Badge } from "@/components/admin/ui/badge";

interface TemplateEditorModalProps {
  open: boolean;
  mode: "create" | "edit";
  template?: EcommerceTemplate | null;
  onClose: () => void;
  onSubmit: (input: TemplateEditorInput) => {
    ok: boolean;
    error?: string;
    field?: string;
  };
}

export interface TemplateEditorInput {
  name: string;
  category: TemplateCategory;
  description: string;
  componentName: string;
  allowedPlans: PlanCode[];
  isActive: boolean;
  thumbnail?: string;
}

interface Draft {
  name: string;
  category: TemplateCategory;
  description: string;
  componentName: string;
  allowedPlans: PlanCode[];
  isActive: boolean;
  thumbnail?: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  category: "general",
  description: "",
  componentName: "",
  allowedPlans: ["starter"],
  isActive: false,
};

function draftFrom(t: EcommerceTemplate): Draft {
  return {
    name: t.name,
    category: t.category,
    description: t.description,
    componentName: t.componentName,
    allowedPlans: [...t.allowedPlans],
    isActive: t.isActive,
    thumbnail: t.thumbnail,
  };
}

export function TemplateEditorModal({
  open,
  mode,
  template,
  onClose,
  onSubmit,
}: TemplateEditorModalProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(template ? draftFrom(template) : EMPTY_DRAFT);
    setFieldError({});
    setSubmitError(null);
  }, [open, template]);

  const dirty = useMemo(() => {
    if (!template) return true;
    const original = draftFrom(template);
    return JSON.stringify(original) !== JSON.stringify(draft);
  }, [template, draft]);

  if (!open) return null;

  const set = (patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const togglePlan = (code: PlanCode) => {
    setDraft((d) => ({
      ...d,
      allowedPlans: d.allowedPlans.includes(code)
        ? d.allowedPlans.filter((c) => c !== code)
        : [...d.allowedPlans, code],
    }));
    setFieldError((prev) => ({ ...prev, allowedPlans: "" }));
  };

  const handleSubmit = () => {
    const result = onSubmit({
      name: draft.name.trim(),
      category: draft.category,
      description: draft.description.trim(),
      componentName: draft.componentName.trim(),
      allowedPlans: [...draft.allowedPlans],
      isActive: draft.isActive,
      thumbnail: draft.thumbnail,
    });

    if (!result.ok) {
      setSubmitError(result.error ?? "Could not save template.");
      if (result.field) {
        setFieldError({ [result.field]: result.error ?? "" });
      }
      return;
    }
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add template" : "Edit " + (template?.name ?? "template")}
      description={
        mode === "create"
          ? "Define a new ecommerce template and the plans it is available to."
          : "Changes apply to new merchants on this template. Existing storefronts keep the current render."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Add template" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Name"
          htmlFor="tpl-name"
          required
          error={fieldError.name}
        >
          <Input
            id="tpl-name"
            value={draft.name}
            onChange={(e) => {
              set({ name: e.target.value });
              setFieldError((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Home & Living"
            autoFocus
            maxLength={60}
          />
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Category" htmlFor="tpl-category" required>
            <select
              id="tpl-category"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.category}
              onChange={(e) =>
                set({ category: e.target.value as TemplateCategory })
              }
            >
              {ALL_TEMPLATE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {TEMPLATE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </SettingsField>

          <SettingsField
            label="Component name"
            htmlFor="tpl-component"
            required
            hint="Must match a React export in the storefront runtime."
            error={fieldError.componentName}
          >
            <Input
              id="tpl-component"
              value={draft.componentName}
              onChange={(e) => {
                set({ componentName: e.target.value });
                setFieldError((prev) => ({ ...prev, componentName: "" }));
              }}
              placeholder="e.g. HomeAndLivingTemplate"
            />
          </SettingsField>
        </div>

        <SettingsField
          label="Description"
          htmlFor="tpl-description"
          required
          error={fieldError.description}
        >
          <textarea
            id="tpl-description"
            className={cn(
              "min-h-[72px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={draft.description}
            onChange={(e) => {
              set({ description: e.target.value });
              setFieldError((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="One sentence describing the template."
          />
        </SettingsField>

        <SettingsField
          label="Allowed plans"
          htmlFor="tpl-plans"
          required
          hint="Merchants on these plans can select this template."
          error={fieldError.allowedPlans}
        >
          <div
            id="tpl-plans"
            className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
          >
            {ALL_PLAN_CODES.map((code) => {
              const active = draft.allowedPlans.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => togglePlan(code)}
                  aria-pressed={active}
                  className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Badge
                    variant={active ? PLAN_CODE_VARIANT[code] : "neutral"}
                    size="sm"
                  >
                    {active && (
                      <AtlasIcon
                        name="check"
                        aria-hidden="true"
                        className="mr-1 h-3 w-3"
                      />
                    )}
                    {PLAN_CODE_LABEL[code]}
                  </Badge>
                </button>
              );
            })}
          </div>
        </SettingsField>

        <label className="flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
          />
          <span>Active (visible to merchants when choosing a template)</span>
        </label>

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

        {mode === "edit" && !dirty && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No changes yet.
          </p>
        )}
      </div>
    </ModalShell>
  );
}