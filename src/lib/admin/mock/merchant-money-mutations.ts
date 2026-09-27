// lib/admin/mock/merchant-money-mutations.ts
//
// Admin-side merchant money mutations that are NOT wallet balance
// operations. Dispute resolution is the only surviving function.
//
// Every other function that lived here (approveWithdrawal,
// rejectWithdrawal, updateAutoApproveConfig) was replaced during pool 4
// by the shared admin wrappers in
// lib/admin/ecommerce/payments/payment-mutations.ts and
// payment-config.ts. Those functions wrote to fields that no longer
// exist on this store.

import {
  getMerchantMoneyState,
  internalPatchDispute,
} from "./merchant-money-store";
import { appendAuditEntry } from "@/lib/domains/audit";

interface AdminActor {
  id: string;
  name: string;
  email: string;
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

export function logDisputeResolution(
  disputeId: string,
  resolutionNote: string,
  actor: AdminActor | null | undefined
): MutationResult {
  if (!actor) {
    throw new Error("No admin session. Mutation blocked.");
  }
  const trimmed = resolutionNote.trim();
  if (!trimmed) return { ok: false, error: "Resolution note is required." };

  const state = getMerchantMoneyState();
  const dispute = state.disputes.find((d) => d.id === disputeId);
  if (!dispute) return { ok: false, error: "Dispute not found." };

  const nowIso = new Date().toISOString();
  const updated = internalPatchDispute(disputeId, (d) => ({
    ...d,
    status: "resolved",
    resolutionNote: trimmed,
    resolvedAt: nowIso,
    resolvedBy: actor.email,
  }));
  if (!updated) return { ok: false, error: "Dispute not found." };

  appendAuditEntry({
    action: "wallet.merchant.dispute_resolve",
    resourceType: "wallet",
    resourceId: updated.merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { disputeId, resolutionNote: trimmed },
  });

  return { ok: true };
}