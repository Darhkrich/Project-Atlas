import type { ProviderPayoutStatus } from "./provider-payout-types";

export const PROVIDER_PAYOUT_BATCH_ID_PREFIX = "PPB";

export const PROVIDER_PAYOUT_SETTLE_DUAL_APPROVAL = true;

export const EDITABLE_PROVIDER_PAYOUT_STATUSES: ProviderPayoutStatus[] = [
  "draft",
];

export const TERMINAL_PROVIDER_PAYOUT_STATUSES: ProviderPayoutStatus[] = [
  "settled",
  "cancelled",
  "failed",
];