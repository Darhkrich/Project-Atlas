import type {
  ResellerStatus,
  VerificationStatus,
} from "@/lib/admin/types/reseller";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const STATUS_LABEL: Record<ResellerStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const STATUS_VARIANT: Record<ResellerStatus, BadgeVariant> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const VERIFICATION_VARIANT: Record<
  VerificationStatus,
  BadgeVariant
> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

export const STOREFRONT_STATUS_LABEL: Record<
  "live" | "disabled" | "pending",
  string
> = {
  live: "Live",
  disabled: "Disabled",
  pending: "Pending",
};

export const STOREFRONT_STATUS_VARIANT: Record<
  "live" | "disabled" | "pending",
  BadgeVariant
> = {
  live: "success",
  disabled: "danger",
  pending: "warning",
};

export type SortKey =
  | "lastActive"
  | "joined"
  | "totalRevenue"
  | "wallet"
  | "commissionsEarned"
  | "commissionsPending"
  | "businessName";

export const SORT_LABEL: Record<SortKey, string> = {
  lastActive: "Last active",
  joined: "Newest join",
  totalRevenue: "Highest revenue",
  wallet: "Wallet balance",
  commissionsEarned: "Commissions earned",
  commissionsPending: "Pending payouts",
  businessName: "Business name",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "lastActive",
  "joined",
  "totalRevenue",
  "wallet",
  "commissionsEarned",
  "commissionsPending",
  "businessName",
];

export const PAGE_SIZE = 10;

export type ColumnKey =
  | "businessName"
  | "contact"
  | "tier"
  | "wallet"
  | "orders"
  | "revenue"
  | "commissions"
  | "verification"
  | "status";

export const OPTIONAL_COLUMN_KEYS: ColumnKey[] = [
  "businessName",
  "contact",
  "tier",
  "wallet",
  "orders",
  "revenue",
  "commissions",
  "verification",
  "status",
];

export const COLUMN_LABEL: Record<ColumnKey, string> = {
  businessName: "Business",
  contact: "Contact",
  tier: "Tier",
  wallet: "Wallet",
  orders: "Orders",
  revenue: "Revenue",
  commissions: "Commissions",
  verification: "Verification",
  status: "Status",
};

// Only one adjustment method today: writes a ledger entry to the reseller's
// authoritative wallet. Rail methods (Mobile Money reversal, bank transfer,
// payout queue) are deferred until those rails are implemented. Adding them
// back requires each method to dispatch a different ledger entry kind.
export const WALLET_ADJUST_METHODS = [
  {
    value: "atlas_wallet" as const,
    label: "Atlas wallet balance",
    hint: "Writes an adjustment entry to the reseller's wallet ledger. The balance recomputes.",
  },
];

export type WalletAdjustMethod =
  (typeof WALLET_ADJUST_METHODS)[number]["value"];