export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired";

export interface EcommerceSummary {
  totalMerchants: number;
  activeSubscriptions: number;
  mrr: number;
  totalOrders: number;
  totalSalesVolume: number;
  pendingSupportTickets: number;
}

export interface EcommerceRevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
}

export interface TopMerchant {
  id: string;
  name: string;
  sales: number;
  orders: number;
}

export interface MerchantSubscription {
  id: string;
  merchantId: string;
  merchantName: string;
  planCode: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
  amountPaid: number;
  lastPaymentDate: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  date: string;
  status: "paid" | "unpaid" | "void";
}