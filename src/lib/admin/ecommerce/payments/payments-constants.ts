import type { AutoApproveConfig } from "@/lib/admin/types/merchant-money";

export const DEFAULT_AUTO_APPROVE_CONFIG: AutoApproveConfig = {
  thresholdGHS: 5000,
  feeRatePercent: 0.5,
  dailyCap: 2,
  updatedAt: "2025-01-15T10:00:00.000Z",
  updatedBy: "system",
};

export const WITHDRAWAL_CAP_WINDOW_MS = 86_400_000;

export const PAGE_SIZE = 20;

export type TabKey = "ledger" | "withdrawals";
export const TAB_KEYS: readonly TabKey[] = ["ledger", "withdrawals"] as const;

export type LedgerColumnKey =
  | "flow"
  | "amount"
  | "fee"
  | "status"
  | "source"
  | "created";

export const LEDGER_COLUMN_LABEL: Record<LedgerColumnKey, string> = {
  flow: "Flow",
  amount: "Amount",
  fee: "Fee",
  status: "Status",
  source: "Source",
  created: "Created",
};

export const LEDGER_OPTIONAL_COLUMN_KEYS: readonly LedgerColumnKey[] = [
  "flow",
  "amount",
  "fee",
  "status",
  "source",
  "created",
] as const;

export type LedgerSortKey = "newest" | "oldest" | "largest";

export const LEDGER_SORT_KEYS: readonly LedgerSortKey[] = [
  "newest",
  "oldest",
  "largest",
] as const;

export type DatePreset = "mtd" | "30d" | "90d" | "all";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  mtd: "This month",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export const DATE_PRESET_DAYS: Record<DatePreset, number | "mtd" | "all"> = {
  mtd: "mtd",
  "30d": 30,
  "90d": 90,
  all: "all",
};

export function datePresetToSinceMs(preset: DatePreset, nowMs: number): number {
  if (preset === "all") return 0;
  if (preset === "mtd") {
    const d = new Date(nowMs);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  }
  const days = DATE_PRESET_DAYS[preset];
  const n = typeof days === "number" ? days : 30;
  return nowMs - n * 86_400_000;
}