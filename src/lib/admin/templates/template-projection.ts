import type { Merchant } from "@/lib/admin/types/merchant";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type {
  EcommerceTemplate,
  TemplateCategory,
} from "@/lib/admin/types/ecommerce-template";
import type { PlanCode } from "@/config/subscription-plans";
import { COMPONENT_NAME_REGEX } from "./template-labels";

export interface TemplateWithUsage extends EcommerceTemplate {
  usageCount: number;
}

export interface TemplateSummary {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  totalUsage: number;
}

export interface TemplateFilters {
  q: string;
  category: string;
  status: string;
}

export interface TemplateInput {
  name: string;
  category: TemplateCategory;
  description: string;
  componentName: string;
  allowedPlans: PlanCode[];
  isActive: boolean;
  thumbnail?: string;
}

export function templateUsage(
  templateId: string,
  merchants: Merchant[]
): number {
  let count = 0;
  for (const m of merchants) {
    if (m.storeConfig.templateId === templateId) count += 1;
  }
  return count;
}

/**
 * Template usage across both merchant records and the unified storefront
 * catalog. Deduplicates by owner id so a merchant counted from both sources
 * is still counted once.
 */
export function templateUsageAcross(
  templateId: string,
  merchants: Merchant[],
  storefronts: UnifiedStorefront[]
): number {
  const seen = new Set<string>();
  for (const m of merchants) {
    if (m.storeConfig.templateId === templateId) seen.add(m.id);
  }
  for (const sf of storefronts) {
    if (sf.type !== "merchant") continue;
    if (sf.template !== templateId) continue;
    seen.add(sf.ownerId);
  }
  return seen.size;
}

export function projectTemplates(
  templates: EcommerceTemplate[],
  merchants: Merchant[]
): TemplateWithUsage[] {
  return templates.map((t) => ({
    ...t,
    usageCount: templateUsage(t.id, merchants),
  }));
}

export function projectTemplateSummary(
  rows: TemplateWithUsage[]
): TemplateSummary {
  let active = 0;
  let inactive = 0;
  let totalUsage = 0;
  for (const t of rows) {
    if (t.isActive) active += 1;
    else inactive += 1;
    totalUsage += t.usageCount;
  }
  return {
    totalTemplates: rows.length,
    activeTemplates: active,
    inactiveTemplates: inactive,
    totalUsage,
  };
}

export function filterTemplates(
  rows: TemplateWithUsage[],
  filters: TemplateFilters
): TemplateWithUsage[] {
  const q = filters.q.trim().toLowerCase();
  return rows.filter((t) => {
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.id).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.category && t.category !== filters.category) return false;
    if (filters.status === "active" && !t.isActive) return false;
    if (filters.status === "inactive" && t.isActive) return false;
    return true;
  });
}

export type TemplateValidation =
  | { ok: true }
  | { ok: false; field: string; message: string };

export function validateTemplateInput(
  input: TemplateInput,
  existing: EcommerceTemplate[],
  excludeId?: string
): TemplateValidation {
  const name = input.name.trim();
  if (!name) return { ok: false, field: "name", message: "Name is required." };
  if (name.length > 60) {
    return {
      ok: false,
      field: "name",
      message: "Name must be 60 characters or fewer.",
    };
  }
  const collision = existing.some(
    (t) => t.id !== excludeId && t.name.toLowerCase() === name.toLowerCase()
  );
  if (collision) {
    return {
      ok: false,
      field: "name",
      message: "Another template already uses that name.",
    };
  }

  if (!input.description.trim()) {
    return {
      ok: false,
      field: "description",
      message: "Description is required.",
    };
  }

  const componentName = input.componentName.trim();
  if (!componentName) {
    return {
      ok: false,
      field: "componentName",
      message: "Component name is required.",
    };
  }
  if (!COMPONENT_NAME_REGEX.test(componentName)) {
    return {
      ok: false,
      field: "componentName",
      message:
        "Component name must be PascalCase, starting with a capital letter.",
    };
  }

  if (input.allowedPlans.length === 0) {
    return {
      ok: false,
      field: "allowedPlans",
      message: "At least one plan must be allowed.",
    };
  }

  return { ok: true };
}

export function allowedTemplatesFor(
  planCode: PlanCode,
  templates: EcommerceTemplate[]
): EcommerceTemplate[] {
  return templates.filter(
    (t) => t.isActive && t.allowedPlans.includes(planCode)
  );
}