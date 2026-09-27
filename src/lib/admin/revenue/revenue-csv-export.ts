import { formatCurrency } from "@/lib/admin/formatters";
import type {
  CustomerRow,
  MethodRow,
  NetworkRow,
  PerformerRow,
  RevenueKpis,
  StreamRow,
  TopServiceRow,
  TrendPoint,
  WeekdayRow,
  SourceRow,
  RefundImpact,
  PaymentSuccess,
  ProfitMargin,
  LowMarginAlert,
} from "./revenue-projection";
import { STREAM_LABEL } from "./revenue-labels";

function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(cells: unknown[]): string {
  return cells.map(esc).join(",");
}

export function overviewToCsv(
  kpis: RevenueKpis,
  trend: TrendPoint[],
  recurring: { mrr: number; arr: number; arpuByStream: Record<string, number> }
): string {
  const lines: string[] = [];
  lines.push("KPI,Value");
  lines.push(row(["Total platform revenue", kpis.totalPlatform]));
  lines.push(row(["Today", kpis.todayPlatform]));
  lines.push(row(["This month", kpis.monthPlatform]));
  lines.push(row(["This year", kpis.yearPlatform]));
  lines.push(row(["Average daily", kpis.avgDailyPlatform]));
  lines.push("");
  lines.push("MRR,ARR,ARPU Digital services,ARPU Resellers,ARPU Ecommerce");
  lines.push(
    row([
      recurring.mrr,
      recurring.arr,
      recurring.arpuByStream.digital_services,
      recurring.arpuByStream.resellers,
      recurring.arpuByStream.ecommerce,
    ])
  );
  lines.push("");
  lines.push("Bucket,Digital services,Resellers,Ecommerce,Total");
  for (const p of trend) {
    lines.push(
      row([
        p.label,
        p.digital_services,
        p.resellers,
        p.ecommerce,
        p.total,
      ])
    );
  }
  return lines.join("\n");
}

export function sourcesToCsv(
  streams: StreamRow[],
  topServices: TopServiceRow[],
  methods: MethodRow[],
  networks: NetworkRow[],
  performers: { resellers: PerformerRow[]; merchants: PerformerRow[] },
  customers: CustomerRow[],
  weekday: WeekdayRow[],
  source: SourceRow[]
): string {
  const lines: string[] = [];

  lines.push("Streams");
  lines.push("Stream,Amount");
  for (const s of streams) {
    lines.push(row([STREAM_LABEL[s.stream], s.amount]));
  }

  lines.push("");
  lines.push("Top services");
  lines.push("Service,Amount,Orders");
  for (const s of topServices) {
    lines.push(row([s.serviceName, s.amount, s.orders]));
  }

  lines.push("");
  lines.push("Payment methods");
  lines.push("Method,Amount,Share %");
  for (const m of methods) {
    lines.push(row([m.label, m.amount, m.share.toFixed(2)]));
  }

  lines.push("");
  lines.push("Networks");
  lines.push("Network,Amount,Orders");
  for (const n of networks) {
    lines.push(row([n.network, n.amount, n.orders]));
  }

  lines.push("");
  lines.push("Top resellers");
  lines.push("Name,Amount,Orders");
  for (const r of performers.resellers) {
    lines.push(row([r.name, r.amount, r.orders]));
  }

  lines.push("");
  lines.push("Top merchants");
  lines.push("Name,Amount,Orders");
  for (const m of performers.merchants) {
    lines.push(row([m.name, m.amount, m.orders]));
  }

  lines.push("");
  lines.push("Top customers");
  lines.push("Name,Stream,Amount,Orders");
  for (const c of customers) {
    lines.push(
      row([c.name, STREAM_LABEL[c.stream], c.amount, c.orders])
    );
  }

  lines.push("");
  lines.push("Weekday");
  lines.push("Day,Amount");
  for (const w of weekday) {
    lines.push(row([w.day, w.amount]));
  }

  lines.push("");
  lines.push("Acquisition source");
  lines.push("Source,Amount");
  for (const s of source) {
    lines.push(row([s.label, s.amount]));
  }

  return lines.join("\n");
}

export function healthToCsv(
  refunds: RefundImpact,
  success: PaymentSuccess,
  margin: ProfitMargin,
  alerts: LowMarginAlert[]
): string {
  const lines: string[] = [];

  lines.push("Refund impact");
  lines.push("Metric,Value");
  lines.push(row(["Total refunds", refunds.totalRefunds]));
  lines.push(row(["Net revenue", refunds.netRevenue]));
  lines.push(
    row(["Refund rate %", refunds.refundRatePercent.toFixed(2)])
  );

  lines.push("");
  lines.push("Payment success");
  lines.push("Metric,Value");
  lines.push(row(["Rate %", success.rate.toFixed(2)]));
  lines.push(row(["Sample size", success.sampleSize]));

  lines.push("");
  lines.push("Profit margin");
  lines.push("Metric,Value");
  lines.push(
    row(["Overall margin %", margin.overallPercent.toFixed(2)])
  );
  lines.push(row(["Sample size", margin.sampleSize]));

  lines.push("");
  lines.push("Low margin alerts");
  lines.push("Service,Margin %");
  for (const a of alerts) {
    lines.push(row([a.serviceName, a.marginPercent.toFixed(2)]));
  }

  return lines.join("\n");
}