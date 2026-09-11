export interface PlanPricing {
  id: string;
  planName: string;
  serviceCategory: string;
  network?: string;
  providerCost: number;
  atlasPrice: number;
  resellerPrice: number;
  commissionRate: number;
  status: "active" | "inactive";
  lastUpdated: string;
  updatedBy: string;
}

export const PLAN_PRICING_STATUS_LABELS: Record<"active" | "inactive", string> = {
  active: "Active",
  inactive: "Inactive",
};