import type { OnboardingStep } from "./types";

export const ONBOARDING_STORE_KEY = "atlas-reseller-onboarding-drafts";
export const RESELLER_STOREFRONT_KEY_PREFIX = "atlas-reseller-storefront:";
export const RUNTIME_STOREFRONT_STORE_KEY = "atlas_storefront_configs";
export const CREDENTIAL_STUB_KEY_PREFIX = "atlas-reseller-credentials-stub:";
export const RESELLER_ACTIVITY_KEY_PREFIX = "atlas-reseller-activity:";

export const SELF_SERVE_STEPS: OnboardingStep[] = [
  "account",
  "store",
  "review",
];

export const INVITED_STEPS: OnboardingStep[] = ["store", "review"];

export const STEP_TITLES: Record<OnboardingStep, string> = {
  account: "Account",
  store: "Shop",
  review: "Launch",
};

export const MAX_STORE_NAME_LENGTH = 60;
export const MAX_SLUG_LENGTH = 48;
export const MIN_SLUG_LENGTH = 3;
export const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const RESERVED_SLUGS = new Set<string>([
  "admin",
  "api",
  "login",
  "logout",
  "signup",
  "register",
  "dashboard",
  "store",
  "storefront",
  "reseller",
  "merchant",
  "customer",
  "account",
  "settings",
  "support",
  "help",
  "about",
  "terms",
  "privacy",
  "checkout",
  "cart",
  "orders",
  "wallet",
  "billing",
  "atlas",
  "www",
  "app",
  "static",
]);

export const DEFAULT_BRAND_COLORS: Array<{
  name: string;
  primary: string;
  accent: string;
}> = [
  { name: "Forest", primary: "#064E3B", accent: "#22C55E" },
  { name: "Ocean", primary: "#0C4A6E", accent: "#38BDF8" },
  { name: "Sunset", primary: "#7C2D12", accent: "#FB923C" },
  { name: "Rose", primary: "#881337", accent: "#FB7185" },
  { name: "Ink", primary: "#111827", accent: "#64748B" },
  { name: "Violet", primary: "#4C1D95", accent: "#A78BFA" },
];

export const SLUG_DEBOUNCE_MS = 350;