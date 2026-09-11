export type CommissionStatus = "pending" | "paid" | "cancelled" | "reversed";
export type ServiceCategory = "data" | "airtime" | "bills" | "tv" | "exam_pins" | "other";
export type PayoutRunStatus = "pending" | "completed" | "failed";

export interface ResellerTier {
  id: string;
  name: string;
  minMonthlySales: number;
  extraCutPercent: number;
  baseCommissionRates: Record<ServiceCategory, number>;
  perks: string[];
}

export interface ResellerCommission {
  id: string;
  resellerId: string;
  resellerName: string;
  orderId: string;
  service: string;
  serviceCategory: ServiceCategory;
  providerCost: number;
  atlasPrice: number;
  resellerPrice: number;
  baseCommission: number;
  extraAmount: number;
  atlasExtraCut: number;
  resellerExtraCut: number;
  totalCommission: number;
  commissionRate?: number;
  tierId?: string;
  tierName?: string;
  effectiveExtraCutPercent?: number;
  status: CommissionStatus;
  createdAt: string;
  paidAt?: string;
  reversedAt?: string;
  timeline: {
    timestamp: string;
    label: string;
    status: "info" | "success" | "warning" | "danger";
  }[];
  auditTrail?: {
    id: string;
    admin: string;
    timestamp: string;
    action: string;
    previousStatus?: CommissionStatus;
    newStatus?: CommissionStatus;
  }[];
}

export interface PlatformMargin {
  id: string;
  orderId: string;
  service: string;
  providerCost: number;
  atlasPrice: number;
  margin: number;
  marginPercentage: number;
  date: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  description: string;
  value: string;
  enabled: boolean;
}

export interface PayoutRun {
  id: string;
  date: string;
  totalAmount: number;
  resellerCount: number;
  status: PayoutRunStatus;
  commissionIds: string[];
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  reversed: "Reversed",
};

export const PAYOUT_RUN_STATUS_LABELS: Record<PayoutRunStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
};