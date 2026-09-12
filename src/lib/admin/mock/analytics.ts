// lib/admin/mock/analytics.ts

import type {
  AnalyticsSummary,
  CohortData,
  FailureReasonRow,
  FunnelStage,
  HeatmapData,
  OrderVolumePoint,
  PaymentMethodRow,
  ProviderPerformanceRow,
  RevenueTrendPoint,
  SectionBreakdownRow,
  ServiceDistribution,
  TopMerchantRow,
  TopResellerRow,
  TopServiceRow,
  UserGrowthPoint,
} from "../types/analytics";

/* ------------------------------ generators ------------------------------ */

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const DAY = 86_400_000;

function generateSeries(
  days: number,
  baseValue: number,
  dailyGrowth: number,
  weekendFactor: number
): { date: string; value: number }[] {
  const rng = makeRng(1337);
  const out: { date: string; value: number }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    const progress = days - i;
    const trend = baseValue + progress * dailyGrowth;
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6 ? weekendFactor : 1;
    const noise = 0.85 + rng() * 0.3;
    out.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(trend * weekend * noise),
    });
  }

  return out;
}

const revenueRaw = generateSeries(365, 2_700, 5, 0.72);
const orderRaw = generateSeries(365, 20, 0.03, 0.78);

/* ------------------------------ summary -------------------------------- */

const last30Revenue = revenueRaw.slice(-30).reduce((s, p) => s + p.value, 0);
const prior30Revenue = revenueRaw
  .slice(-60, -30)
  .reduce((s, p) => s + p.value, 0);
const last30Orders = orderRaw.slice(-30).reduce((s, p) => s + p.value, 0);
const prior30Orders = orderRaw
  .slice(-60, -30)
  .reduce((s, p) => s + p.value, 0);

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalRevenue: last30Revenue,
  totalOrders: last30Orders,
  activeUsers: 13_322,
  successRate: 96.5,
  avgOrderValue:
    last30Orders > 0 ? Math.round((last30Revenue / last30Orders) * 10) / 10 : 0,
  comparison: {
    totalRevenue:
      prior30Revenue > 0
        ? ((last30Revenue - prior30Revenue) / prior30Revenue) * 100
        : 0,
    totalOrders:
      prior30Orders > 0
        ? ((last30Orders - prior30Orders) / prior30Orders) * 100
        : 0,
    activeUsers: 2.1,
    successRate: 0.4,
    avgOrderValue: 1.8,
  },
};

/* ------------------------------ series --------------------------------- */

export const mockRevenueSeries: RevenueTrendPoint[] = revenueRaw.map((p) => ({
  date: p.date,
  revenue: p.value,
}));

export const mockOrderSeries: OrderVolumePoint[] = orderRaw.map((p) => ({
  date: p.date,
  orders: p.value,
}));

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

/* ------------------------------ distributions -------------------------- */

export const mockServiceDistribution: ServiceDistribution[] = [
  { service: "Data", count: 4200 },
  { service: "Airtime", count: 2800 },
  { service: "Bills", count: 900 },
  { service: "TV", count: 350 },
  { service: "Exam pins", count: 170 },
];

export const mockFunnelData: FunnelStage[] = [
  { stage: "Orders placed", value: 8420 },
  { stage: "Payment successful", value: 8120 },
  { stage: "Provider fulfilled", value: 7890 },
  { stage: "Delivered", value: 7500 },
];

export const mockHeatmapData: HeatmapData[] = [
  { day: "Mon", hour: "08", value: 120 },
  { day: "Mon", hour: "12", value: 250 },
  { day: "Mon", hour: "16", value: 300 },
  { day: "Mon", hour: "20", value: 180 },
  { day: "Tue", hour: "08", value: 140 },
  { day: "Tue", hour: "12", value: 260 },
  { day: "Tue", hour: "16", value: 290 },
  { day: "Tue", hour: "20", value: 200 },
  { day: "Wed", hour: "08", value: 150 },
  { day: "Wed", hour: "12", value: 280 },
  { day: "Wed", hour: "16", value: 310 },
  { day: "Wed", hour: "20", value: 210 },
  { day: "Thu", hour: "08", value: 160 },
  { day: "Thu", hour: "12", value: 270 },
  { day: "Thu", hour: "16", value: 300 },
  { day: "Thu", hour: "20", value: 220 },
  { day: "Fri", hour: "08", value: 130 },
  { day: "Fri", hour: "12", value: 240 },
  { day: "Fri", hour: "16", value: 280 },
  { day: "Fri", hour: "20", value: 190 },
  { day: "Sat", hour: "08", value: 90 },
  { day: "Sat", hour: "12", value: 170 },
  { day: "Sat", hour: "16", value: 200 },
  { day: "Sat", hour: "20", value: 140 },
  { day: "Sun", hour: "08", value: 80 },
  { day: "Sun", hour: "12", value: 150 },
  { day: "Sun", hour: "16", value: 180 },
  { day: "Sun", hour: "20", value: 120 },
];

export const mockCohortData: CohortData[] = [
  { cohort: "Jan", month0: 100, month1: 78, month2: 65, month3: 55 },
  { cohort: "Feb", month0: 100, month1: 81, month2: 68, month3: 58 },
  { cohort: "Mar", month0: 100, month1: 83, month2: 71, month3: 61 },
  { cohort: "Apr", month0: 100, month1: 80, month2: 67, month3: 0 },
  { cohort: "May", month0: 100, month1: 84, month2: 0, month3: 0 },
  { cohort: "Jun", month0: 100, month1: 0, month2: 0, month3: 0 },
];

/* ------------------------------ breakdowns ----------------------------- */

export const mockSectionBreakdown: SectionBreakdownRow[] = [
  {
    section: "digital_services",
    revenue: 968_500,
    orders: 6480,
    avgOrderValue: 149.5,
    successRate: 97.2,
  },
  {
    section: "resellers",
    revenue: 148_300,
    orders: 1120,
    avgOrderValue: 132.4,
    successRate: 95.1,
  },
  {
    section: "ecommerce",
    revenue: 133_650,
    orders: 820,
    avgOrderValue: 163,
    successRate: 94.6,
  },
];

export const mockProviderPerformance: ProviderPerformanceRow[] = [
  {
    providerId: "prv-001",
    providerName: "DataHub",
    transactions: 12_482,
    successRate: 99.4,
    avgResponseMs: 420,
  },
  {
    providerId: "prv-003",
    providerName: "ECG Direct",
    transactions: 2892,
    successRate: 91.6,
    avgResponseMs: 2800,
  },
  {
    providerId: "prv-004",
    providerName: "UtilityConnect",
    transactions: 3412,
    successRate: 97.5,
    avgResponseMs: 550,
  },
  {
    providerId: "prv-005",
    providerName: "WAEC Connect",
    transactions: 892,
    successRate: 0,
    avgResponseMs: 0,
  },
  {
    providerId: "prv-002",
    providerName: "PayConnect",
    transactions: 8294,
    successRate: 98.8,
    avgResponseMs: 610,
  },
];

export const mockPaymentMethodSplit: PaymentMethodRow[] = [
  { method: "Atlas wallet", volume: 612_400, share: 49 },
  { method: "Mobile money", volume: 388_200, share: 31 },
  { method: "Card", volume: 149_800, share: 12 },
  { method: "Bank transfer", volume: 62_500, share: 5 },
  { method: "Atlas points", volume: 37_550, share: 3 },
];

/* ------------------------------ top tables ----------------------------- */

export const mockTopServices: TopServiceRow[] = [
  {
    serviceId: "svc-data-mtn-5gb",
    service: "MTN Data 5GB",
    section: "digital_services",
    orders: 2140,
    revenue: 42_800,
  },
  {
    serviceId: "svc-data-telecel-10gb",
    service: "Telecel Data 10GB",
    section: "digital_services",
    orders: 1780,
    revenue: 53_400,
  },
  {
    serviceId: "svc-airtime-mtn",
    service: "MTN Airtime",
    section: "digital_services",
    orders: 1660,
    revenue: 16_600,
  },
  {
    serviceId: "svc-ecg-prepaid",
    service: "ECG Prepaid",
    section: "digital_services",
    orders: 892,
    revenue: 89_200,
  },
  {
    serviceId: "svc-waec-pin",
    service: "WAEC Result Checker",
    section: "digital_services",
    orders: 340,
    revenue: 8500,
  },
];

export const mockTopResellers: TopResellerRow[] = [
  {
    resellerId: "RS-002",
    resellerName: "Nkrumah Digital",
    tier: "Silver",
    orders: 1240,
    commissionPaid: 3968,
  },
  {
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    tier: "Gold",
    orders: 980,
    commissionPaid: 3528,
  },
  {
    resellerId: "RS-005",
    resellerName: "Accra Digital Hub",
    tier: "Gold",
    orders: 740,
    commissionPaid: 2664,
  },
  {
    resellerId: "RS-003",
    resellerName: "Gold Coast Airtime",
    tier: "Silver",
    orders: 620,
    commissionPaid: 1984,
  },
];

export const mockTopMerchants: TopMerchantRow[] = [
  {
    merchantId: "MER-001",
    merchantName: "TechHub Store",
    plan: "Growth",
    orders: 312,
    revenue: 48_900,
  },
  {
    merchantId: "MER-002",
    merchantName: "Kente Kingdom",
    plan: "Starter",
    orders: 208,
    revenue: 21_400,
  },
  {
    merchantId: "MER-003",
    merchantName: "Adinkra Apparel",
    plan: "Growth",
    orders: 176,
    revenue: 32_800,
  },
  {
    merchantId: "MER-004",
    merchantName: "Cedi Groceries",
    plan: "Starter",
    orders: 124,
    revenue: 14_200,
  },
];

export const mockFailureReasons: FailureReasonRow[] = [
  {
    reason: "Provider timeout",
    count: 210,
    section: "digital_services",
  },
  {
    reason: "Insufficient balance",
    count: 168,
    section: "digital_services",
  },
  {
    reason: "Invalid recipient number",
    count: 124,
    section: "digital_services",
  },
  {
    reason: "Merchant subscription past due",
    count: 62,
    section: "ecommerce",
  },
  {
    reason: "KYC pending",
    count: 41,
    section: "resellers",
  },
  {
    reason: "Payment method declined",
    count: 35,
    section: "ecommerce",
  },
];