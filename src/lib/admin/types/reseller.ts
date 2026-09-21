export type ResellerStatus = "active" | "suspended" | "pending";
export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "not_submitted";
export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface ResellerActivityEntry {
  id: string;
  timestamp: string;
  action: string;
}

export interface ResellerAuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export interface Reseller {
  id: string;
  businessName: string;
  storeName?: string;
  contactPerson: string;
  email: string;
  phone: string;

  totalOrders: number;
  totalRevenue: number;

  status: ResellerStatus;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;

  joinedAt: string;
  lastActive: string;

  tierName?: string;
  tierId?: string;

  commissionsEarned: number;
  commissionsPending: number;
  commissionsPaid: number;

  activityLog: ResellerActivityEntry[];
  auditTrail?: ResellerAuditEntry[];
  verificationSubmittedAt?: string;
  verificationRejectionReason?: string;
}

export const RESELLER_STATUS_LABELS: Record<ResellerStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const VERIFICATION_STATUS_LABELS: Record<
  VerificationStatus,
  string
> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};