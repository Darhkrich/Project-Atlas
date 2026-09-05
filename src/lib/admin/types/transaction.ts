export type TransactionStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "cancelled"
  | "refunded";

export type SettlementStatus = "unsettled" | "pending" | "settled" | "failed";
export type RefundStatus = "none" | "pending" | "partial" | "completed" | "failed";
export type TransactionType = "deposit" | "withdrawal" | "purchase" | "commission" | "refund" | "adjustment";

export interface TransactionTimelineEvent {
  timestamp: string;
  label: string;
  description?: string;
  status?: "success" | "warning" | "danger" | "info";
}

export interface Transaction {
  id: string;
  reference: string;
  user: {
    id: string;
    name: string;
    type: "reseller" | "customer" | "merchant" | "admin";
  };
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  paymentMethodId: string; // wallet, momo, card, bank, ussd, atlas_points
  provider?: string;
  status: TransactionStatus;
  settlementStatus: SettlementStatus;
  refundStatus: RefundStatus;
  source: "direct" | "reseller" | "ecommerce" | "admin";
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  relatedOrderId?: string;
  relatedWalletId?: string;
  timeline: TransactionTimelineEvent[];
  auditTrail?: {
    timestamp: string;
    admin: string;
    action: string;
    previousState?: string;
    newState?: string;
  }[];
  refundHistory?: {
    timestamp: string;
    amount: number;
    status: RefundStatus;
    admin: string;
  }[];
}