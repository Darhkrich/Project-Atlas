export type ReportType =
  | "daily_sales"
  | "monthly_sales"
  | "orders"
  | "transactions"
  | "reseller_performance"
  | "customer_activity"
  | "wallet_transactions"
  | "commissions"
  | "refunds"
  | "failed_transactions"
  | "service_performance";

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  lastGenerated?: string;
  columns: string[];
}

export interface ReportFilter {
  reportType: ReportType;
  dateFrom: string;
  dateTo: string;
  format: "csv" | "excel" | "pdf";
}

export interface SavedReportTemplate extends ReportFilter {
  id: string;
  name: string;
  createdAt: string;
}

export interface ReportHistoryItem {
  id: string;
  reportName: string;
  generatedAt: string;
  fileName: string;
  format: "csv" | "excel" | "pdf";
}

export interface ScheduledReport {
  id: string;
  reportName: string;
  schedule: "daily" | "weekly" | "monthly";
  recipients: string[];
  nextRunAt: string;
  enabled: boolean;
}