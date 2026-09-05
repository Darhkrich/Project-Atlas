export type ResellerStatus = "active" | "suspended" | "pending" | "rejected";
export type VerificationStatus = "verified" | "pending" | "rejected" | "not_submitted";
export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface Reseller {
  id: string;
  businessName: string;
  storeName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  walletBalance: number;
  totalOrders: number;
  totalRevenue: number;
  commissionRate: number; // percentage
  status: ResellerStatus;
  verificationStatus: VerificationStatus;
  joinedAt: string;
  lastActive: string;
  storefrontUrl?: string;
  storefrontStatus?: "live" | "disabled";
  commissionsEarned: number;
  commissionsPending: number;
  commissionsPaid: number;
  recentOrders?: { id: string; service: string; amount: number; date: string }[];
  walletTransactions?: { id: string; type: string; amount: number; date: string }[];
  activityLog: { id: string; timestamp: string; action: string }[];
  auditTrail?: { id: string; timestamp: string; admin: string; action: string }[];
}

export const RESELLER_STATUS_LABELS: Record<ResellerStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
  rejected: "Rejected",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not Submitted",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};