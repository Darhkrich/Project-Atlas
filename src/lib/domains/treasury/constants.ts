// lib/domains/treasury/constants.ts

import type {
  TreasuryApprovalStatus,
  TreasuryDirection,
  TreasuryEventKind,
  TreasuryReconciliationStatus,
} from "./types";

export const TREASURY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_TREASURY_PAGE_SIZE = 20;

export const TREASURY_DEFAULT_RANGE_DAYS = 30;

export const DUAL_APPROVAL_THRESHOLD_GHS = 10000;

export const RESERVE_FLOOR_WARN_PERCENT = 25;

export const TREASURY_LIABILITIES_MOCK_GHS = 320000;

export const ALWAYS_DUAL_APPROVAL_KINDS: TreasuryEventKind[] = [
  "bank_transfer_debit",
  "provider_payout_debit",
];

export const TREASURY_DIRECTION_ORDER: TreasuryDirection[] = [
  "in",
  "out",
  "internal",
];

export const TREASURY_KIND_ORDER: TreasuryEventKind[] = [
  "order_settlement_credit",
  "storefront_order_credit",
  "wallet_funding_credit",
  "admin_funding_credit",
  "adjustment_credit",
  "provider_payout_debit",
  "withdrawal_debit",
  "refund_rail_debit",
  "bank_transfer_debit",
  "adjustment_debit",
  "internal_reclassification",
];

export const TREASURY_APPROVAL_ORDER: TreasuryApprovalStatus[] = [
  "auto",
  "pending",
  "approved",
  "rejected",
];

export const TREASURY_RECONCILIATION_ORDER: TreasuryReconciliationStatus[] = [
  "unmatched",
  "matched",
  "disputed",
];

export const MOCK_BANNER_TEXT =
  "Treasury movements are mock. No real money moves. Wire to the banking layer before any live use.";