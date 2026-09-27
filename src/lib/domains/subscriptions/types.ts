// lib/domains/subscriptions/types.ts
//
// Subscription plans are the merchant-facing SaaS tiers (Starter, Growth,
// Pro, Enterprise). Distinct from the service catalog under
// lib/domains/catalog/, which holds product pricing for digital services.

import type {
  StorefrontPaymentMethod,
  StorefrontTheme,
} from "./constants";

/**
 * Extensible registry of plan-gated capabilities. Empty at v1. A feature
 * that ships with a plan gate adds a member here and the plan editor
 * renders the checkbox automatically. The plan type does not reshape.
 */
export interface FeatureSet {
  [key: string]: boolean;
}

export type PlanVisibility = "public" | "hidden" | "legacy";

export type SupportTier =
  | "email"
  | "priority_email"
  | "chat"
  | "dedicated";

export interface SubscriptionPlan {
  code: string;
  name: string;
  description?: string;

  monthlyPriceGHS: number | "custom";
  annualPriceGHS: number | "custom";

  maxProducts: number | "unlimited";

  themes: StorefrontTheme[];
  paymentMethods: StorefrontPaymentMethod[];

  // Atlas-provided subdomain (slug.atlas.store). Infrastructure is on
  // Atlas. Available on every plan.
  subdomain: boolean;

  // Merchant-provided custom domain. Atlas verifies ownership and
  // provisions SSL; the merchant owns the name. Gated from Growth and
  // above.
  customDomain: boolean;

  supportTier: SupportTier;

  featureFlags: FeatureSet;
  aiAssistant: boolean;

  visibility: PlanVisibility;
  sortOrder: number;
  highlighted: boolean;
}

export interface SubscriptionPlanActor {
  id: string;
  name: string;
  email: string;
}

export interface PlanStoreState {
  plans: SubscriptionPlan[];
}

export interface CreatePlanInput {
  code: string;
  name: string;
  description?: string;
  monthlyPriceGHS: number | "custom";
  annualPriceGHS: number | "custom";
  maxProducts: number | "unlimited";
  themes: StorefrontTheme[];
  paymentMethods: StorefrontPaymentMethod[];
  subdomain: boolean;
  customDomain: boolean;
  supportTier: SupportTier;
  aiAssistant: boolean;
  visibility: PlanVisibility;
  highlighted: boolean;
}

export type UpdatePlanInput = Partial<
  Omit<CreatePlanInput, "code">
>;

export interface PlanMutationResult {
  ok: boolean;
  plan?: SubscriptionPlan;
  error?: string;
}