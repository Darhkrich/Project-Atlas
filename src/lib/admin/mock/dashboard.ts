// lib/admin/mock/dashboard.ts

import type { DashboardData } from "@/lib/admin/types/dashboard";
import type { DashboardData } from "@/lib/admin/types/dashboard";

export { dashboardTrends } from "./dashboard-trends";
export type { DashboardTrendKey } from "./dashboard-trends";

export const mockDashboardData: DashboardData = {

  totalRevenue: {
    total: 1250450,
    breakdown: { ecommerce: 480200, reseller: 520150, digitalServices: 250100 },
    trend: 12.5,
  },
  todayRevenue: {
    total: 45230,
    breakdown: { ecommerce: 15200, reseller: 18030, digitalServices: 12000 },
    trend: 8.2,
  },
  activeUsers: {
    total: 13322,
    resellers: 342,
    customers: 12980,
    merchants: 0,
  },
  totalUsers: {
    total: 13322,
    resellers: 342,
    customers: 12980,
    merchants: 0,
  },
  transactions: {
    pending: {
      total: 23,
      breakdown: { ecommerce: 5, reseller: 12, digitalServices: 6 },
    },
    failed: {
      total: 8,
      breakdown: { ecommerce: 2, reseller: 4, digitalServices: 2 },
    },
  },
  cyber: {
    threatLevel: "normal",
    attacks24h: 2,
    apisBlocked24h: 5,
    attackTrend: [1, 0, 3, 2, 1, 0, 2],
  },
  serverHealth: {
    overallUptime: 99.98,
    components: [
      { name: "API Gateway", uptime: 99.99, status: "operational" },
      { name: "Payment Gateway", uptime: 100, status: "operational" },
      { name: "Database", uptime: 99.95, status: "operational" },
      { name: "Queue System", uptime: 99.8, status: "degraded" },
      { name: "MTN Provider", uptime: 98.5, status: "degraded" },
      { name: "ECG Provider", uptime: 99.2, status: "operational" },
    ],
  },
  totalAccounts: {
    total: 13322,
    resellers: 342,
    customers: 12980,
    merchants: 0,
  },
  liveStores: {
    resellerStorefronts: 210,
    merchantStores: 0,
  },
  pendingRefunds: {
    total: 12,
    breakdown: { ecommerce: 4, reseller: 6, digitalServices: 2 },
  },
  supportTickets: {
    totalOpen: 31,
    open: 18,
    pending: 8,
    urgent: 5,
    resolvedToday: 14,
  },
  revenueByStreamSeries: [
    { month: "Jan", ecommerce: 40000, reseller: 50000, digitalServices: 30000 },
    { month: "Feb", ecommerce: 45000, reseller: 52000, digitalServices: 32000 },
    { month: "Mar", ecommerce: 48000, reseller: 55000, digitalServices: 34000 },
    { month: "Apr", ecommerce: 50000, reseller: 58000, digitalServices: 36000 },
    { month: "May", ecommerce: 52000, reseller: 60000, digitalServices: 38000 },
    { month: "Jun", ecommerce: 55000, reseller: 62000, digitalServices: 40000 },
    { month: "Jul", ecommerce: 58000, reseller: 65000, digitalServices: 42000 },
    { month: "Aug", ecommerce: 60000, reseller: 68000, digitalServices: 44000 },
    { month: "Sep", ecommerce: 62000, reseller: 70000, digitalServices: 46000 },
    { month: "Oct", ecommerce: 65000, reseller: 72000, digitalServices: 48000 },
    { month: "Nov", ecommerce: 68000, reseller: 75000, digitalServices: 50000 },
    { month: "Dec", ecommerce: 70000, reseller: 78000, digitalServices: 52000 },
  ],
  todayHourlyRevenue: [
    { hour: "00", revenue: 1200 },
    { hour: "04", revenue: 2400 },
    { hour: "08", revenue: 5100 },
    { hour: "12", revenue: 8300 },
    { hour: "16", revenue: 10400 },
    { hour: "20", revenue: 13200 },
  ],
  activeUsersDistribution: [
    { name: "Resellers", value: 342 },
    { name: "Customers", value: 12980 },
    { name: "Merchants", value: 0 },
  ],
  transactionStatusData: [
    { name: "Pending", ecommerce: 5, reseller: 12, digitalServices: 6 },
    { name: "Failed", ecommerce: 2, reseller: 4, digitalServices: 2 },
  ],
  accountDistribution: [
    { name: "Resellers", value: 342 },
    { name: "Customers", value: 12980 },
    { name: "Merchants", value: 0 },
  ],
  liveStoresData: [
    { name: "Reseller Storefronts", value: 210 },
    { name: "Merchant Stores", value: 0 },
  ],
  refundBreakdown: [
    { name: "E-commerce", value: 4 },
    { name: "Resellers", value: 6 },
    { name: "Digital Services", value: 2 },
  ],
  supportTicketBreakdown: [
    { name: "Open", value: 18 },
    { name: "Pending", value: 8 },
    { name: "Urgent", value: 5 },
  ],
  servicePerformance: [
    {
      service: "MTN Data",
      orders: 420,
      revenue: 84000,
      successRate: 98,
      failureRate: 2,
      status: "operational",
    },
    {
      service: "Airtime",
      orders: 380,
      revenue: 19000,
      successRate: 99,
      failureRate: 1,
      status: "operational",
    },
    {
      service: "ECG",
      orders: 150,
      revenue: 30000,
      successRate: 95,
      failureRate: 5,
      status: "degraded",
    },
    {
      service: "DSTV",
      orders: 90,
      revenue: 27000,
      successRate: 97,
      failureRate: 3,
      status: "operational",
    },
    {
      service: "WAEC",
      orders: 60,
      revenue: 12000,
      successRate: 92,
      failureRate: 8,
      status: "degraded",
    },
  ],
  walletBalance: {
    total: 250000,
    resellerWallets: 180000,
    customerWallets: 60000,
    merchantWallets: 10000,
    series: [
      { month: "Jan", total: 210000, reseller: 150000, customer: 50000, merchant: 10000 },
      { month: "Feb", total: 215000, reseller: 155000, customer: 51000, merchant: 9000 },
      { month: "Mar", total: 220000, reseller: 160000, customer: 52000, merchant: 8000 },
      { month: "Apr", total: 230000, reseller: 165000, customer: 54000, merchant: 11000 },
      { month: "May", total: 235000, reseller: 170000, customer: 55000, merchant: 10000 },
      { month: "Jun", total: 245000, reseller: 175000, customer: 58000, merchant: 12000 },
      { month: "Jul", total: 240000, reseller: 172000, customer: 56000, merchant: 12000 },
      { month: "Aug", total: 250000, reseller: 180000, customer: 60000, merchant: 10000 },
    ],
  },
  paymentMethodDistribution: [
    { method: "Mobile Money", value: 45 },
    { method: "Wallet", value: 30 },
    { method: "Card", value: 15 },
    { method: "Bank", value: 10 },
  ],
  topPerformers: {
    resellers: [
      { name: "Kwame Store", revenue: 45000, trend: 12 },
      { name: "Adjoa Ventures", revenue: 38000, trend: 8 },
      { name: "Yaw Enterprises", revenue: 32000, trend: -3 },
      { name: "Efua Trading", revenue: 28000, trend: 5 },
      { name: "Kojo & Sons", revenue: 25000, trend: 10 },
    ],
    merchants: [
      { name: "TechHub", revenue: 22000, trend: 15 },
      { name: "FashionPlus", revenue: 19000, trend: -2 },
      { name: "HomeEssentials", revenue: 16000, trend: 7 },
      { name: "GadgetWorld", revenue: 14000, trend: 4 },
      { name: "BeautyCorner", revenue: 12000, trend: 9 },
    ],
  },
  recentEvents: [
    { id: "EVT-001", timestamp: "2025-03-03T10:30:00Z", actor: "admin@atlas.com", action: "Adjusted wallet", resource: "Reseller #342" },
    { id: "EVT-002", timestamp: "2025-03-03T09:15:00Z", actor: "ops@atlas.com", action: "Approved refund", resource: "Order #ATX-983821" },
    { id: "EVT-003", timestamp: "2025-03-03T08:45:00Z", actor: "security@atlas.com", action: "Blocked API", resource: "Provider MTN" },
    { id: "EVT-004", timestamp: "2025-03-02T22:10:00Z", actor: "admin@atlas.com", action: "Changed pricing", resource: "Data Plan 1GB" },
    { id: "EVT-005", timestamp: "2025-03-02T20:00:00Z", actor: "support@atlas.com", action: "Resolved ticket", resource: "Ticket #456" },
  ],
};

/* ---------------------- Revenue series by range ----------------------- */

export type RevenueRange = "today" | "7d" | "30d" | "12m";
export type TodayRevenueRange = "today" | "7d" | "30d";

export interface RevenuePoint {
  date: string;
  ecommerce: number;
  reseller: number;
  digitalServices: number;
}

export const revenueSeries: Record<RevenueRange, RevenuePoint[]> = {
  today: [
    { date: "00:00", ecommerce: 1200, reseller: 900, digitalServices: 500 },
    { date: "04:00", ecommerce: 2400, reseller: 1800, digitalServices: 1100 },
    { date: "08:00", ecommerce: 5100, reseller: 3400, digitalServices: 2100 },
    { date: "12:00", ecommerce: 8300, reseller: 5600, digitalServices: 3200 },
    { date: "16:00", ecommerce: 10400, reseller: 7200, digitalServices: 4100 },
    { date: "20:00", ecommerce: 13200, reseller: 8900, digitalServices: 5000 },
  ],
  "7d": [
    { date: "Mon", ecommerce: 18000, reseller: 15000, digitalServices: 8000 },
    { date: "Tue", ecommerce: 22000, reseller: 17000, digitalServices: 9500 },
    { date: "Wed", ecommerce: 25000, reseller: 19000, digitalServices: 10200 },
    { date: "Thu", ecommerce: 23000, reseller: 18000, digitalServices: 9800 },
    { date: "Fri", ecommerce: 28000, reseller: 20000, digitalServices: 12000 },
    { date: "Sat", ecommerce: 30000, reseller: 21000, digitalServices: 13000 },
    { date: "Sun", ecommerce: 32000, reseller: 23000, digitalServices: 14000 },
  ],
  "30d": [
    { date: "Week 1", ecommerce: 120000, reseller: 105000, digitalServices: 60000 },
    { date: "Week 2", ecommerce: 140000, reseller: 115000, digitalServices: 68000 },
    { date: "Week 3", ecommerce: 150000, reseller: 125000, digitalServices: 73000 },
    { date: "Week 4", ecommerce: 168000, reseller: 135000, digitalServices: 80000 },
  ],
  "12m": [
    { date: "Jan", ecommerce: 40000, reseller: 50000, digitalServices: 30000 },
    { date: "Feb", ecommerce: 45000, reseller: 52000, digitalServices: 32000 },
    { date: "Mar", ecommerce: 48000, reseller: 55000, digitalServices: 34000 },
    { date: "Apr", ecommerce: 50000, reseller: 58000, digitalServices: 36000 },
    { date: "May", ecommerce: 52000, reseller: 60000, digitalServices: 38000 },
    { date: "Jun", ecommerce: 55000, reseller: 62000, digitalServices: 40000 },
    { date: "Jul", ecommerce: 58000, reseller: 65000, digitalServices: 42000 },
    { date: "Aug", ecommerce: 60000, reseller: 68000, digitalServices: 44000 },
    { date: "Sep", ecommerce: 62000, reseller: 70000, digitalServices: 46000 },
    { date: "Oct", ecommerce: 65000, reseller: 72000, digitalServices: 48000 },
    { date: "Nov", ecommerce: 68000, reseller: 75000, digitalServices: 50000 },
    { date: "Dec", ecommerce: 70000, reseller: 78000, digitalServices: 52000 },
  ],
};

export const todayRevenueSeries: Record<TodayRevenueRange, RevenuePoint[]> = {
  today: [
    { date: "00:00", ecommerce: 1200, reseller: 900, digitalServices: 500 },
    { date: "04:00", ecommerce: 2400, reseller: 1800, digitalServices: 1100 },
    { date: "08:00", ecommerce: 5100, reseller: 3400, digitalServices: 2100 },
    { date: "12:00", ecommerce: 8300, reseller: 5600, digitalServices: 3200 },
    { date: "16:00", ecommerce: 10400, reseller: 7200, digitalServices: 4100 },
    { date: "20:00", ecommerce: 13200, reseller: 8900, digitalServices: 5000 },
  ],
  "7d": [
    { date: "Mon", ecommerce: 2800, reseller: 2100, digitalServices: 1200 },
    { date: "Tue", ecommerce: 3200, reseller: 2400, digitalServices: 1400 },
    { date: "Wed", ecommerce: 3600, reseller: 2700, digitalServices: 1600 },
    { date: "Thu", ecommerce: 3100, reseller: 2300, digitalServices: 1300 },
    { date: "Fri", ecommerce: 4100, reseller: 3000, digitalServices: 1800 },
    { date: "Sat", ecommerce: 4400, reseller: 3200, digitalServices: 1900 },
    { date: "Sun", ecommerce: 4700, reseller: 3400, digitalServices: 2000 },
  ],
  "30d": [
    { date: "Week 1", ecommerce: 22000, reseller: 18000, digitalServices: 11000 },
    { date: "Week 2", ecommerce: 24000, reseller: 19500, digitalServices: 12000 },
    { date: "Week 3", ecommerce: 26000, reseller: 21000, digitalServices: 13000 },
    { date: "Week 4", ecommerce: 28000, reseller: 22500, digitalServices: 14000 },
  ],
};