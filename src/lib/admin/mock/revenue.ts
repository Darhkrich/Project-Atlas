import type {
  RevenueKpi,
  StreamTrendPoint,
  ServiceRevenue,
  PaymentMethodRevenue,
  TopPerformerRevenue,
  NetworkRevenue,
  RevenueMetrics,
} from "../types/revenue";

export const mockRevenueMetrics: RevenueMetrics = {
  mrr: 25000,
  arr: 300000,
  arpuByStream: {
    digital_services: 35,
    resellers: 120,
    ecommerce: 80,
  },
  forecast: [
    { month: "Jan", actual: 120000, forecast: 0 },
    { month: "Feb", actual: 130000, forecast: 0 },
    { month: "Mar", actual: 155000, forecast: 0 },
    { month: "Apr", actual: 170000, forecast: 0 },
    { month: "May", actual: 185000, forecast: 0 },
    { month: "Jun", actual: 200000, forecast: 0 },
    { month: "Jul", actual: 220000, forecast: 0 },
    { month: "Aug", actual: 210000, forecast: 0 },
    { month: "Sep", actual: 230000, forecast: 0 },
    { month: "Oct", actual: 240000, forecast: 0 },
    { month: "Nov", actual: 250000, forecast: 0 },
    { month: "Dec", actual: 260000, forecast: 0 },
    { month: "Jan (F)", actual: 0, forecast: 275000 },
    { month: "Feb (F)", actual: 0, forecast: 290000 },
    { month: "Mar (F)", actual: 0, forecast: 310000 },
  ],
  topCustomers: [
    { id: "CUST-005", name: "Yaw Boateng", revenue: 2200, orders: 30, stream: "digital_services" },
    { id: "CUST-003", name: "Efua Mensimah", revenue: 980, orders: 20, stream: "ecommerce" },
    { id: "CUST-001", name: "Ama Serwaa", revenue: 480, orders: 12, stream: "digital_services" },
    { id: "CUST-002", name: "Kojo Appiah", revenue: 320, orders: 8, stream: "resellers" },
    { id: "CUST-006", name: "Nana Kofi", revenue: 280, orders: 7, stream: "ecommerce" },
  ],
  regionRevenue: [
    { region: "Greater Accra", revenue: 450000 },
    { region: "Ashanti", revenue: 300000 },
    { region: "Central", revenue: 150000 },
    { region: "Western", revenue: 120000 },
    { region: "Eastern", revenue: 100000 },
    { region: "Northern", revenue: 80450 },
  ],
  sourceRevenue: [
    { source: "direct", revenue: 400000 },
    { source: "reseller", revenue: 500000 },
    { source: "ecommerce", revenue: 350450 },
  ],
  refundImpact: {
    totalRefunds: 45000,
    totalChargebacks: 12000,
    netRevenue: 1193450,
    refundRate: 3.6,
  },
  profitMarginEstimate: 42,
  revenueByWeekday: [
    { day: "Mon", revenue: 180000 },
    { day: "Tue", revenue: 190000 },
    { day: "Wed", revenue: 200000 },
    { day: "Thu", revenue: 195000 },
    { day: "Fri", revenue: 210000 },
    { day: "Sat", revenue: 170000 },
    { day: "Sun", revenue: 105000 },
  ],
  paymentSuccessRate: 96.5,
};

export const mockRevenueKpi: RevenueKpi = {
  totalRevenue: 1250450,
  todayRevenue: 45230,
  monthRevenue: 185000,
  yearRevenue: 1250450,
  avgDailyRevenue: 41681,
  totalByStream: { digital_services: 400000, resellers: 500000, ecommerce: 350450 },
  todayByStream: { digital_services: 12000, resellers: 18030, ecommerce: 15200 },
  monthByStream: { digital_services: 62000, resellers: 70000, ecommerce: 53000 },
  yearByStream: { digital_services: 400000, resellers: 500000, ecommerce: 350450 },
  avgDailyByStream: { digital_services: 13333, resellers: 16667, ecommerce: 11681 },
  trend: [
    { date: "Jan", value: 120000 },
    { date: "Feb", value: 130000 },
    { date: "Mar", value: 155000 },
    { date: "Apr", value: 170000 },
    { date: "May", value: 185000 },
    { date: "Jun", value: 200000 },
    { date: "Jul", value: 220000 },
    { date: "Aug", value: 210000 },
    { date: "Sep", value: 230000 },
    { date: "Oct", value: 240000 },
    { date: "Nov", value: 250000 },
    { date: "Dec", value: 260000 },
  ],
  metrics: mockRevenueMetrics,
};

export const mockStreamTrend: StreamTrendPoint[] = [
  { date: "Jan", digital_services: 40000, resellers: 50000, ecommerce: 30000 },
  { date: "Feb", digital_services: 45000, resellers: 52000, ecommerce: 33000 },
  { date: "Mar", digital_services: 48000, resellers: 55000, ecommerce: 52000 },
  { date: "Apr", digital_services: 50000, resellers: 58000, ecommerce: 62000 },
  { date: "May", digital_services: 52000, resellers: 60000, ecommerce: 73000 },
  { date: "Jun", digital_services: 55000, resellers: 62000, ecommerce: 83000 },
  { date: "Jul", digital_services: 58000, resellers: 65000, ecommerce: 97000 },
  { date: "Aug", digital_services: 60000, resellers: 68000, ecommerce: 82000 },
  { date: "Sep", digital_services: 62000, resellers: 70000, ecommerce: 98000 },
  { date: "Oct", digital_services: 65000, resellers: 72000, ecommerce: 103000 },
  { date: "Nov", digital_services: 68000, resellers: 75000, ecommerce: 107000 },
  { date: "Dec", digital_services: 70000, resellers: 78000, ecommerce: 112000 },
];

export const mockServiceRevenue: ServiceRevenue[] = [
  { service: "MTN Data", revenue: 240000, orders: 1200 },
  { service: "Airtime", revenue: 190000, orders: 3800 },
  { service: "ECG", revenue: 150000, orders: 750 },
  { service: "DSTV", revenue: 120000, orders: 400 },
  { service: "GOtv", revenue: 80000, orders: 320 },
  { service: "WAEC", revenue: 60000, orders: 240 },
];

export const mockPaymentMethodRevenue: PaymentMethodRevenue[] = [
  { method: "Mobile Money", revenue: 562500, percentage: 45 },
  { method: "Wallet", revenue: 375000, percentage: 30 },
  { method: "Card", revenue: 187500, percentage: 15 },
  { method: "Bank", revenue: 62550, percentage: 5 },
  { method: "USSD", revenue: 37530, percentage: 3 },
  { method: "Atlas Points", revenue: 24870, percentage: 2 },
];

export const mockTopPerformers: TopPerformerRevenue[] = [
  { id: "RS-001", name: "Kwame Store", type: "reseller", revenue: 45000, trend: 12 },
  { id: "RS-002", name: "Adjoa Ventures", type: "reseller", revenue: 38000, trend: 8 },
  { id: "MER-001", name: "TechHub Store", type: "merchant", revenue: 35000, trend: 15 },
  { id: "RS-003", name: "Yaw Enterprises", type: "reseller", revenue: 32000, trend: -3 },
  { id: "MER-002", name: "FashionPlus", type: "merchant", revenue: 28000, trend: 7 },
];

export const mockNetworkRevenue: NetworkRevenue[] = [
  { network: "MTN", revenue: 520000, orders: 2600 },
  { network: "Telecel", revenue: 180000, orders: 900 },
  { network: "AirtelTigo", revenue: 120000, orders: 600 },
  { network: "ECG", revenue: 150000, orders: 750 },
  { network: "DSTV", revenue: 200000, orders: 720 },
];