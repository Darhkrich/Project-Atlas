export type RevenueStream = "digital_services" | "resellers" | "ecommerce";

export interface RevenueKpi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: any;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  avgDailyRevenue: number;
  trend: { date: string; value: number }[];
}

export interface StreamTrendPoint {
  date: string;
  digital_services: number;
  resellers: number;
  ecommerce: number;
}

export interface ServiceRevenue {
  service: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodRevenue {
  method: string;
  revenue: number;
  percentage: number;
}

export interface TopPerformerRevenue {
  id: string;
  name: string;
  type: "reseller" | "merchant";
  revenue: number;
  trend: number;
}

export interface NetworkRevenue {
  network: string;
  revenue: number;
  orders: number;
}


export interface RevenueStreamBreakdown {
  digital_services: number;
  resellers: number;
  ecommerce: number;
}

export interface RevenueKpi {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  avgDailyRevenue: number;
  totalByStream: RevenueStreamBreakdown;
  todayByStream: RevenueStreamBreakdown;
  monthByStream: RevenueStreamBreakdown;
  yearByStream: RevenueStreamBreakdown;
  avgDailyByStream: RevenueStreamBreakdown;
  trend: { date: string; value: number }[];
}


// Add these interfaces and fields

export interface ForecastPoint {
  month: string;
  actual: number;
  forecast: number;
}

export interface CustomerRevenue {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  stream: "digital_services" | "resellers" | "ecommerce";
}

export interface RegionRevenue {
  region: string;
  revenue: number;
}

export interface SourceRevenue {
  source: "direct" | "reseller" | "ecommerce";
  revenue: number;
}

export interface RefundImpact {
  totalRefunds: number;
  totalChargebacks: number;
  netRevenue: number;
  refundRate: number;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  arpuByStream: RevenueStreamBreakdown;
  forecast: ForecastPoint[];
  topCustomers: CustomerRevenue[];
  regionRevenue: RegionRevenue[];
  sourceRevenue: SourceRevenue[];
  refundImpact: RefundImpact;
  profitMarginEstimate: number; // percentage
  revenueByWeekday: { day: string; revenue: number }[];
  paymentSuccessRate: number;
}