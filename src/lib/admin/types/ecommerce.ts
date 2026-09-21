import type { PlanCode } from "@/config/subscription-plans";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export interface MerchantSubscription {
  id: string;
  merchantId: string;
  merchantName: string;
  planCode: PlanCode;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
  amountPaid: number;
  lastPaymentDate: string;
  currency: string;
  discountPercent?: number;
  nextBillingDate: string;
}

export type InvoiceStatus = "paid" | "unpaid" | "void";

export interface Invoice {
  id: string;
  subscriptionId: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  paidAt?: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
}