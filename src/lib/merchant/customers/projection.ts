import type { CustomerOrder } from "@/contexts/orders-context";
import type {
  CustomerFilterState,
  CustomerReport,
  CustomerSegment,
  CustomerSortKey,
  CustomerSummarySnapshot,
  MerchantCustomerView,
} from "./types";
import {
  RETURNING_MIN_ORDERS,
  VIP_ORDER_THRESHOLD,
  VIP_SPEND_THRESHOLD,
} from "./constants";

export interface ProjectableCustomer {
  id: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  status: "Active" | "Inactive";
  createdAt: number;
}

function displayNameFor(customer: ProjectableCustomer): string {
  const explicit = (customer.name ?? "").trim();
  if (explicit.length > 0) return explicit;
  const local = customer.email.split("@")[0] ?? "";
  return local.length > 0 ? local : "Customer";
}

function segmentFor(orderCount: number, totalSpent: number): CustomerSegment {
  if (
    orderCount >= VIP_ORDER_THRESHOLD ||
    totalSpent >= VIP_SPEND_THRESHOLD
  ) {
    return "vip";
  }
  if (orderCount >= RETURNING_MIN_ORDERS) return "returning";
  return "new";
}

interface CustomerOrderStats {
  orderCount: number;
  totalSpent: number;
  firstOrderAt: number | null;
  lastOrderAt: number | null;
}

function statsFor(
  customerEmail: string,
  orders: CustomerOrder[]
): CustomerOrderStats {
  let orderCount = 0;
  let totalSpent = 0;
  let firstOrderAt: number | null = null;
  let lastOrderAt: number | null = null;
  const email = customerEmail.toLowerCase();
  for (const order of orders) {
    if (order.customerEmail.toLowerCase() !== email) continue;
    orderCount += 1;
    if (order.status !== "cancelled") {
      totalSpent += Number.isFinite(order.total) ? order.total : 0;
    }
    if (firstOrderAt === null || order.createdAt < firstOrderAt) {
      firstOrderAt = order.createdAt;
    }
    if (lastOrderAt === null || order.createdAt > lastOrderAt) {
      lastOrderAt = order.createdAt;
    }
  }
  return { orderCount, totalSpent, firstOrderAt, lastOrderAt };
}

export function projectCustomerView(
  customer: ProjectableCustomer,
  orders: CustomerOrder[],
  activeReport: CustomerReport | null
): MerchantCustomerView {
  const stats = statsFor(customer.email, orders);
  return {
    id: customer.id,
    storeSlug: customer.storeSlug,
    name: displayNameFor(customer),
    email: customer.email,
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    region: customer.region ?? "",
    status: customer.status,
    createdAt: customer.createdAt,
    orderCount: stats.orderCount,
    totalSpent: stats.totalSpent,
    firstOrderAt: stats.firstOrderAt,
    lastOrderAt: stats.lastOrderAt,
    segment: segmentFor(stats.orderCount, stats.totalSpent),
    hasActiveReport: activeReport !== null,
    activeReport,
  };
}

function normaliseDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function matchesSearch(
  view: MerchantCustomerView,
  term: string,
  orderNumbersByEmail: Map<string, string[]>
): boolean {
  const trimmed = term.trim();
  if (trimmed.length === 0) return true;
  const t = trimmed.toLowerCase();
  if (view.name.toLowerCase().includes(t)) return true;
  if (view.email.toLowerCase().includes(t)) return true;
  const tDigits = normaliseDigits(trimmed);
  if (tDigits.length > 0) {
    const phoneDigits = normaliseDigits(view.phone);
    if (phoneDigits.length > 0 && phoneDigits.includes(tDigits)) return true;
  }
  const orderNumbers = orderNumbersByEmail.get(view.email.toLowerCase());
  if (orderNumbers) {
    for (const num of orderNumbers) {
      if (num.toLowerCase().includes(t)) return true;
    }
  }
  return false;
}

function sortViews(
  views: MerchantCustomerView[],
  key: CustomerSortKey
): MerchantCustomerView[] {
  const next = views.slice();
  switch (key) {
    case "recent_activity":
      return next.sort((a, b) => {
        const av = a.lastOrderAt ?? a.createdAt;
        const bv = b.lastOrderAt ?? b.createdAt;
        return bv - av;
      });
    case "orders_desc":
      return next.sort((a, b) => b.orderCount - a.orderCount);
    case "spend_desc":
      return next.sort((a, b) => b.totalSpent - a.totalSpent);
    case "name_asc":
      return next.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    case "oldest_customer":
      return next.sort((a, b) => a.createdAt - b.createdAt);
  }
}

export function startOfMonthMs(nowMs: number): number {
  const d = new Date(nowMs);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function summarizeCustomers(
  views: MerchantCustomerView[],
  nowMs: number
): CustomerSummarySnapshot {
  const monthStart = startOfMonthMs(nowMs);
  let newCount = 0;
  let returningCount = 0;
  let vipCount = 0;
  let newThisMonthCount = 0;
  for (const v of views) {
    if (v.segment === "new") newCount += 1;
    else if (v.segment === "returning") returningCount += 1;
    else if (v.segment === "vip") vipCount += 1;
    if (v.firstOrderAt !== null && v.firstOrderAt >= monthStart) {
      newThisMonthCount += 1;
    }
  }
  return {
    totalCustomers: views.length,
    newCount,
    returningCount,
    vipCount,
    newThisMonthCount,
  };
}

export interface ProjectCustomersInput {
  customers: ProjectableCustomer[];
  orders: CustomerOrder[];
  reports: CustomerReport[];
  filters: CustomerFilterState;
  nowMs: number;
}

export interface ProjectedCustomers {
  rows: MerchantCustomerView[];
  summary: CustomerSummarySnapshot;
  appliedFiltersActive: boolean;
}

export function projectCustomers(
  input: ProjectCustomersInput
): ProjectedCustomers {
  const { customers, orders, reports, filters, nowMs } = input;

  const activeReportsByEmail = new Map<string, CustomerReport>();
  for (const r of reports) {
    if (r.status !== "submitted") continue;
    activeReportsByEmail.set(r.customerEmail.toLowerCase(), r);
  }

  const orderNumbersByEmail = new Map<string, string[]>();
  for (const o of orders) {
    const key = o.customerEmail.toLowerCase();
    const list = orderNumbersByEmail.get(key) ?? [];
    list.push(o.orderNumber);
    orderNumbersByEmail.set(key, list);
  }

  const views = customers.map((c) =>
    projectCustomerView(
      c,
      orders,
      activeReportsByEmail.get(c.email.toLowerCase()) ?? null
    )
  );

  const summary = summarizeCustomers(views, nowMs);

  const filtered = views.filter((v) => {
    if (!matchesSearch(v, filters.search, orderNumbersByEmail)) return false;
    if (filters.segment !== "All" && v.segment !== filters.segment) {
      return false;
    }
    return true;
  });

  const rows = sortViews(filtered, filters.sort);

  const appliedFiltersActive =
    filters.search.trim().length > 0 || filters.segment !== "All";

  return { rows, summary, appliedFiltersActive };
}