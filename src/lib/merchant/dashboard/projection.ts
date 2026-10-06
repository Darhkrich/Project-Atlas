import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";
import type { MerchantNotification } from "@/lib/merchant/notifications/types";
import type {
  MerchantBillingSummary,
  MerchantPendingWithdrawalRow,
  MerchantWalletView,
} from "@/lib/domains/wallet/merchant-money/types";
import type { CustomerOrder } from "@/contexts/orders-context";
import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "@/lib/merchant/orders/types";
import { merchantActionRequired } from "@/lib/merchant/notifications/merchant-action-required";
import {
  ACTION_QUEUE_LIMIT,
  CATEGORY_LABELS,
  LOW_STOCK_THRESHOLD,
  RECENT_ORDERS_LIMIT,
} from "./constants";
import { ACTION_KIND_ORDER, ACTION_KIND_TITLES } from "./labels";
import type {
  DashboardAction,
  DashboardOrderRow,
  DashboardStorefrontHealth,
  DashboardTodaySnapshot,
  DashboardWalletSnapshot,
  MerchantDashboardSnapshot,
  StatusVariant,
} from "./types";

export interface DashboardProjectionInput {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
  orders: CustomerOrder[];
  notifications: MerchantNotification[];
  wallet: MerchantWalletView | null;
  billingSummary: MerchantBillingSummary | null;
  pendingWithdrawals: MerchantPendingWithdrawalRow[];
  storeDisplayUrl: string;
  nowMs: number;
}

export function startOfDayMs(nowMs: number): number {
  const d = new Date(nowMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function templateLabelFromId(id: string): string {
  return id
    .replace(/^tpl-/, "")
    .split("-")
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function statusVariantFor(status: CustomerOrderStatus): StatusVariant {
  switch (status) {
    case "new":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "brand";
    case "delivered":
      return "success";
    case "cancelled":
      return "neutral";
  }
}

function paymentVariantFor(
  paymentStatus: CustomerOrderPaymentStatus
): StatusVariant {
  switch (paymentStatus) {
    case "pending":
      return "neutral";
    case "paid":
      return "success";
    case "refunded":
      return "neutral";
    case "partially_refunded":
      return "warning";
    case "failed":
      return "danger";
  }
}

function isUnfulfilled(status: CustomerOrderStatus): boolean {
  return status === "new" || status === "processing";
}

function merchantRelevantOrders(orders: CustomerOrder[]): CustomerOrder[] {
  return orders.filter((o) => o.status !== "cancelled");
}

function lowStockProducts(
  products: MerchantStorefrontProduct[]
): MerchantStorefrontProduct[] {
  return products.filter(
    (p) =>
      typeof p.stockLevel === "number" &&
      p.stockLevel > 0 &&
      p.stockLevel <= LOW_STOCK_THRESHOLD
  );
}

function recentOrderRows(orders: CustomerOrder[]): DashboardOrderRow[] {
  return orders
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, RECENT_ORDERS_LIMIT)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: o.customerEmail,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      statusVariant: statusVariantFor(o.status),
      paymentVariant: paymentVariantFor(o.paymentStatus),
      createdAt: o.createdAt,
    }));
}

function customerCountFromOrders(orders: CustomerOrder[]): number {
  const set = new Set<string>();
  for (const o of orders) {
    if (o.customerEmail) set.add(o.customerEmail);
  }
  return set.size;
}

function todaySnapshot(
  orders: CustomerOrder[],
  nowMs: number
): DashboardTodaySnapshot {
  const start = startOfDayMs(nowMs);
  const todays = orders.filter((o) => o.createdAt >= start);
  const total = todays.reduce((sum, o) => sum + o.total, 0);
  return { orderCount: todays.length, salesTotal: total };
}

function walletSnapshot(
  wallet: MerchantWalletView | null,
  billingSummary: MerchantBillingSummary | null,
  pendingWithdrawals: MerchantPendingWithdrawalRow[]
): DashboardWalletSnapshot | null {
  if (!wallet) return null;
  return {
    mainBalance: wallet.main.balance,
    billingBalance: wallet.billing.balance,
    mainFrozen: wallet.mainFrozen,
    billingFrozen: wallet.billingFrozen,
    pendingWithdrawalCount: pendingWithdrawals.length,
    nextChargeAmount: billingSummary?.nextChargeAmount ?? null,
    nextChargeDate: billingSummary?.nextChargeDate ?? null,
    pastDueCount: billingSummary?.pastDueCount ?? 0,
    autoPayEnabled: billingSummary?.autoPayEnabled ?? false,
    autoPaySource: billingSummary?.autoPaySource ?? "card",
    currency: wallet.main.currency,
  };
}

function storefrontHealth(
  store: MerchantStorefrontConfig,
  displayUrl: string
): DashboardStorefrontHealth {
  return {
    status: store.status,
    displayUrl,
    templateLabel: templateLabelFromId(store.templateId),
    categoryLabel: CATEGORY_LABELS[store.templateCategory] ?? "General",
  };
}

function buildActions(input: DashboardProjectionInput): DashboardAction[] {
  const orders = merchantRelevantOrders(input.orders);
  const actions: DashboardAction[] = [];

  const unfulfilled = orders.filter((o) => isUnfulfilled(o.status)).length;
  if (unfulfilled > 0) {
    actions.push({
      kind: "unfulfilled_orders",
      count: unfulfilled,
      title: ACTION_KIND_TITLES.unfulfilled_orders,
      description:
        unfulfilled === 1
          ? "1 order is waiting to be processed."
          : unfulfilled + " orders are waiting to be processed.",
      href: "/merchant/orders",
    });
  }

  const lowStock = lowStockProducts(input.products);
  if (lowStock.length > 0) {
    actions.push({
      kind: "low_stock",
      count: lowStock.length,
      title: ACTION_KIND_TITLES.low_stock,
      description:
        lowStock.length === 1
          ? "1 product is running low."
          : lowStock.length + " products are running low.",
      href: "/merchant/products",
    });
  }

  const actionRequired = input.notifications.filter(
    (n) =>
      n.readAt === null &&
      n.snoozedUntil === null &&
      merchantActionRequired(n.kind)
  ).length;
  if (actionRequired > 0) {
    actions.push({
      kind: "action_required_notifications",
      count: actionRequired,
      title: ACTION_KIND_TITLES.action_required_notifications,
      description:
        actionRequired === 1
          ? "1 notification needs your attention."
          : actionRequired + " notifications need your attention.",
      href: "/merchant/notifications",
    });
  }

  const nextCharge = input.billingSummary?.nextChargeAmount ?? null;
  const billingLow =
    nextCharge !== null &&
    input.wallet !== null &&
    input.wallet.billing.balance < nextCharge;
  if (billingLow) {
    actions.push({
      kind: "billing_wallet_low",
      count: 1,
      title: ACTION_KIND_TITLES.billing_wallet_low,
      description: "Top up before the next plan charge.",
      href: "/merchant/billing",
    });
  }

  if (input.pendingWithdrawals.length > 0) {
    actions.push({
      kind: "pending_withdrawals",
      count: input.pendingWithdrawals.length,
      title: ACTION_KIND_TITLES.pending_withdrawals,
      description:
        input.pendingWithdrawals.length === 1
          ? "1 withdrawal is waiting on Atlas."
          : input.pendingWithdrawals.length +
            " withdrawals are waiting on Atlas.",
      href: "/merchant/wallet",
    });
  }

  actions.sort(
    (a, b) =>
      ACTION_KIND_ORDER.indexOf(a.kind) - ACTION_KIND_ORDER.indexOf(b.kind)
  );

  return actions.slice(0, ACTION_QUEUE_LIMIT);
}

export function projectMerchantDashboard(
  input: DashboardProjectionInput
): MerchantDashboardSnapshot {
  const relevantOrders = merchantRelevantOrders(input.orders);
  const products = input.products;
  const hasNoData = products.length === 0 && relevantOrders.length === 0;
  const hasNoOrders = relevantOrders.length === 0;
  const isEmpty = hasNoData && input.store.status === "draft";

  return {
    store: input.store,
    actions: buildActions(input),
    recentOrders: recentOrderRows(relevantOrders),
    wallet: walletSnapshot(
      input.wallet,
      input.billingSummary,
      input.pendingWithdrawals
    ),
    storefront: storefrontHealth(input.store, input.storeDisplayUrl),
    today: todaySnapshot(relevantOrders, input.nowMs),
    productCount: products.length,
    customerCount: customerCountFromOrders(relevantOrders),
    isEmpty,
    hasNoData,
    hasNoOrders,
  };
}