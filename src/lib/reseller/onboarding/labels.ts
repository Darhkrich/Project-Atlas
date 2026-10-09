import type { OnboardingStep } from "./types";

export const COPY = {
  pageTitle: "Set up your Atlas storefront",
  pageSubtitle: "A few short steps. Then your shop is live.",
  back: "Back",
  continue: "Continue",
  logIn: "Log in",
  launch: "Launch storefront",
  publishFailed:
    "We could not open your storefront. Fix the errors and try again.",
} as const;

export const STEP_COPY: Record<
  OnboardingStep,
  { title: string; subtitle: string }
> = {
  account: {
    title: "Create your account",
    subtitle: "Who is behind the counter.",
  },
  store: {
    title: "Set up your shop",
    subtitle: "Name it, claim a link, pick your colors.",
  },
  review: {
    title: "Launch your storefront",
    subtitle: "Confirm the details and go live.",
  },
};

export const FIELD_LABELS = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone (optional)",
  password: "Password",
  storeName: "Store name",
  slug: "Store link",
  logo: "Logo URL (optional)",
} as const;