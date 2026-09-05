/* eslint-disable @typescript-eslint/no-empty-object-type */
export type ThreatLevel = "normal" | "warning" | "critical";
export type ComponentStatus = "operational" | "degraded" | "down";




export interface RevenueBreakdown {
  ecommerce: number;
  reseller: number;
  digitalServices: number;
}

export interface TransactionBreakdown extends RevenueBreakdown {}

export interface ServerComponent {
  name: string;
  uptime: number;
  status: ComponentStatus;
}

export interface RevenueStreamPoint {
  month: string;
  ecommerce: number;
  reseller: number;
  digitalServices: number;
}

export interface HourlyRevenue {
  hour: string;
  revenue: number;
}

export interface DashboardData {
  [x: string]: any;
  [x: string]: any;
  servicePerformance: any;
  totalRevenue: { total: number; breakdown: RevenueBreakdown; trend: number };
  todayRevenue: { total: number; breakdown: RevenueBreakdown; trend: number };
  activeUsers: { total: number; resellers: number; customers: number; merchants: number };
  transactions: {
    pending: { total: number; breakdown: TransactionBreakdown };
    failed: { total: number; breakdown: TransactionBreakdown };
  };
  cyber: {
    threatLevel: ThreatLevel;
    attacks24h: number;
    apisBlocked24h: number;
    attackTrend: number[];
  };
  serverHealth: {
    overallUptime: number;
    components: ServerComponent[];
  };
  totalAccounts: { total: number; resellers: number; customers: number; merchants: number };
  totalUsers: { total: number; resellers: number; customers: number; merchants: number }; // ADD THIS
  liveStores: { resellerStorefronts: number; merchantStores: number };
  pendingRefunds: { total: number; breakdown: RevenueBreakdown };
  supportTickets: { totalOpen: number; open: number; pending: number; urgent: number; resolvedToday: number };
  revenueByStreamSeries: RevenueStreamPoint[];
  todayHourlyRevenue: HourlyRevenue[];
  activeUsersDistribution: { name: string; value: number }[];
  transactionStatusData: { name: string; ecommerce: number; reseller: number; digitalServices: number }[];
  accountDistribution: { name: string; value: number }[];
  liveStoresData: { name: string; value: number }[];
  refundBreakdown: { name: string; value: number }[];
  supportTicketBreakdown: { name: string; value: number }[];
}