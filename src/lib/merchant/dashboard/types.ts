import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "@/lib/merchant/orders/types";

export type DashboardActionKind =
  | "unfulfilled_orders"
  | "low_stock"
  | "action_required_notifications"
  | "billing_wallet_low"
  | "pending_withdrawals";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export interface DashboardAction {
  kind: DashboardActionKind;
  count: number;
  title: string;
  description: string;
  href: string;
}

export interface DashboardOrderRow {
  id: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  statusVariant: StatusVariant;
  paymentVariant: StatusVariant;
  createdAt: number;
}

export interface DashboardWalletSnapshot {
  mainBalance: number;
  billingBalance: number;
  mainFrozen: boolean;
  billingFrozen: boolean;
  pendingWithdrawalCount: number;
  nextChargeAmount: number | null;
  nextChargeDate: string | null;
  pastDueCount: number;
  autoPayEnabled: boolean;
  autoPaySource: "card" | "billing_wallet";
  currency: string;
}

export interface DashboardStorefrontHealth {
  status: "draft" | "live";
  displayUrl: string;
  templateLabel: string;
  categoryLabel: string;
}

export interface DashboardTodaySnapshot {
  orderCount: number;
  salesTotal: number;
}

export interface MerchantDashboardSnapshot {
  store: MerchantStorefrontConfig;
  actions: DashboardAction[];
  recentOrders: DashboardOrderRow[];
  wallet: DashboardWalletSnapshot | null;
  storefront: DashboardStorefrontHealth;
  today: DashboardTodaySnapshot;
  productCount: number;
  customerCount: number;
  isEmpty: boolean;
  hasNoData: boolean;
  hasNoOrders: boolean;
}