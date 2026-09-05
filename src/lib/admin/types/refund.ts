export type RefundStatus =
  | "requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "processed";

export type RefundReason =
  | "service_not_delivered"
  | "duplicate_charge"
  | "customer_request"
  | "provider_failure"
  | "fraud_suspected"
  | "other";

export type NotificationChannel = "email" | "sms" | "in_app";

export interface CustomerRefundHistoryItem {
  id: string;
  orderId: string;
  amount: number;
  status: RefundStatus;
  date: string;
}

export interface InternalNote {
  id: string;
  admin: string;
  timestamp: string;
  content: string;
}

export interface RefundNotification {
  id: string;
  channel: NotificationChannel;
  timestamp: string;
  recipient: string;
  status: "sent" | "pending" | "failed";
}

export interface RefundRule {
  id: string;
  name: string;
  condition: string;
  action: "auto_approve" | "auto_reject" | "flag";
  enabled: boolean;
}

export interface Refund {
  id: string;
  orderId: string;
  transactionId: string;
  customer: {
    id: string;
    name: string;
  };
  reseller?: {
    id: string;
    name: string;
  } | null;
  amount: number;
  refundedAmount?: number;
  remainingRefundable?: number;
  reason: RefundReason;
  reasonNote?: string;
  status: RefundStatus;
  requestedAt: string;
  updatedAt: string;
  processedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  processedBy?: string;
  riskLevel?: "low" | "medium" | "high";
  riskScore?: number; // 0-100
  customerHistory?: CustomerRefundHistoryItem[];
  internalNotes?: InternalNote[];
  notifications?: RefundNotification[];
  timeline: {
    timestamp: string;
    label: string;
    description?: string;
    status: "info" | "success" | "warning" | "danger";
  }[];
  auditTrail?: {
    timestamp: string;
    admin: string;
    action: string;
    previousState?: string;
    newState?: string;
  }[];
}

export const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: "service_not_delivered", label: "Service not delivered" },
  { value: "duplicate_charge", label: "Duplicate charge" },
  { value: "customer_request", label: "Customer request" },
  { value: "provider_failure", label: "Provider failure" },
  { value: "fraud_suspected", label: "Fraud suspected" },
  { value: "other", label: "Other" },
];

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  requested: "Requested",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  processed: "Processed",
};