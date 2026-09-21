import type { PaymentStatus } from "@/lib/admin/types/payment";
import type { PaymentSource } from "@/lib/admin/types/payment";
import type { PaymentMethodId } from "@/lib/admin/types/payment";

export const PAYMENTS_PAGE_SIZE = 20;

export const PAYMENTS_VIEWS_STORAGE_KEY = "atlas-payments-views-v1";

export type PaymentsSortKey = "newest" | "oldest" | "amount_largest" | "amount_smallest";

export const PAYMENTS_SORT_LABELS: Record<PaymentsSortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  amount_largest: "Largest amount",
  amount_smallest: "Smallest amount",
};

export interface PaymentsFilters {
  q: string;
  source: "" | PaymentSource;
  method: "" | PaymentMethodId;
  status: "" | PaymentStatus;
  sort: PaymentsSortKey;
  page: string;
  pageSize: string;
}

export const DEFAULT_PAYMENTS_FILTERS: PaymentsFilters = {
  q: "",
  source: "",
  method: "",
  status: "",
  sort: "newest",
  page: "1",
  pageSize: String(PAYMENTS_PAGE_SIZE),
};

export const PAYMENTS_FLAG_REASONS = [
  "provider_mismatch",
  "missing_wallet_credit",
  "customer_complaint",
  "suspected_fraud",
  "duplicate_charge",
  "other",
] as const;