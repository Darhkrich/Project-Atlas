import type {
  EcommerceSummary,
  EcommerceRevenueTrendPoint,
  PlanDistribution,
  TopMerchant,
} from "../types/ecommerce";

export const mockEcommerceSummary: EcommerceSummary = {
  totalMerchants: 156,
  activeSubscriptions: 132,
  mrr: 24000,
  totalOrders: 4820,
  totalSalesVolume: 356000,
  pendingSupportTickets: 12,
};

export const mockEcommerceRevenueTrend: EcommerceRevenueTrendPoint[] = [
  { date: "Jan", revenue: 22000, orders: 300 },
  { date: "Feb", revenue: 28000, orders: 350 },
  { date: "Mar", revenue: 31000, orders: 400 },
  { date: "Apr", revenue: 29000, orders: 380 },
  { date: "May", revenue: 35000, orders: 450 },
  { date: "Jun", revenue: 38000, orders: 500 },
  { date: "Jul", revenue: 40000, orders: 520 },
  { date: "Aug", revenue: 42000, orders: 550 },
];

export const mockPlanDistribution: PlanDistribution[] = [
  { plan: "Starter", count: 80 },
  { plan: "Growth", count: 40 },
  { plan: "Pro", count: 20 },
  { plan: "Enterprise", count: 16 },
];

export const mockTopMerchants: TopMerchant[] = [
  { id: "MER-001", name: "TechHub Store", sales: 45000, orders: 350 },
  { id: "MER-002", name: "FashionPlus", sales: 38000, orders: 280 },
  { id: "MER-003", name: "HomeEssentials", sales: 32000, orders: 220 },
  { id: "MER-004", name: "GadgetWorld", sales: 28000, orders: 190 },
  { id: "MER-005", name: "BeautyCorner", sales: 22000, orders: 150 },
];