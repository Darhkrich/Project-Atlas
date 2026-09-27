// lib/domains/subscriptions/index.ts

export type {
  SubscriptionPlan,
  SubscriptionPlanActor,
  FeatureSet,
  PlanVisibility,
  SupportTier,
  CreatePlanInput,
  UpdatePlanInput,
  PlanStoreState,
  PlanMutationResult,
} from "./types";

export {
  PLAN_CODE_REGEX,
  RESERVED_PLAN_CODES,
  ALL_PAYMENT_METHODS,
  ALL_THEMES,
  MIN_PLAN_NAME_LENGTH,
  MAX_PLAN_NAME_LENGTH,
  MAX_PLAN_DESCRIPTION_LENGTH,
  MAX_CUSTOM_PRICE_GHS,
  DEFAULT_VISIBILITY,
} from "./constants";
export type {
  StorefrontPaymentMethod,
  StorefrontTheme,
} from "./constants";

export {
  SUPPORT_TIER_LABEL,
  SUPPORT_TIER_VARIANT,
  PLAN_VISIBILITY_LABEL,
  PLAN_VISIBILITY_VARIANT,
  PLAN_VISIBILITY_HELP,
  PAYMENT_METHOD_LABEL,
  THEME_LABEL,
  DOMAIN_SUBDOMAIN_LABEL,
  DOMAIN_SUBDOMAIN_HELP,
  DOMAIN_CUSTOM_LABEL,
  DOMAIN_CUSTOM_HELP,
  planCodeLabel,
} from "./labels";

export {
  derivePlanDisplayPrices,
  validatePlanInput,
  planCodeSetFor,
  nextSortOrder,
  sortPlans,
} from "./helpers";
export type {
  PlanDisplayPrices,
  PlanValidationResult,
} from "./helpers";

export {
  getPlans,
  getActivePlans,
  getPlanByCode,
  subscribeToPlanStore,
  notifyPlanStore,
  isPlanStoreLoaded,
  resetPlansForTest,
  liveSubscriptionPlans,
} from "./store";

export {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanVisibility,
  reorderSubscriptionPlan,
} from "./mutations";

export {
  SUBSCRIPTION_PLAN_CREATE,
  SUBSCRIPTION_PLAN_UPDATE,
  SUBSCRIPTION_PLAN_DELETE,
  SUBSCRIPTION_PLAN_TOGGLE,
  SUBSCRIPTION_PLAN_REORDER,
} from "./audit-actions";

export {
  projectPlanPickerOptions,
  projectPlanRowSummary,
  projectPlanTotals,
} from "./projection";
export type {
  PlanPickerOption,
  PlanRowSummary,
  PlanTotals,
} from "./projection";