// lib/admin/support/interpolate.ts

import type { SupportConversation } from "@/lib/admin/types/support";

export function interpolateCannedResponse(
  content: string,
  c: SupportConversation
): string {
  const values: Record<string, string> = {
    contactName: c.contactName ?? c.userName,
    userName: c.userName,
    amount: "",
    service: "",
    transactionRef: "",
    orderRef: "",
    plan: "",
    providerName: "",
  };

  if (c.linkedEntity?.kind === "digital_transaction") {
    values.amount = String(c.linkedEntity.amount);
    values.service = c.linkedEntity.service;
    values.transactionRef = c.linkedEntity.transactionId;
    values.providerName = c.linkedEntity.providerName;
  } else if (c.linkedEntity?.kind === "reseller_order") {
    values.amount = String(c.linkedEntity.commission);
    values.orderRef = c.linkedEntity.orderId;
  } else if (c.linkedEntity?.kind === "merchant_account") {
    values.plan = c.linkedEntity.plan;
  }

  return content.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : value;
  });
}