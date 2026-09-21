import type {
  WithdrawalMethod,
  WithdrawalHistoryStatus,
  WithdrawalRequestStatus,
  WalletApprovalReason,
} from "@/lib/admin/types/reseller-commission-wallet";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const WITHDRAWAL_METHOD_LABEL: Record<WithdrawalMethod, string> = {
  "Bank Transfer": "Bank Transfer",
  "Mobile Money": "Mobile Money",
  "Wallet Credit": "Wallet Credit",
};

export const WITHDRAWAL_METHOD_DESCRIPTION: Record<WithdrawalMethod, string> = {
  "Bank Transfer": "Cash out to the reseller's registered bank account.",
  "Mobile Money": "Cash out to the reseller's registered mobile money number.",
  "Wallet Credit": "Internal transfer to the reseller's Atlas wallet.",
};

export const WITHDRAWAL_METHOD_VARIANT: Record<
  WithdrawalMethod,
  BadgeVariant
> = {
  "Bank Transfer": "neutral",
  "Mobile Money": "neutral",
  "Wallet Credit": "info",
};

export const WITHDRAWAL_REQUEST_STATUS_LABEL: Record<
  WithdrawalRequestStatus,
  string
> = {
  pending: "Pending",
};

export const WITHDRAWAL_REQUEST_STATUS_VARIANT: Record<
  WithdrawalRequestStatus,
  BadgeVariant
> = {
  pending: "warning",
};

export const WITHDRAWAL_STATUS_LABEL: Record<
  WithdrawalHistoryStatus,
  string
> = {
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const WITHDRAWAL_STATUS_VARIANT: Record<
  WithdrawalHistoryStatus,
  BadgeVariant
> = {
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};

export const WITHDRAWAL_APPROVAL_REASON_LABEL: Record<
  WalletApprovalReason,
  string
> = {
  exceeds_threshold: "Exceeds threshold",
  insufficient_balance: "Insufficient balance",
  reseller_suspended: "Reseller suspended",
  verification_not_approved: "Verification not approved",
};

export const WITHDRAWAL_APPROVAL_REASON_VARIANT: Record<
  WalletApprovalReason,
  BadgeVariant
> = {
  exceeds_threshold: "warning",
  insufficient_balance: "danger",
  reseller_suspended: "danger",
  verification_not_approved: "warning",
};

export const WITHDRAWAL_FAILURE_REASON_LABEL: Record<string, string> = {
  insufficient_balance: "Insufficient commission balance",
  insufficient_commission_balance: "Insufficient commission balance",
};

export const ALL_WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  "Bank Transfer",
  "Mobile Money",
  "Wallet Credit",
];

export const EXTERNAL_WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  "Bank Transfer",
  "Mobile Money",
];

export function isInternalMethod(method: WithdrawalMethod): boolean {
  return method === "Wallet Credit";
}