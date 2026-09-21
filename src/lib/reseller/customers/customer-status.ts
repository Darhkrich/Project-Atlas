export type DerivedCustomerStatus = "active" | "inactive";

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function deriveCustomerStatus(
  lastOrderAt: string | null,
  nowMs: number
): DerivedCustomerStatus {
  if (!lastOrderAt) return "inactive";
  const t = new Date(lastOrderAt).getTime();
  if (Number.isNaN(t)) return "inactive";
  return nowMs - t <= ACTIVE_WINDOW_MS ? "active" : "inactive";
}