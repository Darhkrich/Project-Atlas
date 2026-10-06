/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { CustomerOrder } from "@/contexts/orders-context";
import type { OrderEvent, OrderEventActor } from "./types";
import { appendAuditEntry } from "@/lib/domains/audit";
import { getWalletConfig } from "@/lib/domains/wallet/config-store";
import {
  recordMerchantRefund,
  type RecordMerchantRefundResult,
} from "@/lib/domains/wallet/merchant-money/refund-mutations";
import type { MerchantMoneyActor } from "@/lib/domains/wallet/merchant-money/types";
import { markOrderRefunded } from "./mutations";
import { validateRefundAmount } from "./validation";

/**
 * Merchant-scoped refund reasons. Distinct from the Atlas-side
 * RefundReasonCustomer set because a merchant refunds their own order
 * for reasons about the product, not the service provider.
 */
export type MerchantRefundReason =
  | "customer_request"
  | "product_not_as_described"
  | "damaged_on_arrival"
  | "wrong_item"
  | "duplicate_order"
  | "other";

export const MERCHANT_REFUND_REASON_LABELS: Record<
  MerchantRefundReason,
  string
> = {
  customer_request: "Customer requested",
  product_not_as_described: "Product not as described",
  damaged_on_arrival: "Damaged on arrival",
  wrong_item: "Wrong item sent",
  duplicate_order: "Duplicate order",
  other: "Other",
};

export interface MerchantRefundInput {
  order: CustomerOrder;
  amount: number;
  reason: MerchantRefundReason;
  reasonNote?: string;
}

export interface RefundContext {
  updateOrder: (orderId: string, patch: Partial<CustomerOrder>) => void;
}

export interface MerchantRefundResult {
  ok: boolean;
  error?: string;
  refundId?: string;
  treasuryEventId?: string;
  requiresApproval?: boolean;
}

/**
 * Sums the amounts from the order's prior refund events. The order
 * carries `refundIds` and the events carry the amounts in metadata.
 * That is the only source of truth for "how much has been refunded so
 * far" until the admin refunds store carries merchant refunds.
 */
export function computeAlreadyRefunded(order: CustomerOrder): number {
  let total = 0;
  for (const event of order.events) {
    if (event.type !== "refunded") continue;
    const raw = event.metadata?.amount;
    if (typeof raw !== "string") continue;
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) total += parsed;
  }
  return total;
}

export function remainingRefundable(order: CustomerOrder): number {
  const already = computeAlreadyRefunded(order);
  const remaining = order.total - already;
  return remaining > 0 ? remaining : 0;
}

function describeRefund(
  amount: number,
  reason: MerchantRefundReason,
  reasonNote: string | undefined
): string {
  const amountText = "GH\u20B5 " + amount.toFixed(2);
  const note = reasonNote?.trim();
  if (note && note.length > 0) {
    return "Refund of " + amountText + " issued. " + note;
  }
  return (
    "Refund of " +
    amountText +
    " issued. Reason: " +
    MERCHANT_REFUND_REASON_LABELS[reason] +
    "."
  );
}

export function createMerchantRefund(
  input: MerchantRefundInput,
  merchant: MerchantMoneyActor,
  ctx: RefundContext,
  nowMs: number
): MerchantRefundResult {
  const { order, amount, reason, reasonNote } = input;

  if (
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "partially_refunded"
  ) {
    return {
      ok: false,
      error: "Only paid orders can be refunded.",
    };
  }

  const alreadyRefunded = computeAlreadyRefunded(order);

  const validationError = validateRefundAmount(
    amount,
    order.total,
    alreadyRefunded
  );
  if (validationError) {
    return { ok: false, error: validationError.message };
  }

  const config = getWalletConfig();
  if (amount > config.refundAutoApproveThreshold) {
    return {
      ok: false,
      error:
        "Refunds above GH\u20B5 " +
        config.refundAutoApproveThreshold.toFixed(2) +
        " need admin review. Contact Atlas support to process this refund.",
      requiresApproval: true,
    };
  }

  const remainingBefore = order.total - alreadyRefunded;
  const isPartial = amount < remainingBefore;

  const moneyResult: RecordMerchantRefundResult = recordMerchantRefund(
    {
      merchantId: merchant.id,
      amount,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      reason:
        reasonNote && reasonNote.trim().length > 0
          ? reasonNote.trim()
          : MERCHANT_REFUND_REASON_LABELS[reason],
    },
    merchant
  );

  if (!moneyResult.ok || !moneyResult.reference) {
    return {
      ok: false,
      error: moneyResult.error ?? "Refund could not be processed.",
    };
  }

  const refundId = moneyResult.reference;

  const actor: OrderEventActor = {
    id: merchant.id,
    name: merchant.name,
    email: merchant.email,
  };

  const orderMutation = markOrderRefunded(
    order,
    {
      amount,
      refundId,
      isPartial,
      description: describeRefund(amount, reason, reasonNote),
    },
    actor,
    nowMs
  );

  if (!orderMutation.ok || !orderMutation.patch) {
    return {
      ok: false,
      error:
        orderMutation.error?.message ??
        "Refund processed but the order was not updated.",
    };
  }

  ctx.updateOrder(order.id, orderMutation.patch);

  appendAuditEntry({
    action: "order.merchant.refund_create",
    resourceType: "order",
    resourceId: order.id,
    actor,
    metadata: {
      refundId,
      amount,
      isPartial,
      reason,
      walletReference: moneyResult.reference,
    },
  });

  return {
    ok: true,
    refundId,
    treasuryEventId: moneyResult.treasuryEventId,
  };
}