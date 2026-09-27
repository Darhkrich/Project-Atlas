import type { ProviderPayoutStatus } from "./provider-payout-types";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const PROVIDER_PAYOUT_STATUS_LABEL: Record<
  ProviderPayoutStatus,
  string
> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  settled: "Settled",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const PROVIDER_PAYOUT_STATUS_VARIANT: Record<
  ProviderPayoutStatus,
  BadgeVariant
> = {
  draft: "neutral",
  pending_approval: "warning",
  approved: "info",
  settled: "success",
  cancelled: "neutral",
  failed: "danger",
};