export type MerchantStatus = "active" | "suspended" | "pending";
export type SubscriptionPlan = "basic" | "pro" | "premium";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired";
export type VerificationStatus = "verified" | "pending" | "rejected" | "not_submitted";
export type StoreStatus = "live" | "disabled";

export interface StoreConfig {
  storeName: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  templateId: string;
  customDomain?: string;
  subdomain: string;
  logo?: string;
}

export interface Subscription {
  planId: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
}

export interface Merchant {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  storeConfig: StoreConfig;
  subscription: Subscription;
  verificationStatus: VerificationStatus;
  merchantStatus: MerchantStatus;
  storeStatus: StoreStatus;
  totalOrders: number;
  totalRevenue: number;
  lastActive: string;
  createdAt: string;
  recentOrders?: { id: string; itemCount: number; total: number; date: string }[];
  recentPayments?: { id: string; amount: number; method: string; date: string }[];
  walletBalance?: number;
  walletTransactions?: { id: string; type: string; amount: number; date: string }[];
  activityLog: { id: string; timestamp: string; action: string }[];
  auditTrail?: { id: string; timestamp: string; admin: string; action: string }[];
}

export const SUBSCRIPTION_PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
];

export const MERCHANT_STATUS_LABELS: Record<MerchantStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not Submitted",
};

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  live: "Live",
  disabled: "Disabled",
};