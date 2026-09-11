import type {
  AnalyticsSummary,
  RevenueTrendPoint,
  OrderVolumePoint,
  UserGrowthPoint,
  ServiceDistribution,
  FunnelStage,
  HeatmapData,
  CohortData,
} from "../types/analytics";

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalRevenue: 1250450,
  totalOrders: 8420,
  activeUsers: 13322,
  successRate: 96.5,
  avgOrderValue: 148.5,
  comparison: {
    totalRevenue: 8.5,
    totalOrders: 5.2,
    activeUsers: 2.1,
    successRate: 0.4,
    avgOrderValue: 1.8,
  },
};

export const mockRevenueTrend: RevenueTrendPoint[] = [
  { date: "Jan", revenue: 120000 },
  { date: "Feb", revenue: 130000 },
  { date: "Mar", revenue: 155000 },
  { date: "Apr", revenue: 170000 },
  { date: "May", revenue: 185000 },
  { date: "Jun", revenue: 200000 },
  { date: "Jul", revenue: 220000 },
  { date: "Aug", revenue: 210000 },
  { date: "Sep", revenue: 230000 },
  { date: "Oct", revenue: 240000 },
  { date: "Nov", revenue: 250000 },
  { date: "Dec", revenue: 260000 },
];

export const mockOrderVolume: OrderVolumePoint[] = [
  { date: "Jan", orders: 600 },
  { date: "Feb", orders: 650 },
  { date: "Mar", orders: 700 },
  { date: "Apr", orders: 680 },
  { date: "May", orders: 750 },
  { date: "Jun", orders: 800 },
  { date: "Jul", orders: 850 },
  { date: "Aug", orders: 820 },
  { date: "Sep", orders: 900 },
  { date: "Oct", orders: 920 },
  { date: "Nov", orders: 950 },
  { date: "Dec", orders: 980 },
];

export const mockUserGrowth: UserGrowthPoint[] = [
  { month: "Jan", users: 8000 },
  { month: "Feb", users: 8500 },
  { month: "Mar", users: 9200 },
  { month: "Apr", users: 9800 },
  { month: "May", users: 10500 },
  { month: "Jun", users: 11200 },
  { month: "Jul", users: 12000 },
  { month: "Aug", users: 12600 },
  { month: "Sep", users: 12800 },
  { month: "Oct", users: 13000 },
  { month: "Nov", users: 13200 },
  { month: "Dec", users: 13322 },
];

export const mockServiceDistribution: ServiceDistribution[] = [
  { service: "Data", count: 4200 },
  { service: "Airtime", count: 2800 },
  { service: "Bills", count: 900 },
  { service: "TV", count: 350 },
  { service: "Exam Pins", count: 170 },
];

export const mockFunnelData: FunnelStage[] = [
  { stage: "Orders Placed", value: 8420 },
  { stage: "Payment Successful", value: 8120 },
  { stage: "Provider Fulfilled", value: 7890 },
  { stage: "Delivered", value: 7500 },
];

export const mockHeatmapData: HeatmapData[] = [
  { day: "Mon", hour: "08", value: 120 },
  { day: "Mon", hour: "12", value: 250 },
  { day: "Mon", hour: "18", value: 300 },
  { day: "Tue", hour: "09", value: 150 },
  { day: "Tue", hour: "14", value: 280 },
  { day: "Tue", hour: "20", value: 220 },
  { day: "Wed", hour: "10", value: 180 },
  { day: "Wed", hour: "16", value: 310 },
  { day: "Thu", hour: "11", value: 200 },
  { day: "Thu", hour: "17", value: 270 },
  { day: "Fri", hour: "12", value: 260 },
  { day: "Fri", hour: "19", value: 190 },
];

export const mockCohortData: CohortData[] = [
  { cohort: "Jan", month0: 100, month1: 90, month2: 80, month3: 70 },
  { cohort: "Feb", month0: 120, month1: 110, month2: 100, month3: 85 },
  { cohort: "Mar", month0: 140, month1: 130, month2: 120, month3: 110 },
  { cohort: "Apr", month0: 160, month1: 150, month2: 140, month3: 130 },
];