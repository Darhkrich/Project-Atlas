export type CustomerSegment = "new" | "returning" | "vip";

export type CustomerSegmentFilter = "All" | CustomerSegment;

export type CustomerSortKey =
  | "recent_activity"
  | "orders_desc"
  | "spend_desc"
  | "name_asc"
  | "oldest_customer";

export type CustomerReportReason =
  | "fraud"
  | "abuse"
  | "chargebacks"
  | "repeated_refunds"
  | "harassment"
  | "other";

export type CustomerReportStatus = "submitted" | "withdrawn";

export interface CustomerReport {
  id: string;
  storeSlug: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  reason: CustomerReportReason;
  note?: string;
  createdAt: number;
  status: CustomerReportStatus;
  withdrawnAt?: number;
}

export interface MerchantCustomerView {
  id: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  status: "Active" | "Inactive";
  createdAt: number;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: number | null;
  lastOrderAt: number | null;
  segment: CustomerSegment;
  hasActiveReport: boolean;
  activeReport: CustomerReport | null;
}

export interface CustomerFilterState {
  search: string;
  segment: CustomerSegmentFilter;
  sort: CustomerSortKey;
}

export interface CustomerSummarySnapshot {
  totalCustomers: number;
  newCount: number;
  returningCount: number;
  vipCount: number;
  newThisMonthCount: number;
}