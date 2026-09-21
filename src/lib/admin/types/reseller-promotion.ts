export type PromotionScope = "all" | "tier" | "resellers" | "service";

export type PromotionServiceCategory =
  | "data"
  | "airtime"
  | "bills"
  | "tv"
  | "exam_pins"
  | "other";

export interface ResellerPromotion {
  id: string;
  name: string;
  description: string;
  scope: PromotionScope;
  tierId?: string;
  resellerIds?: string[];
  serviceCategories?: PromotionServiceCategory[];
  /**
   * Percentage-point addition to the base commission rate. A value of 0.4
   * turns Gold's 0.6% data rate into 1.0%. Not a multiplier.
   */
  boostPercentPoints: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  endedAt?: string;
  endedReason?: string;
}

export type PromotionStatus =
  | "scheduled"
  | "active"
  | "expired"
  | "ended";

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