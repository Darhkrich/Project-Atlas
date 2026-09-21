/* eslint-disable prefer-const */
import type {
  EcommerceTemplate,
  TemplateAuditEntry,
} from "@/lib/admin/types/ecommerce-template";
import type { PlanCode } from "@/config/subscription-plans";
import { mockEcommerceTemplates } from "./ecommerce-templates";
import type { TemplateCategory } from "@/lib/admin/types/ecommerce-template";

interface StoreState {
  templates: EcommerceTemplate[];
  audit: TemplateAuditEntry[];
  loaded: boolean;
}

const state: StoreState = {
  templates: [],
  audit: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.templates = structuredClone(mockEcommerceTemplates);
  state.loaded = true;
}

export interface TemplateActor {
  name: string;
  email: string;
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

export interface TemplateMutationResult {
  ok: boolean;
  template?: EcommerceTemplate;
  error?: string;
  field?: string;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToTemplateStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getTemplates(): EcommerceTemplate[] {
  ensureLoaded();
  return state.templates;
}

export function getTemplateById(id: string): EcommerceTemplate | undefined {
  ensureLoaded();
  return state.templates.find((t) => t.id === id);
}

export function getTemplateAudit(): TemplateAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getTemplateAuditFor(templateId: string): TemplateAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.templateId === templateId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/* ------------------------------ Internals ----------------------------- */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueTemplateId(base: string, existing: string[]): string {
  let candidate = "tpl-" + base;
  if (!existing.includes(candidate)) return candidate;
  let suffix = 2;
  while (existing.includes("tpl-" + base + "-" + suffix)) {
    suffix += 1;
  }
  return "tpl-" + base + "-" + suffix;
}

function validate(
  input: TemplateInput,
  existing: EcommerceTemplate[],
  excludeId?: string
): { ok: false; field: string; message: string } | { ok: true } {
  const name = input.name.trim();
  if (!name) return { ok: false, field: "name", message: "Name is required." };
  if (name.length > 60) {
    return {
      ok: false,
      field: "name",
      message: "Name must be 60 characters or fewer.",
    };
  }
  if (
    existing.some(
      (t) => t.id !== excludeId && t.name.toLowerCase() === name.toLowerCase()
    )
  ) {
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
  if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
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

function pushAudit(input: {
  templateId: string;
  templateName: string;
  action: TemplateAuditEntry["action"];
  actor: TemplateActor;
  changes?: TemplateAuditEntry["changes"];
  reason?: string;
}): void {
  state.audit = [
    {
      id: crypto.randomUUID(),
      templateId: input.templateId,
      templateName: input.templateName,
      action: input.action,
      admin: input.actor.name,
      adminEmail: input.actor.email,
      timestamp: new Date().toISOString(),
      changes: input.changes,
      reason: input.reason,
    },
    ...state.audit,
  ];
}

/* ------------------------------ Mutations ----------------------------- */

export function createTemplate(
  input: TemplateInput,
  actor: TemplateActor
): TemplateMutationResult {
  ensureLoaded();
  const check = validate(input, state.templates);
  if (!check.ok) {
    return { ok: false, error: check.message, field: check.field };
  }

  const id = uniqueTemplateId(
    slugify(input.name) || "new",
    state.templates.map((t) => t.id)
  );
  const nowIso = new Date().toISOString();

  const template: EcommerceTemplate = {
    id,
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    componentName: input.componentName.trim(),
    allowedPlans: [...input.allowedPlans],
    isActive: input.isActive,
    thumbnail: input.thumbnail,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedBy: actor.name,
  };

  state.templates = [...state.templates, template];
  pushAudit({
    templateId: template.id,
    templateName: template.name,
    action: "Created",
    actor,
  });
  notify();
  return { ok: true, template };
}

export function updateTemplate(
  id: string,
  input: TemplateInput,
  actor: TemplateActor
): TemplateMutationResult {
  ensureLoaded();
  const current = state.templates.find((t) => t.id === id);
  if (!current) return { ok: false, error: "Template not found." };

  const check = validate(input, state.templates, id);
  if (!check.ok) {
    return { ok: false, error: check.message, field: check.field };
  }

  const changes: TemplateAuditEntry["changes"] = [];
  const push = (field: string, from: string, to: string) => {
    if (from !== to) changes.push({ field, from, to });
  };
  push("Name", current.name, input.name.trim());
  push("Category", current.category, input.category);
  push("Description", current.description, input.description.trim());
  push("Component", current.componentName, input.componentName.trim());
  push(
    "Allowed plans",
    current.allowedPlans.join("|"),
    input.allowedPlans.join("|")
  );
  if (current.isActive !== input.isActive) {
    push("Active", current.isActive ? "yes" : "no", input.isActive ? "yes" : "no");
  }

  const nowIso = new Date().toISOString();
  const next: EcommerceTemplate = {
    ...current,
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    componentName: input.componentName.trim(),
    allowedPlans: [...input.allowedPlans],
    isActive: input.isActive,
    thumbnail: input.thumbnail,
    updatedAt: nowIso,
    updatedBy: actor.name,
  };

  state.templates = state.templates.map((t) => (t.id === id ? next : t));
  pushAudit({
    templateId: id,
    templateName: next.name,
    action: "Updated",
    actor,
    changes,
  });
  notify();
  return { ok: true, template: next };
}

export function toggleTemplateActive(
  id: string,
  actor: TemplateActor
): TemplateMutationResult {
  ensureLoaded();
  const current = state.templates.find((t) => t.id === id);
  if (!current) return { ok: false, error: "Template not found." };

  const nextActive = !current.isActive;
  const nowIso = new Date().toISOString();
  const next: EcommerceTemplate = {
    ...current,
    isActive: nextActive,
    updatedAt: nowIso,
    updatedBy: actor.name,
  };

  state.templates = state.templates.map((t) => (t.id === id ? next : t));
  pushAudit({
    templateId: id,
    templateName: next.name,
    action: nextActive ? "Activated" : "Deactivated",
    actor,
  });
  notify();
  return { ok: true, template: next };
}

export function duplicateTemplate(
  id: string,
  actor: TemplateActor
): TemplateMutationResult {
  ensureLoaded();
  const source = state.templates.find((t) => t.id === id);
  if (!source) return { ok: false, error: "Template not found." };

  const newName = source.name + " Copy";
  const idCandidates = state.templates.map((t) => t.id);
  const newId = uniqueTemplateId(
    slugify(newName) || slugify(source.name) + "-copy",
    idCandidates
  );
  const nowIso = new Date().toISOString();

  const copy: EcommerceTemplate = {
    ...source,
    id: newId,
    name: newName,
    isActive: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedBy: actor.name,
  };

  state.templates = [...state.templates, copy];
  pushAudit({
    templateId: copy.id,
    templateName: copy.name,
    action: "Duplicated",
    actor,
    reason: "Copied from " + source.name,
  });
  notify();
  return { ok: true, template: copy };
}

export function deleteTemplate(
  id: string,
  reason: string,
  actor: TemplateActor
): TemplateMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const current = state.templates.find((t) => t.id === id);
  if (!current) return { ok: false, error: "Template not found." };

  state.templates = state.templates.filter((t) => t.id !== id);
  pushAudit({
    templateId: id,
    templateName: current.name,
    action: "Deleted",
    actor,
    reason: trimmed,
  });
  notify();
  return { ok: true };
}