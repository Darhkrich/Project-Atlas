import type { PaymentMethodId } from "./payment";

export type RefundType = "automatic" | "requested";

export type RefundAudience = "direct" | "storefront_user" | "reseller";

export type RefundStatus =
  | "pending_admin"
  | "approved"
  | "processing"
  | "completed"
  | "failed"
  | "rejected";

export type RefundReasonSystem =
  | "provider_failure"
  | "service_not_delivered"
  | "atlas_internal_error";

export type RefundReasonCustomer =
  | "customer_request"
  | "duplicate_charge"
  | "fraud_suspected"
  | "other";

export type RefundReason = RefundReasonSystem | RefundReasonCustomer;

export type RefundDestination = "wallet" | "original_rail";

export interface RefundActor {
  id: string;
  name: string;
  email: string;
}

export interface RefundSettlement {
  id: string;
  amount: number;
  settledAt: string;
  destination: RefundDestination;
  destinationDetail: string;
  walletId?: string;
  transactionId?: string;
  railReversalPending?: boolean;
  actor: RefundActor;
}

export interface OrderRefSnapshot {
  orderId: string;
  serviceId: string;
  providerId: string;
  paymentMethodId: PaymentMethodId;
  amount: number;
  createdAt: string;
}

export interface ResellerRecovery {
  resellerId: string;
  walletId: string;
  amount: number;
  recoveredAmount: number;
  recoveryStartedAt: string;
}

export type RefundTimelineEventType =
  | "requested"
  | "created"
  | "approved"
  | "rejected"
  | "processing"
  | "settled"
  | "failed"
  | "recovered"
  | "automatic";

export type RefundTimelineEventStatus =
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface RefundTimelineEvent {
  type: RefundTimelineEventType;
  status: RefundTimelineEventStatus;
  timestamp: string;
  label: string;
  description?: string;
  actor?: RefundActor;
}

export interface CustomerRefundHistoryItem {
  id: string;
  orderId: string;
  amount: number;
  status: RefundStatus;
  date: string;
}

export interface Refund {
  id: string;
  type: RefundType;
  audience: RefundAudience;
  status: RefundStatus;

  order: OrderRefSnapshot;

  customer: { id: string; name: string };
  reseller: { id: string; name: string } | null;

  amount: number;
  settlements: RefundSettlement[];

  atlasShareAmount: number;
  resellerShareAmount: number;
  resellerRecovery?: ResellerRecovery;

  reason: RefundReason;
  reasonNote?: string;

  supportTicketId?: string;
  atlasTreasuryDebitId?: string;

  customerHistory: CustomerRefundHistoryItem[];

  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;

  createdBy?: RefundActor;
  approvedBy?: RefundActor;
  rejectedBy?: RefundActor;

  rejectionReason?: string;

  timeline: RefundTimelineEvent[];
}

export interface RefundLedgerFilters {
  search?: string;
  type?: RefundType;
  audience?: RefundAudience;
  status?: RefundStatus;
  reason?: RefundReason;
  dateFrom?: string;
  dateTo?: string;
}

export interface RefundSummary {
  volumeToday: number;
  volumeYesterday: number;
  countToday: number;
  countYesterday: number;
  awaitingApprovalCount: number;
  awaitingApprovalYesterday: number;
  failedToday: number;
  failedYesterday: number;
  treasuryBalance: number;
}

export type RiskBand = "clean" | "low" | "medium" | "high";