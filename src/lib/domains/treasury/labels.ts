// lib/domains/treasury/labels.ts

import type {
  TreasuryApprovalStatus,
  TreasuryCoverageStatus,
  TreasuryDirection,
  TreasuryEventKind,
  TreasuryLiabilityPoolType,
  TreasuryReconciliationStatus,
} from "./types";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const TREASURY_DIRECTION_LABELS: Record<TreasuryDirection, string> = {
  in: "In",
  out: "Out",
  internal: "Internal",
};

export const TREASURY_DIRECTION_VARIANTS: Record<TreasuryDirection, BadgeVariant> = {
  in: "success",
  out: "warning",
  internal: "neutral",
};

export const TREASURY_KIND_LABELS: Record<TreasuryEventKind, string> = {
  order_settlement_credit: "Order settlement",
  storefront_order_credit: "Storefront sale",
  wallet_funding_credit: "Wallet funding",
  admin_funding_credit: "Admin funding",
  adjustment_credit: "Adjustment in",
  provider_payout_debit: "Provider payout",
  withdrawal_debit: "Withdrawal",
  refund_rail_debit: "Refund payout",
  bank_transfer_debit: "Bank transfer",
  adjustment_debit: "Adjustment out",
  internal_reclassification: "Reclassification",
};

export const TREASURY_KIND_VARIANTS: Record<TreasuryEventKind, BadgeVariant> = {
  order_settlement_credit: "success",
  storefront_order_credit: "success",
  wallet_funding_credit: "brand",
  admin_funding_credit: "brand",
  adjustment_credit: "info",
  provider_payout_debit: "warning",
  withdrawal_debit: "warning",
  refund_rail_debit: "danger",
  bank_transfer_debit: "warning",
  adjustment_debit: "info",
  internal_reclassification: "neutral",
};

export const TREASURY_APPROVAL_LABELS: Record<TreasuryApprovalStatus, string> = {
  auto: "Auto",
  pending: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const TREASURY_APPROVAL_VARIANTS: Record<TreasuryApprovalStatus, BadgeVariant> = {
  auto: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const TREASURY_RECONCILIATION_LABELS: Record<
  TreasuryReconciliationStatus,
  string
> = {
  unmatched: "Unmatched",
  matched: "Matched",
  disputed: "Disputed",
};

export const TREASURY_RECONCILIATION_VARIANTS: Record<
  TreasuryReconciliationStatus,
  BadgeVariant
> = {
  unmatched: "warning",
  matched: "success",
  disputed: "danger",
};

export const TREASURY_POOL_LABELS: Record<TreasuryLiabilityPoolType, string> = {
  customer: "Atlas customer wallet",
  storefront_user: "Storefront user wallet",
  reseller: "Reseller commission wallet",
  merchant_billing: "Merchant billing wallet",
  merchant_main: "Merchant main wallet",
};

export const TREASURY_COVERAGE_LABELS: Record<TreasuryCoverageStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  danger: "Danger",
};

export const TREASURY_COVERAGE_VARIANTS: Record<
  TreasuryCoverageStatus,
  BadgeVariant
> = {
  healthy: "success",
  warning: "warning",
  danger: "danger",
};