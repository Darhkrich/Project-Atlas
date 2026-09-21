export type PromotionAudience = "customer" | "reseller" | "merchant";

export type PromotionSurface =
  | "atlas_d2c"
  | "customer_dashboard"
  | "reseller_dashboard"
  | "merchant_dashboard";

export type PromotionServiceCategory =
  | "data"
  | "airtime"
  | "bills"
  | "tv"
  | "exam_pins"
  | "other";

export interface PromotionConditions {
  minOrders?: number;
  firstOrderOnly?: boolean;
  minSpendGHS?: number;
  maxSpendGHS?: number;
  serviceScope?: PromotionServiceCategory[];
  tierIds?: string[];
  audienceTargets?: string[];
}

export type PromotionMechanic =
  | { kind: "auto_discount"; mode: "percent" | "fixed"; value: number }
  | { kind: "cashback"; percent: number }
  | { kind: "atlas_points"; pointsPerGHS: number }
  | { kind: "subscription_discount"; percent: number; planIds?: string[] };

export interface Promotion {
  id: string;
  name: string;
  description: string;
  audience: PromotionAudience;
  surfaces: PromotionSurface[];
  conditions: PromotionConditions;
  mechanic: PromotionMechanic;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  endedAt?: string;
  endedReason?: string;
}


export interface PromotionContext {
  audienceId?: string;
  tierId?: string;
  planId?: string;
  ordersCount?: number;
  lifetimeSpendGHS?: number;
  windowSpendGHS?: number;
  serviceCategory?: PromotionServiceCategory;
}


export type PromotionStatus = "scheduled" | "active" | "expired" | "ended";

export interface PromotionAuditEntry {
  id: string;
  promotionId: string;
  promotionName: string;
  action: "Created" | "Updated" | "Ended" | "Deleted";
  admin: string;
  adminEmail: string;
  timestamp: string;
  changes?: { field: string; from: string; to: string }[];
  reason?: string;
}