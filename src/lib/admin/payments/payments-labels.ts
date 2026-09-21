import type {
  Payment,
  PaymentFlagReason,
  PaymentMethodId,
  PaymentSource,
  PaymentStatus,
  PaymentUserType,
  RefundStatus,
  WalletCreditStatus,
} from "@/lib/admin/types/payment";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, Variant> = {
  pending: "warning",
  processing: "info",
  successful: "success",
  failed: "danger",
  refunded: "neutral",
};

export const PAYMENT_SOURCE_LABEL: Record<PaymentSource, string> = {
  direct: "Atlas direct",
  reseller: "Reseller",
  ecommerce: "Ecommerce",
  admin: "Admin",
};

export const PAYMENT_SOURCE_VARIANT: Record<PaymentSource, Variant> = {
  direct: "brand",
  reseller: "info",
  ecommerce: "success",
  admin: "neutral",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodId, string> = {
  wallet: "Wallet",
  momo: "Mobile Money",
  card: "Card",
  bank: "Bank Transfer",
  ussd: "USSD",
  atlas_points: "Atlas Points",
};

export const PAYMENT_METHOD_VARIANT: Record<PaymentMethodId, Variant> = {
  wallet: "brand",
  momo: "neutral",
  card: "neutral",
  bank: "neutral",
  ussd: "info",
  atlas_points: "success",
};

export const WALLET_CREDIT_STATUS_LABEL: Record<WalletCreditStatus, string> = {
  credited: "Wallet credited",
  pending: "Wallet credit pending",
  failed: "Wallet credit failed",
};

export const WALLET_CREDIT_STATUS_VARIANT: Record<WalletCreditStatus, Variant> =
  {
    credited: "success",
    pending: "warning",
    failed: "danger",
  };

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  none: "No refund",
  pending: "Refund pending",
  partial: "Partial refund",
  settled: "Refund settled",
  failed: "Refund failed",
};

export const REFUND_STATUS_VARIANT: Record<RefundStatus, Variant> = {
  none: "neutral",
  pending: "warning",
  partial: "info",
  settled: "success",
  failed: "danger",
};

export const PAYMENT_USER_TYPE_LABEL: Record<PaymentUserType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
  admin: "Admin",
};

export const PAYMENT_FLAG_REASON_LABEL: Record<PaymentFlagReason, string> = {
  provider_mismatch: "Provider mismatch",
  missing_wallet_credit: "Missing wallet credit",
  customer_complaint: "Customer complaint",
  suspected_fraud: "Suspected fraud",
  duplicate_charge: "Duplicate charge",
  other: "Other",
};

const NON_RETRYABLE_FAILURE_PATTERNS: string[] = [
  "insufficient",
  "declined by customer",
  "customer cancelled",
];

export function isPaymentRetryable(payment: Payment): boolean {
  if (payment.status !== "failed") return false;
  const reason = (payment.failureReason ?? "").toLowerCase();
  if (reason.length === 0) return true;
  for (const pattern of NON_RETRYABLE_FAILURE_PATTERNS) {
    if (reason.includes(pattern)) return false;
  }
  return true;
}

export function retryBlockedReason(payment: Payment): string | null {
  if (payment.status !== "failed") return "Only failed payments can be retried.";
  const reason = (payment.failureReason ?? "").toLowerCase();
  if (reason.includes("insufficient")) {
    return "Insufficient balance. The wallet owner must fund before this can succeed.";
  }
  if (reason.includes("declined by customer")) {
    return "The customer declined this charge. Retry will not succeed.";
  }
  if (reason.includes("customer cancelled")) {
    return "The customer cancelled this payment.";
  }
  return null;
}