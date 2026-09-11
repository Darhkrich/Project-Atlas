import type { Report, SavedReportTemplate, ReportHistoryItem, ScheduledReport } from "../types/report";

export const mockAvailableReports: Report[] = [
  {
    id: "RPT-001",
    name: "Daily Sales",
    type: "daily_sales",
    description: "Sales revenue grouped by day.",
    columns: ["Date", "Orders", "Revenue", "Average Order Value"],
    lastGenerated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "RPT-002",
    name: "Monthly Sales",
    type: "monthly_sales",
    description: "Sales revenue grouped by month.",
    columns: ["Month", "Orders", "Revenue"],
    lastGenerated: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "RPT-003",
    name: "Orders Report",
    type: "orders",
    description: "All orders with customer and merchant details.",
    columns: ["Order ID", "Customer", "Merchant", "Amount", "Status", "Date"],
  },
  {
    id: "RPT-004",
    name: "Transactions Report",
    type: "transactions",
    description: "Financial transactions with fees and net amounts.",
    columns: ["Transaction ID", "User", "Type", "Amount", "Fee", "Net", "Status"],
  },
  {
    id: "RPT-005",
    name: "Reseller Performance",
    type: "reseller_performance",
    description: "Reseller sales and commission performance.",
    columns: ["Reseller", "Orders", "Revenue", "Commissions"],
  },
  {
    id: "RPT-006",
    name: "Customer Activity",
    type: "customer_activity",
    description: "Customer orders and spending patterns.",
    columns: ["Customer", "Orders", "Total Spent", "Last Active"],
  },
  {
    id: "RPT-007",
    name: "Wallet Transactions",
    type: "wallet_transactions",
    description: "All wallet credits/debits.",
    columns: ["Wallet ID", "Owner", "Type", "Amount", "Balance After", "Date"],
  },
  {
    id: "RPT-008",
    name: "Commissions Report",
    type: "commissions",
    description: "Commission earnings and status.",
    columns: ["Commission ID", "Reseller", "Order", "Amount", "Status"],
  },
  {
    id: "RPT-009",
    name: "Refunds Report",
    type: "refunds",
    description: "All refunds issued.",
    columns: ["Refund ID", "Order", "Customer", "Amount", "Reason", "Status"],
  },
  {
    id: "RPT-010",
    name: "Failed Transactions",
    type: "failed_transactions",
    description: "Transactions that failed.",
    columns: ["Transaction ID", "User", "Amount", "Failure Reason", "Date"],
  },
  {
    id: "RPT-011",
    name: "Service Performance",
    type: "service_performance",
    description: "Performance by service (success rate, revenue).",
    columns: ["Service", "Orders", "Revenue", "Success Rate"],
  },
];

export const mockSavedTemplates: SavedReportTemplate[] = [
  {
    id: "SRT-001",
    name: "Monthly Sales – Last 30 days",
    reportType: "monthly_sales",
    dateFrom: new Date(Date.now() - 86400000 * 30).toISOString(),
    dateTo: new Date().toISOString(),
    format: "csv",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "SRT-002",
    name: "Reseller Performance – Q1",
    reportType: "reseller_performance",
    dateFrom: new Date(Date.now() - 86400000 * 90).toISOString(),
    dateTo: new Date(Date.now() - 86400000 * 60).toISOString(),
    format: "excel",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export const mockReportHistory: ReportHistoryItem[] = [
  {
    id: "RPT-H-001",
    reportName: "Daily Sales",
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    fileName: "daily_sales_2026-09-07.csv",
    format: "csv",
  },
  {
    id: "RPT-H-002",
    reportName: "Reseller Performance",
    generatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    fileName: "reseller_performance_2026-09-05.pdf",
    format: "pdf",
  },
];

export const mockScheduledReports: ScheduledReport[] = [
  {
    id: "SCH-001",
    reportName: "Daily Sales",
    schedule: "daily",
    recipients: ["finance@atlas.com", "admin@atlas.com"],
    nextRunAt: new Date(Date.now() + 86400000).toISOString(),
    enabled: true,
  },
  {
    id: "SCH-002",
    reportName: "Reseller Performance",
    schedule: "weekly",
    recipients: ["resellers@atlas.com"],
    nextRunAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    enabled: false,
  },
];