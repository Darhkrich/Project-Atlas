import type { ResellerCommissionWallet } from "@/lib/admin/types/reseller-commission-wallet";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function walletsToCsv(wallets: ResellerCommissionWallet[]): string {
  const header = [
    "resellerId",
    "resellerName",
    "currency",
    "balance",
    "pendingBalance",
    "totalEarned",
    "totalWithdrawn",
    "pendingRequests",
    "lastCreditAt",
  ];

  const rows = wallets.map((w) => [
    w.resellerId,
    w.resellerName,
    w.currency,
    w.balance,
    w.pendingBalance,
    w.totalEarned,
    w.totalWithdrawn,
    w.withdrawalRequests.length,
    w.lastCreditAt ?? "",
  ]);

  return rowsToCsv(header, rows);
}

export function withdrawalsToCsv(
  wallets: ResellerCommissionWallet[]
): string {
  const header = [
    "resellerId",
    "resellerName",
    "withdrawalId",
    "amount",
    "method",
    "status",
    "autoApproved",
    "requestedAt",
    "resolvedAt",
    "actor",
    "reason",
  ];

  const rows: (string | number)[][] = [];

  for (const w of wallets) {
    for (const h of w.withdrawalHistory) {
      rows.push([
        w.resellerId,
        w.resellerName,
        h.id,
        h.amount,
        h.method,
        h.status,
        h.autoApproved ? "yes" : "no",
        h.requestedAt,
        h.resolvedAt,
        h.actor ?? "",
        h.reason ?? "",
      ]);
    }
    for (const r of w.withdrawalRequests) {
      rows.push([
        w.resellerId,
        w.resellerName,
        r.id,
        r.amount,
        r.method,
        "pending",
        "no",
        r.requestedAt,
        "",
        "",
        "",
      ]);
    }
  }

  rows.sort((a, b) => String(b[7]).localeCompare(String(a[7])));

  return rowsToCsv(header, rows);
}