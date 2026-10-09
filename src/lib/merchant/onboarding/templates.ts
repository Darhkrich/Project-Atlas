// Compatibility shim. The authoritative template catalog lives at
// lib/merchant/templates/catalog.ts. Delete this file once every consumer
// imports from the new location directly.

export type {
  TemplateCatalogEntry as OnboardingTemplate,
  TemplateStatus,
} from "@/lib/merchant/templates/catalog";

export {
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_CATALOG as ONBOARDING_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ORDER,
  getTemplateById,
  recommendTemplate,
  templateLabel,
  templatesByCategory,
  templatesForCategory,
} from "@/lib/merchant/templates/catalog";
