// lib/admin/reports/generators.ts

import type {
  ReportFilter,
  ReportFormat,
  ReportType,
} from "@/lib/admin/types/report";

export interface GeneratedReport {
  csv: string;
  rowCount: number;
  fileName: string;
  fileSizeBytes: number;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

function formatIsoDay(iso: string): string {
  return iso.slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 30;
  return Math.max(1, Math.round((to - from) / 86_400_000));
}

function pickName(rng: () => number, names: string[]): string {
  return names[Math.floor(rng() * names.length)] ?? names[0];
}

function buildDailySales(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const days = Math.min(daysBetween(filter.dateFrom, filter.dateTo), 90);
  const end = new Date(filter.dateTo);
  const rows: (string | number)[][] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86_400_000);
    const orders = 40 + Math.floor(rng() * 60);
    const revenue = orders * (120 + Math.floor(rng() * 60));
    rows.push([
      formatIsoDay(d.toISOString()),
      orders,
      revenue,
      Math.round((revenue / orders) * 100) / 100,
    ]);
  }

  return {
    header: ["Date", "Orders", "Revenue (GHS)", "Avg order value (GHS)"],
    rows,
  };
}

function buildMonthlySales(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const months = 6;
  const end = new Date(filter.dateTo);
  const rows: (string | number)[][] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setMonth(d.getMonth() - i);
    const orders = 800 + Math.floor(rng() * 400);
    const revenue = orders * (130 + Math.floor(rng() * 40));
    rows.push([
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      orders,
      revenue,
    ]);
  }

  return {
    header: ["Month", "Orders", "Revenue (GHS)"],
    rows,
  };
}

function buildOrders(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const customers = [
    "Ama Serwaa",
    "Kwesi Owusu",
    "Kojo Appiah",
    "Adjoa Mensah",
    "Nana Akua",
    "Yaw Boateng",
  ];
  const merchants = [
    "TechHub Store",
    "Kente Kingdom",
    "Adinkra Apparel",
    "Cedi Groceries",
  ];
  const statuses = ["Fulfilled", "Pending", "Failed"];

  const count = 24;
  const rows: (string | number)[][] = [];

  for (let i = 0; i < count; i++) {
    rows.push([
      `ATX-${900_000 + Math.floor(rng() * 99_999)}`,
      pickName(rng, customers),
      pickName(rng, merchants),
      20 + Math.floor(rng() * 200),
      pickName(rng, statuses),
      formatIsoDay(filter.dateTo),
    ]);
  }

  return {
    header: ["Order ID", "Customer", "Merchant", "Amount (GHS)", "Status", "Date"],
    rows,
  };
}

function buildTransactions(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const types = ["Airtime", "Data", "Bill", "TV", "Refund"];
  const statuses = ["Successful", "Pending", "Failed"];
  const users = [
    "Ama Serwaa",
    "Kwesi Owusu",
    "Kojo Appiah",
    "Nana Akua",
  ];

  const count = 30;
  const rows: (string | number)[][] = [];

  for (let i = 0; i < count; i++) {
    const amount = 10 + Math.floor(rng() * 150);
    const fee = Math.round(amount * 0.015 * 100) / 100;
    rows.push([
      `TX-${500_000 + Math.floor(rng() * 99_999)}`,
      pickName(rng, users),
      pickName(rng, types),
      amount,
      fee,
      Math.round((amount - fee) * 100) / 100,
      pickName(rng, statuses),
    ]);
  }

  return {
    header: [
      "Transaction ID",
      "User",
      "Type",
      "Amount (GHS)",
      "Fee (GHS)",
      "Net (GHS)",
      "Status",
    ],
    rows,
  };
}

function buildResellerPerformance(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const resellers = [
    "Kwame Store",
    "Nkrumah Digital",
    "Gold Coast Airtime",
    "Accra Digital Hub",
    "Swift Top-Up",
  ];

  const rows: (string | number)[][] = resellers.map((name) => {
    const orders = 200 + Math.floor(rng() * 900);
    const revenue = orders * (30 + Math.floor(rng() * 30));
    const commissions = Math.round(revenue * 0.04);
    return [name, orders, revenue, commissions];
  });

  return {
    header: ["Reseller", "Orders", "Revenue (GHS)", "Commissions (GHS)"],
    rows,
  };
}

function buildCustomerActivity(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const customers = [
    "Ama Serwaa",
    "Kwesi Owusu",
    "Kojo Appiah",
    "Adjoa Mensah",
    "Nana Akua",
    "Yaw Boateng",
    "Esi Asante",
    "Kofi Danso",
  ];

  const rows: (string | number)[][] = customers.map((name) => {
    const orders = 2 + Math.floor(rng() * 30);
    const spent = orders * (40 + Math.floor(rng() * 80));
    return [name, orders, spent, formatIsoDay(filter.dateTo)];
  });

  return {
    header: ["Customer", "Orders", "Total spent (GHS)", "Last active"],
    rows,
  };
}

function buildWalletTransactions(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const owners = ["Kwame Store", "TechHub Store", "Kente Kingdom", "Ama Serwaa"];
  const types = ["Credit", "Debit"];
  const rows: (string | number)[][] = [];

  for (let i = 0; i < 20; i++) {
    const amount = 20 + Math.floor(rng() * 500);
    rows.push([
      `W-${100_000 + Math.floor(rng() * 99_999)}`,
      pickName(rng, owners),
      pickName(rng, types),
      amount,
      1000 + Math.floor(rng() * 3000),
      formatIsoDay(filter.dateTo),
    ]);
  }

  return {
    header: [
      "Wallet ID",
      "Owner",
      "Type",
      "Amount (GHS)",
      "Balance after (GHS)",
      "Date",
    ],
    rows,
  };
}

function buildCommissions(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const resellers = ["Kwame Store", "Nkrumah Digital", "Gold Coast Airtime"];
  const statuses = ["Pending", "Settled", "On hold"];
  const rows: (string | number)[][] = [];

  for (let i = 0; i < 12; i++) {
    rows.push([
      `C-${800_000 + Math.floor(rng() * 9_999)}`,
      pickName(rng, resellers),
      `ATX-${900_000 + Math.floor(rng() * 99_999)}`,
      Math.round((rng() * 20 + 1) * 100) / 100,
      pickName(rng, statuses),
    ]);
  }

  return {
    header: ["Commission ID", "Reseller", "Order", "Amount (GHS)", "Status"],
    rows,
  };
}

function buildRefunds(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const customers = ["Ama Serwaa", "Kojo Appiah", "Nana Akua", "Esi Asante"];
  const reasons = [
    "Provider timeout",
    "Invalid recipient",
    "Wrong number",
    "Duplicate charge",
  ];
  const statuses = ["Issued", "Pending", "Rejected"];
  const rows: (string | number)[][] = [];

  for (let i = 0; i < 10; i++) {
    rows.push([
      `R-${700_000 + Math.floor(rng() * 9_999)}`,
      `ATX-${900_000 + Math.floor(rng() * 99_999)}`,
      pickName(rng, customers),
      10 + Math.floor(rng() * 200),
      pickName(rng, reasons),
      pickName(rng, statuses),
    ]);
  }

  return {
    header: [
      "Refund ID",
      "Order",
      "Customer",
      "Amount (GHS)",
      "Reason",
      "Status",
    ],
    rows,
  };
}

function buildFailedTransactions(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const users = ["Ama Serwaa", "Kwesi Owusu", "Kofi Danso", "Nana Akua"];
  const reasons = [
    "Provider timeout",
    "Insufficient balance",
    "Invalid recipient number",
    "Payment method declined",
  ];
  const rows: (string | number)[][] = [];

  for (let i = 0; i < 16; i++) {
    rows.push([
      `TX-${500_000 + Math.floor(rng() * 99_999)}`,
      pickName(rng, users),
      10 + Math.floor(rng() * 150),
      pickName(rng, reasons),
      formatIsoDay(filter.dateTo),
    ]);
  }

  return {
    header: [
      "Transaction ID",
      "User",
      "Amount (GHS)",
      "Failure reason",
      "Date",
    ],
    rows,
  };
}

function buildServicePerformance(
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  const services = [
    "MTN Data",
    "Telecel Data",
    "MTN Airtime",
    "ECG Prepaid",
    "WAEC Result Checker",
    "DSTV Compact",
  ];

  const rows: (string | number)[][] = services.map((service) => {
    const orders = 200 + Math.floor(rng() * 1500);
    const revenue = orders * (10 + Math.floor(rng() * 100));
    const successRate = Math.round((90 + rng() * 9.5) * 10) / 10;
    return [service, orders, revenue, successRate];
  });

  return {
    header: ["Service", "Orders", "Revenue (GHS)", "Success rate (%)"],
    rows,
  };
}

function generateForType(
  type: ReportType,
  filter: ReportFilter,
  rng: () => number
): { header: string[]; rows: (string | number)[][] } {
  switch (type) {
    case "daily_sales":
      return buildDailySales(filter, rng);
    case "monthly_sales":
      return buildMonthlySales(filter, rng);
    case "orders":
      return buildOrders(filter, rng);
    case "transactions":
      return buildTransactions(filter, rng);
    case "reseller_performance":
      return buildResellerPerformance(filter, rng);
    case "customer_activity":
      return buildCustomerActivity(filter, rng);
    case "wallet_transactions":
      return buildWalletTransactions(filter, rng);
    case "commissions":
      return buildCommissions(filter, rng);
    case "refunds":
      return buildRefunds(filter, rng);
    case "failed_transactions":
      return buildFailedTransactions(filter, rng);
    case "service_performance":
      return buildServicePerformance(filter, rng);
  }
}

export function generateReport(
  filter: ReportFilter,
  options?: { seedSuffix?: string }
): GeneratedReport {
  const seedKey = `${filter.reportType}|${filter.section}|${filter.dateFrom}|${filter.dateTo}|${
    options?.seedSuffix ?? ""
  }`;
  const rng = makeRng(hashString(seedKey));

  const { header, rows } = generateForType(filter.reportType, filter, rng);
  const csv = toCsv(header, rows);

  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${filter.reportType}_${filter.section}_${stamp}.csv`;

  return {
    csv,
    rowCount: rows.length,
    fileName,
    fileSizeBytes: new Blob([csv]).size,
  };
}

export function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 86_400_000);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
  };
}

export function formatForFileExtension(format: ReportFormat): string {
  return format === "csv" ? "csv" : format;
}