// lib/admin/reports/constants.ts

import type {
  ReportDeliveryMethod,
  ReportFormat,
  ReportRunStatus,
  ReportSchedule,
  ReportSectionScope,
  ReportType,
} from "@/lib/admin/types/report";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  daily_sales: "Daily Sales",
  monthly_sales: "Monthly Sales",
  orders: "Orders",
  transactions: "Transactions",
  reseller_performance: "Reseller Performance",
  customer_activity: "Customer Activity",
  wallet_transactions: "Wallet Transactions",
  commissions: "Commissions",
  refunds: "Refunds",
  failed_transactions: "Failed Transactions",
  service_performance: "Service Performance",
};

export const REPORT_TYPE_DESCRIPTION: Record<ReportType, string> = {
  daily_sales: "Sales revenue grouped by day.",
  monthly_sales: "Sales revenue grouped by month.",
  orders: "All orders with customer and merchant details.",
  transactions: "Financial transactions with fees and net amounts.",
  reseller_performance: "Reseller sales and commission performance.",
  customer_activity: "Customer orders and spending patterns.",
  wallet_transactions: "All wallet credits and debits.",
  commissions: "Commission earnings and payout status.",
  refunds: "All refunds issued.",
  failed_transactions: "Transactions that failed.",
  service_performance: "Performance by service (success rate, revenue).",
};

export const SCHEDULE_LABEL: Record<ReportSchedule, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const FORMAT_LABEL: Record<ReportFormat, string> = {
  csv: "CSV",
  excel: "Excel",
  pdf: "PDF",
};

export const FORMAT_AVAILABLE: Record<ReportFormat, boolean> = {
  csv: true,
  excel: false,
  pdf: false,
};

export const FORMAT_HINT: Record<ReportFormat, string | null> = {
  csv: "Downloadable today. Opens in Excel, Sheets, or any spreadsheet tool.",
  excel: "Coming soon. Native .xlsx formatting is being added.",
  pdf: "Coming soon. PDF reports will land with the template engine.",
};

export const DELIVERY_LABEL: Record<ReportDeliveryMethod, string> = {
  email: "Email",
};

export const RUN_STATUS_LABEL: Record<ReportRunStatus, string> = {
  success: "Succeeded",
  failure: "Failed",
  pending: "Pending",
};

export const RUN_STATUS_VARIANT: Record<ReportRunStatus, BadgeVariant> = {
  success: "success",
  failure: "danger",
  pending: "warning",
};

export const SECTION_SCOPE_LABEL: Record<ReportSectionScope, string> = {
  all: "All sections",
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
  admin: "Admin",
};

export const ALL_REPORT_TYPES: ReportType[] = [
  "daily_sales",
  "monthly_sales",
  "orders",
  "transactions",
  "reseller_performance",
  "customer_activity",
  "wallet_transactions",
  "commissions",
  "refunds",
  "failed_transactions",
  "service_performance",
];

export const ALL_SCHEDULES: ReportSchedule[] = [
  "daily",
  "weekly",
  "monthly",
];

export const ALL_FORMATS: ReportFormat[] = ["csv", "excel", "pdf"];

export const ALL_SECTION_SCOPES: ReportSectionScope[] = [
  "all",
  "digital_services",
  "resellers",
  "ecommerce",
];

export const RETENTION_DAYS = 90;

export const REPORT_SECTIONS_FOR_TYPE: Record<ReportType, ReportSectionScope[]> = {
  daily_sales: ["all", "digital_services", "resellers", "ecommerce"],
  monthly_sales: ["all", "digital_services", "resellers", "ecommerce"],
  orders: ["all", "digital_services", "ecommerce"],
  transactions: ["all", "digital_services", "resellers", "ecommerce"],
  reseller_performance: ["resellers"],
  customer_activity: ["digital_services", "ecommerce", "all"],
  wallet_transactions: ["all", "resellers", "ecommerce"],
  commissions: ["resellers"],
  refunds: ["all", "digital_services", "ecommerce"],
  failed_transactions: ["all", "digital_services", "ecommerce"],
  service_performance: ["digital_services"],
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}