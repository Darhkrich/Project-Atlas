export type AdminRole =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "support_admin"
  | "service_admin"
  | "analyst";

export type AdminUserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
  activityLog: {
    id: string;
    timestamp: string;
    action: string;
    resource?: string;
  }[];
}

export const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "operations_admin", label: "Operations Admin" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "support_admin", label: "Support Admin" },
  { value: "service_admin", label: "Service Admin" },
  { value: "analyst", label: "Analyst" },
];

export const ALL_ADMIN_PERMISSIONS: { module: string; permissions: string[] }[] = [
  { module: "orders", permissions: ["orders.view", "orders.manage", "orders.export"] },
  { module: "transactions", permissions: ["transactions.view", "transactions.export", "transactions.retry", "transactions.refund"] },
  { module: "payments", permissions: ["payments.view", "payments.export", "payments.refund"] },
  { module: "refunds", permissions: ["refunds.view", "refunds.approve", "refunds.reject", "refunds.process"] },
  { module: "customers", permissions: ["customers.view", "customers.manage"] },
  { module: "resellers", permissions: ["resellers.view", "resellers.manage", "resellers.verify"] },
  { module: "wallets", permissions: ["wallets.view", "wallets.adjust"] },
  { module: "services", permissions: ["services.view", "services.manage"] },
  { module: "providers", permissions: ["providers.view", "providers.manage"] },
  { module: "pricing", permissions: ["pricing.view", "pricing.manage"] },
  { module: "commissions", permissions: ["commissions.view", "commissions.manage"] },
  { module: "storefronts", permissions: ["storefronts.view", "storefronts.manage"] },
  { module: "support", permissions: ["support.view", "support.manage"] },
  { module: "notifications", permissions: ["notifications.view", "notifications.manage"] },
  { module: "analytics", permissions: ["analytics.view", "analytics.export"] },
  { module: "reports", permissions: ["reports.view", "reports.export"] },
  { module: "security", permissions: ["security.view", "security.manage"] },
  { module: "audit_logs", permissions: ["audit_logs.view", "audit_logs.export"] },
  { module: "admin_users", permissions: ["admin_users.view", "admin_users.manage"] },
  { module: "settings", permissions: ["settings.view", "settings.manage"] },
];