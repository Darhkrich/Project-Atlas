import type {
  ResellerDashboardSummary,
  ResellerGrowthPoint,
  TopReseller,
  PendingCommissionPoint,
  RecentActivity,
  TierCommissionPoint,
} from "../types/reseller-dashboard";

export const mockResellerDashboardSummary: ResellerDashboardSummary = {
  totalResellers: 342,
  activeResellers: 310,
  pendingVerification: 18,
  suspendedResellers: 14,
  totalCommissionsPaid: 45000,
  asOf: new Date().toISOString(),
};

export const mockResellerGrowth: ResellerGrowthPoint[] = [
  { month: "Jan", year: 2026, newResellers: 20 },
  { month: "Feb", year: 2026, newResellers: 25 },
  { month: "Mar", year: 2026, newResellers: 30 },
  { month: "Apr", year: 2026, newResellers: 28 },
  { month: "May", year: 2026, newResellers: 35 },
  { month: "Jun", year: 2026, newResellers: 42 },
  { month: "Jul", year: 2026, newResellers: 38 },
  { month: "Aug", year: 2026, newResellers: 45 },
];

export const mockTopResellers: TopReseller[] = [
  {
    id: "RS-001",
    name: "Kwame Store",
    tier: "Gold",
    tierId: "tier-gold",
    revenue: 45000,
    commissions: 2250,
    status: "active",
    verificationStatus: "verified",
    href: "/admin/resellers/RS-001",
  },
  {
    id: "RS-002",
    name: "Adjoa Ventures",
    tier: "Silver",
    tierId: "tier-silver",
    revenue: 38000,
    commissions: 1900,
    status: "active",
    verificationStatus: "verified",
    href: "/admin/resellers/RS-002",
  },
  {
    id: "RS-003",
    name: "Yaw Enterprises",
    tier: "Bronze",
    tierId: "tier-bronze",
    revenue: 32000,
    commissions: 1600,
    status: "active",
    verificationStatus: "pending",
    href: "/admin/resellers/RS-003",
  },
  {
    id: "RS-004",
    name: "Efua Trading",
    tier: "Silver",
    tierId: "tier-silver",
    revenue: 28000,
    commissions: 1400,
    status: "active",
    verificationStatus: "verified",
    href: "/admin/resellers/RS-004",
  },
  {
    id: "RS-005",
    name: "Kojo & Sons",
    tier: "Bronze",
    tierId: "tier-bronze",
    revenue: 20000,
    commissions: 900,
    status: "suspended",
    verificationStatus: "verified",
    href: "/admin/resellers/RS-005",
  },
];

export const mockTierCommissions: TierCommissionPoint[] = [
  { tier: "Gold", tierId: "tier-gold", paid: 18400, pending: 2100 },
  { tier: "Silver", tierId: "tier-silver", paid: 14200, pending: 1650 },
  { tier: "Bronze", tierId: "tier-bronze", paid: 8100, pending: 950 },
];

export const mockPendingCommissions: PendingCommissionPoint[] = [
  {
    id: "RS-001",
    name: "Kwame Store",
    tier: "Gold",
    pending: 2100,
    href: "/admin/resellers/RS-001",
  },
  {
    id: "RS-002",
    name: "Adjoa Ventures",
    tier: "Silver",
    pending: 950,
    href: "/admin/resellers/RS-002",
  },
  {
    id: "RS-004",
    name: "Efua Trading",
    tier: "Silver",
    pending: 700,
    href: "/admin/resellers/RS-004",
  },
];

/**
 * @deprecated Replaced by mockTierCommissions and mockPendingCommissions.
 * Kept as a literal export so any consumer that still imports the name
 * compiles. Delete this once the dashboard consumes the new arrays.
 */
export const mockCommissionTrend = [
  { date: "Mon", paid: 1200, pending: 200 },
  { date: "Tue", paid: 1500, pending: 300 },
  { date: "Wed", paid: 1400, pending: 150 },
  { date: "Thu", paid: 1800, pending: 400 },
  { date: "Fri", paid: 2000, pending: 250 },
  { date: "Sat", paid: 1600, pending: 100 },
  { date: "Sun", paid: 2100, pending: 350 },
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: "ACT-1",
    type: "registration",
    description: "New reseller registered: Kwame Store",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    href: "/admin/resellers/RS-001",
    source: "activity",
  },
  {
    id: "ACT-2",
    type: "verification",
    description: "Verification approved for Adjoa Ventures",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    resellerId: "RS-002",
    resellerName: "Adjoa Ventures",
    actor: "Finance Admin",
    href: "/admin/resellers/RS-002",
    source: "audit",
  },
  {
    id: "ACT-3",
    type: "storefront",
    description: "Storefront disabled for Yaw Enterprises",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resellerId: "RS-003",
    resellerName: "Yaw Enterprises",
    actor: "Operations Admin",
    href: "/admin/resellers/RS-003",
    source: "audit",
  },
  {
    id: "ACT-4",
    type: "commission",
    description: "Commission payout of GH\u20B52,250 to Kwame Store",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    href: "/admin/resellers/RS-001",
    source: "activity",
  },
  {
    id: "ACT-5",
    type: "wallet",
    description: "Wallet adjusted for Kojo & Sons",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    resellerId: "RS-005",
    resellerName: "Kojo & Sons",
    actor: "Finance Admin",
    href: "/admin/resellers/RS-005",
    source: "audit",
  },
];