import type { TransactionLedgerRow } from "@/lib/admin/types/transaction";

export function isSameUtcDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isUtcDayAgo(iso: string, nowMs: number, daysAgo: number): boolean {
  const targetMs = nowMs - daysAgo * 24 * 60 * 60 * 1000;
  return isSameUtcDay(iso, new Date(targetMs).toISOString());
}

export function isTodayUtc(iso: string, nowMs: number): boolean {
  return isUtcDayAgo(iso, nowMs, 0);
}

export function maskWalletId(walletId: string): string {
  if (walletId.length <= 8) return walletId;
  return walletId.slice(0, 6) + "..." + walletId.slice(-4);
}

export function ownerHref(
  row: TransactionLedgerRow
): { href: string; label: string } | null {
  return null;
}