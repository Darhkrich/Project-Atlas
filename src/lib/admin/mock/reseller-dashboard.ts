import type {
  ResellerDashboardSummary,
  ResellerGrowthPoint,
  TopReseller,
  CommissionTrendPoint,
  RecentActivity,
} from "../types/reseller-dashboard";

export const mockResellerDashboardSummary: ResellerDashboardSummary = {
  totalResellers: 342,
  activeResellers: 310,
  pendingVerification: 18,
  suspendedResellers: 14,
  totalCommissionsPaid: 45000,
};

export const mockResellerGrowth: ResellerGrowthPoint[] = [
  { month: "Jan", newResellers: 20 },
  { month: "Feb", newResellers: 25 },
  { month: "Mar", newResellers: 30 },
  { month: "Apr", newResellers: 28 },
  { month: "May", newResellers: 35 },
  { month: "Jun", newResellers: 42 },
  { month: "Jul", newResellers: 38 },
  { month: "Aug", newResellers: 45 },
];

export const mockTopResellers: TopReseller[] = [
  { id: "RS-001", name: "Kwame Store", revenue: 45000, commissions: 2250 },
  { id: "RS-002", name: "Adjoa Ventures", revenue: 38000, commissions: 1900 },
  { id: "RS-004", name: "Efua Trading", revenue: 28000, commissions: 1400 },
  { id: "RS-003", name: "Yaw Enterprises", revenue: 32000, commissions: 1600 },
  { id: "RS-005", name: "Kojo & Sons", revenue: 20000, commissions: 900 },
];

export const mockCommissionTrend: CommissionTrendPoint[] = [
  { date: "Mon", paid: 1200, pending: 200 },
  { date: "Tue", paid: 1500, pending: 300 },
  { date: "Wed", paid: 1400, pending: 150 },
  { date: "Thu", paid: 1800, pending: 400 },
  { date: "Fri", paid: 2000, pending: 250 },
  { date: "Sat", paid: 1600, pending: 100 },
  { date: "Sun", paid: 2100, pending: 350 },
];

export const mockRecentActivities: RecentActivity[] = [
  { id: "ACT-1", type: "registration", description: "New reseller registered: Kwame Store", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "ACT-2", type: "verification", description: "Verification approved for Adjoa Ventures", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "ACT-3", type: "storefront", description: "Storefront disabled for Yaw Enterprises", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "ACT-4", type: "commission", description: "Commission payout of GH₵2,250 to Kwame Store", timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: "ACT-5", type: "wallet", description: "Wallet adjusted for Kojo & Sons", timestamp: new Date(Date.now() - 259200000).toISOString() },
];