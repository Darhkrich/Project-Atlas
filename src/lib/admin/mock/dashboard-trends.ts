// lib/admin/mock/dashboard-trends.ts

export const dashboardTrends = {
  totalRevenue: 12.5,
  todayRevenue: 8.2,
  activeUsers: 5.6,
  transactions: 4.4,
  pendingRefunds: -3.1,
  supportTickets: -2.8,
  servicePerformance: 1.2,
  walletLiability: 4.7,
  liveStores: 6.3,
  failedLogins: -14.0,
  blockedIPs: 8.3,
  lockedAccounts: -50.0,
  providerHealth: -1.4,
  healthyProviders: -1.1,
  totalUsers: 5.6,
} as const;

export type DashboardTrendKey = keyof typeof dashboardTrends;