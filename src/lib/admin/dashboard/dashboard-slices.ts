import type { Order } from "@/lib/admin/types/orders";
import type { Refund } from "@/lib/admin/types/refund";
import type { Provider } from "@/lib/admin/types/provider";
import type { Reseller } from "@/lib/admin/types/reseller";
import type { ServiceCategory } from "@/lib/domains/catalog";
import type {
  MerchantMoneyStoreState,
} from "@/lib/domains/wallet/merchant-money/types";
import type { ResellerWalletStoreState } from "@/lib/reseller/types/wallet";
import type { AuditEntry } from "@/lib/domains/audit";
import type {
  DistributionSlice,
} from "@/components/admin/dashboard/distribution-panel";
import type { ListPanelRow } from "@/components/admin/dashboard/list-panel";
import type { TrendSeries } from "@/components/admin/dashboard/trend-panel";
import { CHART_PALETTE } from "@/lib/admin/charts/theme";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/shared/format";
import { allPlansFor } from "@/lib/domains/catalog";

export interface DashboardSlices {
  revenueTrend: {
    data: Array<Record<string, string | number>>;
    series: TrendSeries[];
    valueFormatter: "currency";
  };
  ordersTrend: {
    data: Array<Record<string, string | number>>;
    series: TrendSeries[];
    valueFormatter: "number";
  };
  orderStatusBreakdown: DistributionSlice[];
  providerRows: Array<{
    id: string;
    name: string;
    successRate: number;
    healthStatus: string;
  }>;
  walletRollup: DistributionSlice[];
  storefrontStatus: DistributionSlice[];
  categoryMix: DistributionSlice[];
  recentOrders: ListPanelRow[];
  recentRefunds: ListPanelRow[];
  withdrawalQueue: ListPanelRow[];
  verificationQueue: ListPanelRow[];
  catalogChanges: ListPanelRow[];
  lowMarginPlans: ListPanelRow[];
  providerDegradedRows: ListPanelRow[];
}

const MONTH_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return (
    d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0")
  );
}

function monthLabel(key: string): string {
  const parts = key.split("-");
  if (parts.length !== 2) return key;
  const idx = Number(parts[1]) - 1;
  return MONTH_LABEL[idx] ?? key;
}

function lastTwelveMonthKeys(nowMs: number): string[] {
  const keys: string[] = [];
  const d = new Date(nowMs);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  for (let i = 11; i >= 0; i -= 1) {
    const copy = new Date(d);
    copy.setUTCMonth(copy.getUTCMonth() - i);
    keys.push(
      copy.getUTCFullYear() +
        "-" +
        String(copy.getUTCMonth() + 1).padStart(2, "0")
    );
  }
  return keys;
}

function streamFor(audience: Order["audience"]): "digital_services" | "resellers" {
  return audience === "direct" ? "digital_services" : "resellers";
}

function buildRevenueTrend(
  orders: Order[],
  nowMs: number
): DashboardSlices["revenueTrend"] {
  const keys = lastTwelveMonthKeys(nowMs);
  const byKey = new Map<
    string,
    { digital_services: number; resellers: number; total: number }
  >();
  for (const k of keys) {
    byKey.set(k, { digital_services: 0, resellers: 0, total: 0 });
  }
  for (const o of orders) {
    if (o.status !== "successful") continue;
    const key = monthKey(o.createdAt);
    if (!key) continue;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    const stream = streamFor(o.audience);
    bucket[stream] += o.amount;
    bucket.total += o.amount;
  }
  const data = keys.map((k) => {
    const b = byKey.get(k) ?? {
      digital_services: 0,
      resellers: 0,
      total: 0,
    };
    return {
      label: monthLabel(k),
      digital_services: b.digital_services,
      resellers: b.resellers,
      total: b.total,
    };
  });
  return {
    data,
    series: [
      { key: "digital_services", label: "Digital services", color: CHART_PALETTE.info },
      { key: "resellers", label: "Resellers", color: CHART_PALETTE.success },
    ],
    valueFormatter: "currency",
  };
}

function buildOrdersTrend(orders: Order[]): DashboardSlices["ordersTrend"] {
  const byKey = new Map<
    string,
    { successful: number; failed: number; total: number }
  >();
  const keys: string[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const key =
      d.getUTCMonth() + 1 + "/" + d.getUTCDate();
    keys.push(key);
    byKey.set(key, { successful: 0, failed: 0, total: 0 });
  }
  for (const o of orders) {
    const t = new Date(o.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    const d = new Date(t);
    const key = d.getUTCMonth() + 1 + "/" + d.getUTCDate();
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (o.status === "successful") bucket.successful += 1;
    if (o.status === "failed") bucket.failed += 1;
  }
  const data = keys.map((k) => ({
    label: k,
    successful: byKey.get(k)?.successful ?? 0,
    failed: byKey.get(k)?.failed ?? 0,
  }));
  return {
    data,
    series: [
      { key: "successful", label: "Successful", color: CHART_PALETTE.success },
      { key: "failed", label: "Failed", color: CHART_PALETTE.danger },
    ],
    valueFormatter: "number",
  };
}

function buildOrderStatusBreakdown(orders: Order[]): DistributionSlice[] {
  const counts = {
    pending: 0,
    processing: 0,
    retrying: 0,
    successful: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    counts[o.status] += 1;
  }
  return [
    { id: "successful", label: "Successful", value: counts.successful, color: CHART_PALETTE.success },
    { id: "failed", label: "Failed", value: counts.failed, color: CHART_PALETTE.danger },
    { id: "retrying", label: "Retrying", value: counts.retrying, color: CHART_PALETTE.warning },
    { id: "pending", label: "Pending", value: counts.pending, color: CHART_PALETTE.info },
    { id: "processing", label: "Processing", value: counts.processing, color: CHART_PALETTE.purple },
    { id: "cancelled", label: "Cancelled", value: counts.cancelled, color: CHART_PALETTE.neutral },
  ];
}

function buildWalletRollup(
  merchantMoneyStore: MerchantMoneyStoreState,
  resellerWalletState: ResellerWalletStoreState
): DistributionSlice[] {
  let merchantMain = 0;
  let merchantBilling = 0;
  for (const id of Object.keys(merchantMoneyStore)) {
    const state = merchantMoneyStore[id];
    if (!state) continue;
    merchantMain += state.main.balance ?? 0;
    merchantBilling += state.billing.balance ?? 0;
  }
  let reseller = 0;
  const rw = resellerWalletState.wallets;
  if (rw) {
    for (const id of Object.keys(rw)) {
      reseller += rw[id]?.balance ?? 0;
    }
  }
  return [
    { id: "reseller", label: "Reseller wallets", value: Math.max(0, reseller), color: CHART_PALETTE.success },
    { id: "merchantMain", label: "Merchant main", value: Math.max(0, merchantMain), color: CHART_PALETTE.warning },
    { id: "merchantBilling", label: "Merchant billing", value: Math.max(0, merchantBilling), color: CHART_PALETTE.info },
  ];
}

function buildStorefrontStatus(resellers: Reseller[]): DistributionSlice[] {
  let live = 0;
  let pending = 0;
  let suspended = 0;
  for (const r of resellers) {
    if (r.status === "active") live += 1;
    else if (r.status === "pending") pending += 1;
    else if (r.status === "suspended") suspended += 1;
  }
  return [
    { id: "live", label: "Live", value: live, color: CHART_PALETTE.success },
    { id: "pending", label: "Pending", value: pending, color: CHART_PALETTE.warning },
    { id: "suspended", label: "Suspended", value: suspended, color: CHART_PALETTE.danger },
  ];
}

function buildCategoryMix(catalog: ServiceCategory[]): DistributionSlice[] {
  return catalog.map((cat, i) => {
    const planCount = allPlansFor(cat).length;
    const palette = [
      CHART_PALETTE.info,
      CHART_PALETTE.success,
      CHART_PALETTE.warning,
      CHART_PALETTE.purple,
      CHART_PALETTE.teal,
      CHART_PALETTE.brand,
      CHART_PALETTE.neutral,
      CHART_PALETTE.danger,
    ];
    return {
      id: cat.id,
      label: cat.name,
      value: planCount,
      color: palette[i % palette.length],
    };
  });
}

function buildRecentOrders(orders: Order[], nowMs: number): ListPanelRow[] {
  return [...orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      label: o.customer.name,
      sublabel: o.id + " · " + formatRelative(o.createdAt, nowMs),
      value: formatCurrency(o.amount),
      href: "/admin/orders/" + o.id,
      tone:
        o.status === "successful"
          ? "success"
          : o.status === "failed"
          ? "danger"
          : o.status === "retrying"
          ? "warning"
          : "neutral",
    }));
}

function buildRecentRefunds(refunds: Refund[], nowMs: number): ListPanelRow[] {
  return [...refunds]
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      label: r.customer.name,
      sublabel: r.id + " · " + formatRelative(r.requestedAt, nowMs),
      value: formatCurrency(r.amount),
      href: "/admin/refunds",
      tone: r.status === "completed" ? "success" : "warning",
    }));
}

function buildWithdrawalQueue(
  merchantMoneyStore: MerchantMoneyStoreState,
  merchantsById: Map<string, string>
): ListPanelRow[] {
  const rows: ListPanelRow[] = [];
  for (const id of Object.keys(merchantMoneyStore)) {
    const state = merchantMoneyStore[id];
    if (!state) continue;
    for (const w of state.withdrawalRequests) {
      if (w.status !== "pending_admin") continue;
      rows.push({
        id: w.id,
        label: merchantsById.get(id) ?? id,
        sublabel: "Awaiting approval",
        value: formatCurrency(w.total),
        href: "/admin/ecommerce/payments",
        tone: "warning",
      });
    }
  }
  return rows.slice(0, 5);
}

function buildVerificationQueue(resellers: Reseller[]): ListPanelRow[] {
  return resellers
    .filter(
      (r) =>
        r.verificationStatus === "pending" ||
        r.verificationStatus === "rejected"
    )
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      label: r.businessName,
      sublabel:
        r.verificationStatus === "rejected" ? "Rejected" : "Pending review",
      value: r.verificationStatus === "rejected" ? "Rejected" : "Pending",
      href: "/admin/resellers/" + r.id,
      tone: r.verificationStatus === "rejected" ? "danger" : "warning",
    }));
}

function buildCatalogChanges(
  audit: AuditEntry[],
  nowMs: number
): ListPanelRow[] {
  return audit
    .filter((e) => e.action.startsWith("catalog."))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      label: e.resourceId,
      sublabel:
        e.actorName + " · " + formatRelative(e.createdAt, nowMs),
      value: e.action.replace("catalog.", ""),
      href: "/admin/pricing",
      tone: "neutral",
    }));
}

function buildLowMarginPlans(catalog: ServiceCategory[]): ListPanelRow[] {
  const rows: ListPanelRow[] = [];
  for (const cat of catalog) {
    for (const plan of allPlansFor(cat)) {
      if (plan.providerCost === undefined) continue;
      if (plan.price <= 0) continue;
      const margin = ((plan.price - plan.providerCost) / plan.price) * 100;
      if (margin >= 10) continue;
      rows.push({
        id: plan.id,
        label: cat.name + " " + plan.name,
        sublabel: "Margin " + margin.toFixed(1) + "%",
        value: formatCurrency(plan.price),
        href: "/admin/pricing",
        tone: "warning",
      });
    }
  }
  return rows.slice(0, 5);
}

function buildProviderRows(providers: Provider[]): DashboardSlices["providerRows"] {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    successRate: p.successRate,
    healthStatus: String(p.healthStatus),
  }));
}

function buildProviderDegradedRows(
  providers: Provider[]
): ListPanelRow[] {
  return providers
    .filter((p) => p.healthStatus !== "unknown" && p.healthStatus !== "healthy")
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      label: p.name,
      sublabel: p.successRate.toFixed(1) + "% success rate",
      value: p.healthStatus === "critical" ? "Critical" : "Warning",
      href: "/admin/providers/" + p.id,
      tone: p.healthStatus === "critical" ? "danger" : "warning",
    }));
}

export function buildDashboardSlices(input: {
  orders: Order[];
  refunds: Refund[];
  resellers: Reseller[];
  merchants: { id: string; businessName: string }[];
  providers: Provider[];
  catalog: ServiceCategory[];
  audit: AuditEntry[];
  merchantMoneyStore: MerchantMoneyStoreState;
  resellerWalletState: ResellerWalletStoreState;
  nowMs: number;
}): DashboardSlices {
  const merchantsById = new Map<string, string>();
  for (const m of input.merchants) merchantsById.set(m.id, m.businessName);

  return {
    revenueTrend: buildRevenueTrend(input.orders, input.nowMs),
    ordersTrend: buildOrdersTrend(input.orders),
    orderStatusBreakdown: buildOrderStatusBreakdown(input.orders),
    providerRows: buildProviderRows(input.providers),
    walletRollup: buildWalletRollup(
      input.merchantMoneyStore,
      input.resellerWalletState
    ),
    storefrontStatus: buildStorefrontStatus(input.resellers),
    categoryMix: buildCategoryMix(input.catalog),
    recentOrders: buildRecentOrders(input.orders, input.nowMs),
    recentRefunds: buildRecentRefunds(input.refunds, input.nowMs),
    withdrawalQueue: buildWithdrawalQueue(
      input.merchantMoneyStore,
      merchantsById
    ),
    verificationQueue: buildVerificationQueue(input.resellers),
    catalogChanges: buildCatalogChanges(input.audit, input.nowMs),
    lowMarginPlans: buildLowMarginPlans(input.catalog),
    providerDegradedRows: buildProviderDegradedRows(input.providers),
  };
}