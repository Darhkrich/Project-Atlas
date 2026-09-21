import type { WalletWithdrawalStatus } from "@/lib/domains/wallet/enums";
import type { QueueOwnerType } from "@/lib/admin/types/customer-wallet";

export const MIN_WALLET_REJECT_REASON_LENGTH = 10;

export const WALLET_PAGE_SIZE = 20;

export const WALLETS_VIEWS_STORAGE_KEY = "atlas-customer-wallets-views-v1";

export type WalletSortKey =
  | "newest"
  | "oldest"
  | "amount_largest"
  | "amount_smallest";

export const WALLET_SORT_LABELS: Record<WalletSortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  amount_largest: "Largest amount",
  amount_smallest: "Smallest amount",
};

export type WalletStatusFilter = "" | WalletWithdrawalStatus;

export type WalletOwnerTypeFilter = "" | QueueOwnerType;

export const WALLET_OWNER_TYPE_FILTERS: QueueOwnerType[] = [
  "customer",
  "storefront_user",
];

export type WalletQueueView =
  | "all"
  | "awaiting"
  | "pending_processing"
  | "history";

export const WALLET_QUEUE_VIEW_LABELS: Record<WalletQueueView, string> = {
  all: "All",
  awaiting: "Awaiting approval",
  pending_processing: "Processing",
  history: "History",
};

export const WALLET_QUEUE_VIEWS: WalletQueueView[] = [
  "all",
  "awaiting",
  "pending_processing",
  "history",
];

export interface WalletFilters {
  q: string;
  ownerType: WalletOwnerTypeFilter;
  status: WalletStatusFilter;
  view: WalletQueueView;
  sort: WalletSortKey;
  page: string;
  pageSize: string;
}

export const DEFAULT_WALLET_FILTERS: WalletFilters = {
  q: "",
  ownerType: "",
  status: "",
  view: "awaiting",
  sort: "newest",
  page: "1",
  pageSize: String(WALLET_PAGE_SIZE),
};

export const WALLET_APPROVAL_THRESHOLD_BOUNDS = {
  min: 100,
  max: 100_000,
} as const;

export const WALLET_FEE_PERCENT_BOUNDS = {
  min: 0,
  max: 10,
} as const;

export const WALLET_DAILY_CAP_BOUNDS = {
  min: 0,
  max: 20,
} as const;