export type OrderStatus =
  | "successful"
  | "pending"
  | "processing"
  | "failed"
  | "cancelled"
  | "refunded";

export type OrderSource = "direct" | "reseller";

export interface Order {
  id: string;
  source: OrderSource; // NEW
  customer: {
    name: string;
    phone: string;
  };
  reseller: {
    name: string;
    id: string;
  } | null;
  service: string;
  network?: string;
  amount: number;
  commission: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
  provider?: string;
  paymentReference?: string;
  failureReason?: string;
}

export interface OrderTimelineEvent {
  timestamp: string;
  label: string;
  description?: string;
  status?: "success" | "warning" | "danger" | "info";
}