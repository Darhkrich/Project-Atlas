import type {
  PromotionAudience,
  PromotionMechanic,
  PromotionServiceCategory,
  PromotionStatus,
  PromotionSurface,
} from "@/lib/admin/types/promotion";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
  ended: "Ended",
};

export const PROMOTION_STATUS_VARIANT: Record<PromotionStatus, BadgeVariant> = {
  scheduled: "info",
  active: "success",
  expired: "neutral",
  ended: "neutral",
};

export const PROMOTION_AUDIENCE_LABEL: Record<PromotionAudience, string> = {
  customer: "Customers",
  reseller: "Resellers",
  merchant: "Merchants",
};

export const PROMOTION_AUDIENCE_VARIANT: Record<
  PromotionAudience,
  BadgeVariant
> = {
  customer: "brand",
  reseller: "info",
  merchant: "success",
};

export const PROMOTION_AUDIENCE_HREF: Record<PromotionAudience, string> = {
  customer: "/admin/customers",
  reseller: "/admin/resellers",
  merchant: "/admin/ecommerce/merchants",
};

export const PROMOTION_SURFACE_LABEL: Record<PromotionSurface, string> = {
  atlas_d2c: "Atlas D2C storefront",
  customer_dashboard: "Customer dashboard",
  reseller_dashboard: "Reseller dashboard",
  merchant_dashboard: "Merchant dashboard",
};

export const ALL_PROMOTION_SURFACES: PromotionSurface[] = [
  "atlas_d2c",
  "customer_dashboard",
  "reseller_dashboard",
  "merchant_dashboard",
];

export const PROMOTION_SERVICE_LABEL: Record<
  PromotionServiceCategory,
  string
> = {
  data: "Data",
  airtime: "Airtime",
  bills: "Bills",
  tv: "TV",
  exam_pins: "Exam Pins",
  other: "Other",
};

export const ALL_PROMOTION_SERVICES: PromotionServiceCategory[] = [
  "data",
  "airtime",
  "bills",
  "tv",
  "exam_pins",
  "other",
];

export const MECHANIC_KIND_LABEL: Record<PromotionMechanic["kind"], string> = {
  auto_discount: "Auto discount",
  cashback: "Cashback",
  atlas_points: "Atlas points",
  subscription_discount: "Subscription discount",
};

export const MECHANIC_KIND_VARIANT: Record<
  PromotionMechanic["kind"],
  BadgeVariant
> = {
  auto_discount: "warning",
  cashback: "success",
  atlas_points: "info",
  subscription_discount: "brand",
};

export const ALL_MECHANIC_KINDS: PromotionMechanic["kind"][] = [
  "auto_discount",
  "cashback",
  "atlas_points",
  "subscription_discount",
];

/**
 * Which mechanics can be selected for a given audience. Atlas points are
 * customer-only by product decision. Subscription discount is merchant-
 * only because it applies to merchant subscription plans.
 */
export function allowedMechanicsForAudience(
  audience: PromotionAudience
): PromotionMechanic["kind"][] {
  if (audience === "customer") {
    return ["auto_discount", "cashback", "atlas_points"];
  }
  if (audience === "merchant") {
    return ["auto_discount", "cashback", "subscription_discount"];
  }
  // reseller
  return ["auto_discount", "cashback"];
}

export function mechanicSummary(mechanic: PromotionMechanic): string {
  switch (mechanic.kind) {
    case "auto_discount":
      return mechanic.mode === "percent"
        ? mechanic.value + "% off"
        : "GHS " + mechanic.value.toFixed(2) + " off";
    case "cashback":
      return mechanic.percent + "% cashback";
    case "atlas_points":
      return mechanic.pointsPerGHS + " points per GHS";
    case "subscription_discount":
      return mechanic.percent + "% off subscriptions";
  }
}