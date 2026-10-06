import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { StorefrontPublishCheck } from "./types";
import { validateSlug } from "@/lib/merchant/onboarding/slug";

export function runPublishChecks(
  config: MerchantStorefrontConfig
): StorefrontPublishCheck[] {
  const slug = config.slug ?? "";
  const slugResult = validateSlug(slug);

  const checks: StorefrontPublishCheck[] = [
    {
      id: "name",
      label: "Store name is set",
      passed: config.storeName.trim().length > 0,
      severity: "error",
      hint: "Give your store a name so customers can recognise it.",
    },
    {
      id: "tagline",
      label: "Tagline is set",
      passed: config.tagline.trim().length > 0,
      severity: "warn",
      hint: "A one-line tagline appears at the top of your storefront.",
    },
    {
      id: "slug",
      label: "Store URL is valid",
      passed: slugResult.ok,
      severity: "error",
      hint: "Change your store URL in the Domain tab.",
    },
    {
      id: "template",
      label: "Template selected",
      passed: config.templateId.trim().length > 0,
      severity: "error",
      hint: "Pick a template in the Appearance tab.",
    },
    {
      id: "payment",
      label: "At least one payment method",
      passed: Array.isArray(config.paymentMethodIds) && config.paymentMethodIds.length > 0,
      severity: "error",
      hint: "Customers need a way to pay. Enable Mobile Money, card, or another method.",
    },
    {
      id: "contact",
      label: "Contact email",
      passed: config.contactEmail.trim().length > 0,
      severity: "warn",
      hint: "Customers may need to reach you.",
    },
  ];

  return checks;
}

export function publishChecksBlocked(
  checks: StorefrontPublishCheck[]
): boolean {
  return checks.some((c) => !c.passed && c.severity === "error");
}