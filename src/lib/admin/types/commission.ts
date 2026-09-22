// lib/admin/types/commission.ts

export type CommissionStatus = "pending" | "paid" | "cancelled" | "reversed";

export type ServiceCategory =
  | "data"
  | "airtime"
  | "bills"
  | "tv"
  | "exam_pins"
  | "other";

export type PayoutRunStatus = "pending" | "completed" | "failed";

/**
 * Base commission rates, expressed as percentages of order value. Data is
 * a percentage like every other service. Different data plans carry
 * different prices, so a flat per-order amount would not scale.
 */
export type TierPercentRates = Record<ServiceCategory, number>;

export interface ResellerTier {
  id: string;
  name: string;
  minMonthlySales: number;
  extraCutPercent: number;
  baseCommissionRates: TierPercentRates;
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
  tierId?: string;
  tierName?: string;
  effectiveExtraCutPercent?: number;
  status: CommissionStatus;
  createdAt: string;
  paidAt?: string;
  reversedAt?: string;
  payoutRunId?: string;
  recoveryId?: string;
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

export interface CommissionAuditEntry {
  id: string;
  commissionId: string;
  admin: string;
  adminEmail: string;
  action: string;
  previousStatus?: CommissionStatus;
  newStatus?: CommissionStatus;
  reason?: string;
  timestamp: string;
}

export interface PayoutRun {
  id: string;
  date: string;
  totalAmount: number;
  resellerCount: number;
  status: PayoutRunStatus;
  commissionIds: string[];
  failureReason?: string;
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