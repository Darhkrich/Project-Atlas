import type {
  CommissionStatus,
  ServiceCategory,
} from "../types/commission";

export const COMMISSIONS_PAGE_SIZE = 20;

export const COMMISSIONS_VIEWS_STORAGE_KEY =
  "atlas-commissions-views-v1";

export const COMMISSIONS_COLUMNS_STORAGE_KEY =
  "atlas-commissions-columns-v1";

export type CommissionSortKey =
  | "newest"
  | "oldest"
  | "commission_largest"
  | "commission_smallest";

export const COMMISSION_SORT_LABELS: Record<CommissionSortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  commission_largest: "Largest commission",
  commission_smallest: "Smallest commission",
};

export type CommissionStatusFilter = "" | CommissionStatus;

export type ServiceCategoryFilter = "" | ServiceCategory;

export const COMMISSION_STATUS_FILTERS: CommissionStatus[] = [
  "pending",
  "paid",
  "cancelled",
  "reversed",
];

export const SERVICE_CATEGORY_FILTERS: ServiceCategory[] = [
  "data",
  "airtime",
  "bills",
  "tv",
  "exam_pins",
  "other",
];

export type CommissionTab = "reseller" | "margin" | "payouts";

export const COMMISSION_TABS: CommissionTab[] = [
  "reseller",
  "margin",
  "payouts",
];

export const COMMISSION_TAB_LABELS: Record<CommissionTab, string> = {
  reseller: "Reseller Commissions",
  margin: "Platform Margin",
  payouts: "Payouts",
};

export interface CommissionFilters {
  tab: CommissionTab;
  q: string;
  status: CommissionStatusFilter;
  category: ServiceCategoryFilter;
  sort: CommissionSortKey;
  page: string;
  pageSize: string;
}

export const DEFAULT_COMMISSION_FILTERS: CommissionFilters = {
  tab: "reseller",
  q: "",
  status: "",
  category: "",
  sort: "newest",
  page: "1",
  pageSize: String(COMMISSIONS_PAGE_SIZE),
};