export interface OrderAnalyticsData {
  kpis: {
    totalOrdersToday: number;
    avgOrderValue: number;
    successRate: number;
    failedOrdersToday: number;
    sparklineData: { time: string; value: number }[];
  };
  trend: {
    range: "today" | "7d" | "30d";
    data: { date: string; orders: number; revenue: number }[];
  };
  statusDistribution: { name: string; value: number; color: string }[];
  servicePerformance: {
    service: string;
    orders: number;
    revenue: number;
    successRate: number;
    failureRate: number;
  }[];
  networkSuccess: { network: string; successRate: number; orders: number }[];
  failureReasons: { reason: string; count: number }[];
}

export const mockOrderAnalytics: OrderAnalyticsData = {
  kpis: {
    totalOrdersToday: 156,
    avgOrderValue: 45.2,
    successRate: 96.5,
    failedOrdersToday: 8,
    sparklineData: [
      { time: "08:00", value: 12 },
      { time: "10:00", value: 28 },
      { time: "12:00", value: 40 },
      { time: "14:00", value: 35 },
      { time: "16:00", value: 25 },
      { time: "18:00", value: 16 },
    ],
  },
  trend: {
    range: "today",
    data: [
      { date: "08:00", orders: 12, revenue: 540 },
      { date: "10:00", orders: 28, revenue: 1120 },
      { date: "12:00", orders: 40, revenue: 1700 },
      { date: "14:00", orders: 35, revenue: 1480 },
      { date: "16:00", orders: 25, revenue: 1050 },
      { date: "18:00", orders: 16, revenue: 680 },
    ],
  },
  statusDistribution: [
    { name: "Successful", value: 142, color: "#22c55e" },
    { name: "Failed", value: 8, color: "#ef4444" },
    { name: "Cancelled", value: 4, color: "#8a8881" },
    { name: "Refunded", value: 2, color: "#f59e0b" },
  ],
  servicePerformance: [
    { service: "MTN Data", orders: 420, revenue: 84000, successRate: 98, failureRate: 2 },
    { service: "Airtime", orders: 380, revenue: 19000, successRate: 99, failureRate: 1 },
    { service: "ECG", orders: 150, revenue: 30000, successRate: 95, failureRate: 5 },
    { service: "DSTV", orders: 90, revenue: 27000, successRate: 97, failureRate: 3 },
    { service: "WAEC", orders: 60, revenue: 12000, successRate: 92, failureRate: 8 },
  ],
  networkSuccess: [
    { network: "MTN", successRate: 98, orders: 500 },
    { network: "Telecel", successRate: 95, orders: 250 },
    { network: "AirtelTigo", successRate: 93, orders: 200 },
    { network: "ECG", successRate: 95, orders: 150 },
    { network: "DSTV", successRate: 97, orders: 90 },
  ],
  failureReasons: [
    { reason: "Provider timeout", count: 3 },
    { reason: "Insufficient funds", count: 2 },
    { reason: "Invalid account", count: 1 },
    { reason: "Network error", count: 1 },
    { reason: "User cancelled", count: 1 },
  ],
};