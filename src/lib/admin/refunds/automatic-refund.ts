import type { Order } from "@/lib/admin/types/orders";
import { runAutomaticRefund } from "@/lib/admin/mock/refunds-mutations";

// Entry point for the retry engine. Called by orders-mutations.ts when a
// system-failed order has exhausted all retry attempts. Delegates to the
// refunds mutation layer. Returns the created refund id, or null if the
// order was not eligible (non-wallet payment, non-system failure).
export function fireAutomaticRefund(order: Order): string | null {
  const result = runAutomaticRefund(order);
  if (!result.ok || !result.refund) return null;
  return result.refund.id;
}