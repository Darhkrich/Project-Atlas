import type {
  Order,
  OrderAudience,
  OrderTimelineEvent,
  OrderWalletDebit,
} from "@/lib/admin/types/orders";
import type { PaymentMethodId } from "@/lib/admin/types/payment";
import {
  internalAppendOrder,
  notify,
} from "@/lib/admin/mock/orders-store";

interface AuditEntry {
  action: string;
  orderId: string;
  actor: string;
  meta?: Record<string, unknown>;
}

interface ActivityEntry {
  orderId: string;
  audience: OrderAudience;
  message: string;
}

function writeAudit(entry: AuditEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[admin-audit]", entry);
  }
}

function writeActivity(entry: ActivityEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[activity]", entry);
  }
}

export interface RecordResellerOrderInput {
  audience: OrderAudience;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  storefrontId?: string;
  storefrontUserId?: string;
  resellerId: string;
  resellerName: string;
  serviceId: string;
  providerId: string;
  networkId?: string;
  paymentMethodId: PaymentMethodId;
  amount: number;
  walletDebit?: OrderWalletDebit;
}

export interface RecordResellerOrderResult {
  ok: boolean;
  order?: Order;
  error?: string;
}

export function recordResellerOrder(
  input: RecordResellerOrderInput
): RecordResellerOrderResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }
  if (!input.customerName.trim()) {
    return { ok: false, error: "Customer name is required." };
  }
  if (!input.customerPhone.trim()) {
    return { ok: false, error: "Customer phone is required." };
  }
  if (!input.resellerId) {
    return { ok: false, error: "Reseller ID is required." };
  }
  if (!input.serviceId) {
    return { ok: false, error: "Service is required." };
  }

  const nowIso = new Date().toISOString();
  const orderId = "ATX-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const timeline: OrderTimelineEvent[] = [
    {
      type: "order_created",
      status: "info",
      timestamp: nowIso,
      label: "Order created",
    },
    {
      type: "delivered",
      status: "success",
      timestamp: nowIso,
      label: "Delivered",
    },
  ];

  const order: Order = {
    id: orderId,
    audience: input.audience,
    status: "successful",
    customer: {
      name: input.customerName.trim(),
      phone: input.customerPhone.trim(),
    },
    reseller: {
      id: input.resellerId,
      name: input.resellerName,
    },
    customerId: input.customerId,
    storefrontUserId: input.storefrontUserId,
    storefrontId: input.storefrontId,
    resellerId: input.resellerId,
    serviceId: input.serviceId,
    providerId: input.providerId,
    networkId: input.networkId,
    paymentMethodId: input.paymentMethodId,
    paymentId: undefined,
    amount: input.amount,
    commission: 0,
    failure: undefined,
    retryAttempts: 0,
    maxRetryAttempts: 3,
    nextRetryAt: undefined,
    lastRetriedAt: undefined,
    idempotencyKey: "idem-" + orderId,
    walletDebit: input.walletDebit,
    createdAt: nowIso,
    timeline,
  };

  internalAppendOrder(order);
  notify();

  writeActivity({
    orderId,
    audience: input.audience,
    message: "Order recorded for " + input.customerName,
  });
  writeAudit({
    action: "order.record_reseller",
    orderId,
    actor: input.storefrontUserId ?? input.resellerId,
    meta: {
      resellerId: input.resellerId,
      amount: input.amount,
      audience: input.audience,
    },
  });

  return { ok: true, order };
}