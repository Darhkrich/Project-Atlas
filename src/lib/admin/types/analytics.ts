export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  successRate: number;
  avgOrderValue: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface OrderVolumePoint {
  date: string;
  orders: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface ServiceDistribution {
  service: string;
  count: number;
}