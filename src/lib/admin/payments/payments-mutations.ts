import type {
  PaymentFlag,
  PaymentFlagReason,
  PaymentReconciliation,
} from "@/lib/admin/types/payment";
import {
  getPaymentStore,
  internalAddFlag,
  internalAddReconciliation,
  internalPatchPayment,
  internalResolveFlag,
} from "@/lib/admin/mock/payments-store";

export interface PaymentsActor {
  name: string;
  email: string;
}

export interface PaymentsMutationResult {
  ok: boolean;
  error?: string;
}

function isRetryableReason(reason: string | undefined): {
  ok: boolean;
  error?: string;
} {
  const r = (reason ?? "").toLowerCase();
  if (r.includes("insufficient")) {
    return {
      ok: false,
      error:
        "Cannot retry: the wallet had insufficient balance. The owner must fund the wallet first.",
    };
  }
  if (r.includes("declined by customer")) {
    return {
      ok: false,
      error: "Cannot retry: the customer declined the charge.",
    };
  }
  if (r.includes("customer cancelled")) {
    return {
      ok: false,
      error: "Cannot retry: the customer cancelled this payment.",
    };
  }
  return { ok: true };
}

export function retryPayment(
  paymentId: string,
  actor: PaymentsActor
): PaymentsMutationResult {
  void actor;
  const store = getPaymentStore();
  const payment = store.payments.find((p) => p.id === paymentId);
  if (!payment) return { ok: false, error: "Payment not found." };
  if (payment.status !== "failed") {
    return { ok: false, error: "Only failed payments can be retried." };
  }
  const reasonCheck = isRetryableReason(payment.failureReason);
  if (!reasonCheck.ok) {
    return { ok: false, error: reasonCheck.error };
  }
  const now = new Date().toISOString();
  internalPatchPayment(paymentId, (p) => ({
    ...p,
    status: "pending",
    updatedAt: now,
    failureReason: undefined,
    timeline: [
      ...p.timeline,
      {
        timestamp: now,
        label: "Retry queued",
        status: "info",
      },
    ],
  }));
  return { ok: true };
}

export function reconcilePayment(
  paymentId: string,
  providerReference: string,
  note: string,
  actor: PaymentsActor
): PaymentsMutationResult {
  const trimmedRef = providerReference.trim();
  if (!trimmedRef) return { ok: false, error: "Provider reference is required." };
  const store = getPaymentStore();
  const payment = store.payments.find((p) => p.id === paymentId);
  if (!payment) return { ok: false, error: "Payment not found." };

  const now = new Date().toISOString();
  const rec: PaymentReconciliation = {
    id: "REC-" + crypto.randomUUID(),
    paymentId,
    providerReference: trimmedRef,
    note: note.trim() || undefined,
    admin: { name: actor.name, email: actor.email },
    createdAt: now,
  };
  internalAddReconciliation(rec);

  if (payment.status === "failed") {
    internalPatchPayment(paymentId, (p) => ({
      ...p,
      status: "successful",
      failureReason: undefined,
      updatedAt: now,
      timeline: [
        ...p.timeline,
        {
          timestamp: now,
          label: "Reconciled as successful",
          status: "success",
        },
      ],
    }));
  }

  return { ok: true };
}

export function flagPayment(
  paymentId: string,
  reason: PaymentFlagReason,
  note: string,
  actor: PaymentsActor
): PaymentsMutationResult {
  const store = getPaymentStore();
  const payment = store.payments.find((p) => p.id === paymentId);
  if (!payment) return { ok: false, error: "Payment not found." };

  const now = new Date().toISOString();
  const flag: PaymentFlag = {
    id: "FLG-" + crypto.randomUUID(),
    paymentId,
    reason,
    note: note.trim() || undefined,
    admin: { name: actor.name, email: actor.email },
    createdAt: now,
  };
  internalAddFlag(flag);
  return { ok: true };
}

export function resolvePaymentFlag(
  flagId: string,
  resolutionNote: string,
  actor: PaymentsActor
): PaymentsMutationResult {
  const trimmed = resolutionNote.trim();
  if (!trimmed) return { ok: false, error: "Resolution note is required." };
  const now = new Date().toISOString();
  const result = internalResolveFlag(flagId, {
    resolvedAt: now,
    resolvedBy: { name: actor.name, email: actor.email },
    resolutionNote: trimmed,
  });
  return result ? { ok: true } : { ok: false, error: "Flag not found." };
}