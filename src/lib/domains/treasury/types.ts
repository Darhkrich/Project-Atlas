// lib/domains/treasury/types.ts

export type TreasuryDirection = "in" | "out" | "internal";

export type TreasuryEventKind =
  | "order_settlement_credit"
  | "storefront_order_credit"
  | "wallet_funding_credit"
  | "admin_funding_credit"
  | "adjustment_credit"
  | "provider_payout_debit"
  | "withdrawal_debit"
  | "refund_rail_debit"
  | "bank_transfer_debit"
  | "adjustment_debit"
  | "internal_reclassification";

export type TreasuryApprovalStatus =
  | "auto"
  | "pending"
  | "approved"
  | "rejected";

export type TreasuryReconciliationStatus =
  | "unmatched"
  | "matched"
  | "disputed";

export type TreasuryLiabilityPoolType =
  | "customer"
  | "storefront_user"
  | "reseller"
  | "merchant_billing"
  | "merchant_main";

export type TreasuryCounterpartyType =
  | "customer"
  | "storefront_user"
  | "reseller"
  | "merchant"
  | "provider"
  | "bank"
  | "admin"
  | "system";

export type TreasuryCoverageStatus = "healthy" | "warning" | "danger";

export interface TreasuryActor {
  id: string;
  name: string;
  email: string;
}

export interface TreasuryCounterparty {
  type: TreasuryCounterpartyType;
  id: string;
  name: string;
}

export interface TreasuryEvent {
  id: string;
  kind: TreasuryEventKind;
  direction: TreasuryDirection;
  amount: number;
  currency: "GHS";
  counterparty: TreasuryCounterparty | null;
  poolType?: TreasuryLiabilityPoolType;
  ownerId?: string;
  reference: string;
  description: string;
  approvalStatus: TreasuryApprovalStatus;
  reconciliationStatus: TreasuryReconciliationStatus;
  relatedEventId?: string;
  createdAt: string;
  createdBy: TreasuryActor;
  approvedBy?: TreasuryActor;
  approvedAt?: string;
  settledAt?: string;
  rejectionReason?: string;
}

export interface TreasurySummary {
  cashAtBank: number;
  committedOutbound: number;
  available: number;
  userLiabilities: number;
  freeCash: number;
  coverageStatus: TreasuryCoverageStatus;
  coverageRatio: number;
  unmatchedCount: number;
  pendingApprovalCount: number;
}

export interface TreasuryEventFilters {
  search?: string;
  direction?: TreasuryDirection;
  kind?: TreasuryEventKind;
  approvalStatus?: TreasuryApprovalStatus;
  reconciliationStatus?: TreasuryReconciliationStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface TreasuryStatementRow {
  id: string;
  kind: TreasuryEventKind;
  direction: TreasuryDirection;
  counterpartyName: string | null;
  amount: number;
  approvalStatus: TreasuryApprovalStatus;
  reconciliationStatus: TreasuryReconciliationStatus;
  reference: string;
  description: string;
  createdAt: string;
  settledAt: string | null;
}