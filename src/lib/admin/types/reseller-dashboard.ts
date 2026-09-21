import type { Reseller } from "./reseller";

export interface ResellerDashboardSummary {
  totalResellers: number;
  activeResellers: number;
  pendingVerification: number;
  suspendedResellers: number;
  totalCommissionsPaid: number;
  asOf: string;
}

export interface ResellerGrowthPoint {
  month: string;
  year: number;
  newResellers: number;
}

export interface TopReseller {
  id: string;
  name: string;
  tier: string;
  tierId: string;
  revenue: number;
  commissions: number;
  status: Reseller["status"];
  verificationStatus: Reseller["verificationStatus"];
  href: string;
}

export interface TierCommissionPoint {
  tier: string;
  tierId: string;
  paid: number;
  pending: number;
}

export interface PendingCommissionPoint {
  id: string;
  name: string;
  tier: string;
  pending: number;
  href: string;
}

export type RecentActivitySource = "activity" | "audit";

export interface RecentActivity {
  id: string;
  type:
    | "registration"
    | "verification"
    | "storefront"
    | "commission"
    | "wallet";
  description: string;
  timestamp: string;
  resellerId: string;
  resellerName: string;
  actor?: string;
  href: string;
  source: RecentActivitySource;
}