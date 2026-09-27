// lib/domains/orders/emit-order-settled.ts
//
// Shared treasury emission for order success. Called by the placement
// path in this batch. The retry-success path will call the same helper
// once Order carries providerCost.

import type { Order } from "@/lib/admin/types/orders";
import type { TreasuryActor } from "@/lib/domains/treasury/types";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import {
  PROVIDER_SETTLEMENT_POOL,
  counterpartyForOrder,
  ownerIdForOrder,
  poolForOrderAudience,
  poolForWalletOwner,
} from "@/lib/domains/treasury/pools";

const SYSTEM_TREASURY_ACTOR: TreasuryActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

export interface EmitOrderSettledInput {
  order: Order;
  providerCost: number | null;
  actor?: TreasuryActor;
}

export function emitOrderSettled(input: EmitOrderSettledInput): void {
  const { order, providerCost } = input;
  const actor = input.actor ?? SYSTEM_TREASURY_ACTOR;

  const isWallet = order.paymentMethodId === "wallet";

  if (!isWallet) {
    const kind =
      order.audience === "storefront_user"
        ? "storefront_order_credit"
        : "order_settlement_credit";

    emitLedgerEvent({
      kind,
      direction: "in",
      amount: order.amount,
      ownerId: ownerIdForOrder(order),
      counterparty: counterpartyForOrder(order),
      reference: order.id,
      description: "Order settlement " + order.id,
      actor,
      relatedEventId: order.id,
    });
  }

  if (providerCost === null || providerCost <= 0) return;

  const sourcePool =
    isWallet && order.walletDebit
      ? poolForWalletOwner(order.walletDebit.walletOwner)
      : poolForOrderAudience(order.audience);

  emitLedgerEvent({
    kind: "internal_reclassification",
    direction: "internal",
    amount: providerCost,
    poolType: PROVIDER_SETTLEMENT_POOL,
    counterpartyPoolType: sourcePool,
    ownerId: ownerIdForOrder(order),
    counterparty: counterpartyForOrder(order),
    reference: order.id + "-accrual",
    description: "Provider settlement accrual for " + order.id,
    actor,
    relatedEventId: order.id,
  });
}