import type { PlanCode } from "@/config/subscription-plans";

export type MerchantStatus = "active" | "pending" | "suspended";
export type MerchantStoreStatus = "live" | "draft" | "disabled";
export type MerchantVerificationStatus =
  | "verified"
  | "pending"
  | "not_submitted";

export type MerchantSubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export interface MerchantStoreConfig {
  storeName: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  templateId: string;
  subdomain: string;
  customDomain?: string;
}

export interface MerchantSubscription {
  planId: PlanCode;
  status: MerchantSubscriptionStatus;
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
  amountPaid: number;
  lastPaymentDate: string;
  discountPercent?: number;
}

export interface MerchantOrderSummary {
  id: string;
  itemCount: number;
  total: number;
  date: string;
}

export interface MerchantPaymentSummary {
  id: string;
  amount: number;
  method: string;
  date: string;
}

export interface MerchantWalletTransaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export interface MerchantActivityEntry {
  id: string;
  timestamp: string;
  action: string;
}

export interface MerchantAuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  storeConfig: MerchantStoreConfig;
  subscription: MerchantSubscription;
  verificationStatus: MerchantVerificationStatus;
  merchantStatus: MerchantStatus;
  storeStatus: MerchantStoreStatus;
  totalOrders: number;
  totalRevenue: number;
  lastActive: string;
  createdAt: string;
  recentOrders?: MerchantOrderSummary[];
  recentPayments?: MerchantPaymentSummary[];
  walletBalance: number;
  walletTransactions?: MerchantWalletTransaction[];
  activityLog: MerchantActivityEntry[];
  auditTrail: MerchantAuditEntry[];
  contractMrr?: number;
}