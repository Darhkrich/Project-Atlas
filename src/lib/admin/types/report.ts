// lib/admin/types/report.ts

import type { AtlasSection } from "./settings";

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

export type ReportFormat = "csv" | "excel" | "pdf";

export type ReportSchedule = "daily" | "weekly" | "monthly";

export type ReportDeliveryMethod = "email";

export type ReportSectionScope = AtlasSection | "all";

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  columns: string[];
  sectionScopes: ReportSectionScope[];
  lastGenerated?: string;
}

export interface ReportFilter {
  reportType: ReportType;
  section: ReportSectionScope;
  dateFrom: string;
  dateTo: string;
  format: ReportFormat;
}

export interface SavedReportTemplate extends ReportFilter {
  id: string;
  name: string;
  createdAt: string;
  createdById?: string;
  createdByName?: string;
  updatedAt?: string;
}

export interface ReportHistoryItem {
  id: string;
  reportName: string;
  reportType: ReportType;
  generatedAt: string;
  generatedById?: string;
  generatedByName?: string;
  fileName: string;
  format: ReportFormat;
  section: ReportSectionScope;
  rowCount: number;
  fileSizeBytes: number;
  expiresAt: string;
}

export interface ReportRecipient {
  id: string;
  email: string;
  name?: string;
}

export type ReportRunStatus = "success" | "failure" | "pending";

export interface ScheduledReport {
  id: string;
  reportName: string;
  reportType: ReportType;
  schedule: ReportSchedule;
  format: ReportFormat;
  section: ReportSectionScope;
  recipients: ReportRecipient[];
  deliveryMethod: ReportDeliveryMethod;
  timezone: string;
  nextRunAt: string;
  lastRunAt?: string;
  lastRunStatus?: ReportRunStatus;
  enabled: boolean;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}