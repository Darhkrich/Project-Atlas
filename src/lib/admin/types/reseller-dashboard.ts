export interface ResellerDashboardSummary {
  totalResellers: number;
  activeResellers: number;
  pendingVerification: number;
  suspendedResellers: number;
  totalCommissionsPaid: number;
}

export interface ResellerGrowthPoint {
  month: string;
  newResellers: number;
}

export interface TopReseller {
  id: string;
  name: string;
  revenue: number;
  commissions: number;
}

export interface CommissionTrendPoint {
  date: string;
  paid: number;
  pending: number;
}

export interface RecentActivity {
  id: string;
  type: "registration" | "verification" | "storefront" | "commission" | "wallet";
  description: string;
  timestamp: string;
}