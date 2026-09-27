// lib/domains/treasury/pools.ts
//
// Audience-to-pool mapping. Single source of truth for every emission
// that needs to attribute an event to a liability pool. The provider
// settlement pool is not user money. It is the obligation Atlas owes
// providers between order success and payout settle.

import type {
  TreasuryCounterparty,
  TreasuryLiabilityPoolType,
} from "./types";
import type {
  Order,
  OrderAudience,
  OrderWalletOwner,
} from "@/lib/admin/types/orders";

export const PROVIDER_SETTLEMENT_POOL: TreasuryLiabilityPoolType =
  "provider_settlement_pending";

export function poolForOrderAudience(
  audience: OrderAudience
): TreasuryLiabilityPoolType {
  if (audience === "direct") return "customer";
  if (audience === "storefront_user") return "storefront_user";
  return "reseller";
}

export function poolForWalletOwner(
  owner: OrderWalletOwner
): TreasuryLiabilityPoolType {
  if (owner === "customer") return "customer";
  if (owner === "storefront_user") return "storefront_user";
  return "reseller";
}

export function counterpartyForOrder(order: Order): TreasuryCounterparty {
  if (order.audience === "direct") {
    return {
      type: "customer",
      id: order.customerId ?? order.id,
      name: order.customer.name,
    };
  }
  if (order.audience === "storefront_user") {
    return {
      type: "storefront_user",
      id: order.storefrontUserId ?? order.id,
      name: order.customer.name,
    };
  }
  return {
    type: "reseller",
    id: order.resellerId ?? order.id,
    name: order.reseller?.name ?? order.customer.name,
  };
}

export function ownerIdForOrder(order: Order): string {
  if (order.audience === "direct") return order.customerId ?? order.id;
  if (order.audience === "storefront_user") {
    return order.storefrontUserId ?? order.id;
  }
  return order.resellerId ?? order.id;
}

export function isWalletFunded(order: Order): boolean {
  return order.paymentMethodId === "wallet" && order.walletDebit !== undefined;
}