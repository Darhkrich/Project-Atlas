export type CustomerStatus = "active" | "inactive" | "suspended";
export type RiskLevel = "low" | "medium" | "high";
export type Tag = string;
export type StorefrontType = "reseller" | "merchant";
export type ReportStatus = "pending" | "action_taken" | "dismissed";

export interface AtlasPointsTransaction {
  id: string;
  type: "earned" | "redeemed" | "expired";
  amount: number;
  description: string;
  timestamp: string;
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationPreference {
  channel: "email" | "sms" | "push";
  enabled: boolean;
}

export interface SupportTicketSummary {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  updatedAt: string;
}

export interface DataUsageStat {
  month: string;
  dataUsedGB: number;
  airtimeUsedGHS: number;
}

export interface CustomerReport {
  id: string;
  reporterType: "merchant" | "reseller";
  reporterId: string;
  reporterName: string;
  reason: string;
  details?: string;
  timestamp: string;
  status: ReportStatus;
  actionTaken?: string;
  actionTimestamp?: string;
  adminNote?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  status: CustomerStatus;
  source: "direct" | "reseller" | "ecommerce";
  joinedAt: string;
  lastActive: string;
  last6MonthsSpend: { month: string; amount: number }[];
  savedPaymentMethods: { id: string; type: string; label: string }[];
  addresses: { id: string; label: string; address: string }[];

  atlasPointsBalance: number;
  atlasPointsHistory: AtlasPointsTransaction[];
  referralCode?: string;
  referredBy?: string;
  referralsCount: number;
  devices: DeviceInfo[];
  notificationPreferences: NotificationPreference[];
  supportTickets: SupportTicketSummary[];
  dataUsage: DataUsageStat[];
  riskScore: number;
  riskLevel: RiskLevel;
  tags: Tag[];

  activityLog: { id: string; timestamp: string; action: string }[];
  securityEvents: { id: string; timestamp: string; event: string; ip?: string }[];

  storefrontId?: string | null;
  storefrontType?: StorefrontType | null;
  accountType?: "registered" | "guest";

  reports?: CustomerReport[];
}