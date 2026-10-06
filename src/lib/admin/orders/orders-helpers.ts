// lib/admin/orders/orders-helpers.ts

import type { Order, OrderWalletOwner } from "@/lib/admin/types/orders";

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

export function isSystemFailure(order: Order): boolean {
  return order.failure?.class === "system";
}

export function isCustomerFailure(order: Order): boolean {
  return order.failure?.class === "customer";
}

export function isTerminal(order: Order): boolean {
  return (
    order.status === "successful" ||
    order.status === "failed" ||
    order.status === "cancelled"
  );
}

export function isCancellable(order: Order): boolean {
  return order.status === "pending";
}

export function orderDetailQuery(orderId: string): string {
  return "?order=" + encodeURIComponent(orderId);
}

export function walletOwnerLabel(owner: OrderWalletOwner): string {
  if (owner === "customer") return "Atlas customer wallet";
  if (owner === "reseller") return "Reseller commission wallet";
  return "Storefront user wallet";
}