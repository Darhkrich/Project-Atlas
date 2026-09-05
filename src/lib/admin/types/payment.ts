export type PaymentStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  reference: string;
  user: {
    id: string;
    name: string;
    type: "reseller" | "customer" | "merchant" | "admin";
  };
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  methodId: string; // wallet, momo, card, bank, ussd, atlas_points
  provider?: string;
  status: PaymentStatus;
  source: "direct" | "reseller" | "ecommerce" | "admin";
  relatedOrderId?: string;
  relatedTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  timeline: PaymentTimelineEvent[];
  refundStatus?: "none" | "pending" | "partial" | "completed" | "failed";
  refundHistory?: PaymentRefundEvent[];
  auditTrail?: {
    timestamp: string;
    admin: string;
    action: string;
    previousState?: string;
    newState?: string;
  }[];
}

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
  admin: string;
}