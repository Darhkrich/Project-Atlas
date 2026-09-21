export type PaymentStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "refunded";

export type PaymentSource = "direct" | "reseller" | "ecommerce" | "admin";

export type PaymentUserType = "customer" | "reseller" | "merchant" | "admin";

export type PaymentMethodId =
  | "wallet"
  | "momo"
  | "card"
  | "bank"
  | "ussd"
  | "atlas_points";

export type WalletCreditStatus = "credited" | "pending" | "failed";

export type RefundStatus =
  | "none"
  | "pending"
  | "partial"
  | "settled"
  | "failed";

export type PaymentWalletStore =
  | "merchant_main"
  | "merchant_billing"
  | "reseller_commission"
  | "customer"
  | "reseller_storefront_user";

export interface PaymentTimelineEvent {
  timestamp: string;
  label: string;
  description?: string;
  status?: "success" | "warning" | "danger" | "info";
}

export interface PaymentRefundEvent {
  timestamp: string;
  amount: number;
  status: PaymentStatus;
  admin: { name: string; email: string };
}

export interface PaymentAuditEvent {
  timestamp: string;
  admin: string;
  action: string;
  previousState?: string;
  newState?: string;
}

export interface PaymentUser {
  id: string;
  name: string;
  type: PaymentUserType;
}

export interface PaymentReconciliation {
  id: string;
  paymentId: string;
  providerReference: string;
  note?: string;
  admin: { name: string; email: string };
  createdAt: string;
}

export interface PaymentFlag {
  id: string;
  paymentId: string;
  reason: PaymentFlagReason;
  note?: string;
  admin: { name: string; email: string };
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: { name: string; email: string };
  resolutionNote?: string;
}

export type PaymentFlagReason =
  | "provider_mismatch"
  | "missing_wallet_credit"
  | "customer_complaint"
  | "suspected_fraud"
  | "duplicate_charge"
  | "other";

export interface Payment {
  id: string;
  reference: string;
  user: PaymentUser;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  methodId: PaymentMethodId;
  provider?: string;
  status: PaymentStatus;
  source: PaymentSource;
  relatedOrderId?: string;
  relatedTransactionId?: string;
  relatedMerchantId?: string;
  relatedResellerId?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;

  walletId?: string;
  walletStore?: PaymentWalletStore;
  walletCreditedAt?: string;
  walletCreditStatus?: WalletCreditStatus;

  timeline: PaymentTimelineEvent[];
  refundStatus?: RefundStatus;
  refundHistory?: PaymentRefundEvent[];
  auditTrail?: PaymentAuditEvent[];
}

export interface PaymentStoreState {
  payments: Payment[];
  reconciliations: PaymentReconciliation[];
  flags: PaymentFlag[];
}