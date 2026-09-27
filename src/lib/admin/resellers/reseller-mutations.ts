// lib/admin/resellers/reseller-mutations.ts

import type {
  Reseller,
  ResellerActivityEntry,
  ResellerAuditEntry,
} from "@/lib/admin/types/reseller";
import {
  applyResellerPatch,
  addResellerToStore,
} from "@/lib/admin/mock/reseller-store";
import { getTierById } from "@/lib/admin/mock/reseller-tier-store";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  applyAdminWalletAdjustment,
  freezeResellerWallet as freezeResellerWalletPublic,
  unfreezeResellerWallet as unfreezeResellerWalletPublic,
  type ResellerAdjustmentMethod,
} from "@/lib/reseller/wallet/wallet-mutations";
import { internalEnsureResellerWallet } from "@/lib/reseller/mock/wallet-store";

export interface ResellerActor {
  id: string;
  name: string;
  email: string;
}

export interface MutationResult {
  ok: boolean;
  reseller?: Reseller;
  error?: string;
}

function makeAuditEntry(
  action: string,
  actor: ResellerActor
): ResellerAuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    admin: actor.email,
    action,
  };
}

function makeActivityEntry(action: string): ResellerActivityEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
  };
}

function withLogsAndPatch(
  current: Reseller,
  action: string,
  actor: ResellerActor,
  patch: Partial<Reseller>
): Reseller {
  return {
    ...current,
    ...patch,
    activityLog: [...current.activityLog, makeActivityEntry(action)],
    auditTrail: [...(current.auditTrail ?? []), makeAuditEntry(action, actor)],
  };
}

export function suspendReseller(
  id: string,
  reason: string,
  actor: ResellerActor
): MutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Suspended: " + trimmed, actor, {
      status: "suspended",
    })
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function reactivateReseller(
  id: string,
  actor: ResellerActor
): MutationResult {
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Reactivated", actor, { status: "active" })
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function verifyReseller(
  id: string,
  actor: ResellerActor
): MutationResult {
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Verified identity", actor, {
      verificationStatus: "verified",
      lastVerifiedAt: new Date().toISOString(),
      verificationRejectionReason: undefined,
    })
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function rejectResellerVerification(
  id: string,
  reason: string,
  actor: ResellerActor
): MutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return {
      ok: false,
      error: "Rejection reason must be at least 10 characters.",
    };
  }
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Verification rejected: " + trimmed, actor, {
      verificationStatus: "rejected",
      verificationRejectionReason: trimmed,
    })
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function adjustResellerWallet(
  id: string,
  businessName: string,
  amount: number,
  reason: string,
  actor: ResellerActor
): MutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Amount must be non-zero." };
  }

  const method: ResellerAdjustmentMethod = "atlas_wallet";
  const adjustResult = applyAdminWalletAdjustment({
    resellerId: id,
    resellerName: businessName,
    amount,
    reason: trimmed,
    method,
    actor: { id: actor.id, name: actor.name, email: actor.email },
  });

  if (!adjustResult.ok) {
    return { ok: false, error: adjustResult.error ?? "Adjustment failed." };
  }

  const direction = amount >= 0 ? "Credited" : "Debited";
  const action =
    direction +
    " wallet " +
    formatCurrency(Math.abs(amount)) +
    " via " +
    method +
    ". " +
    trimmed;

  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, action, actor, {})
  );

  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function freezeResellerWallet(
  id: string,
  reason: string,
  actor: ResellerActor
): MutationResult {
  const result = freezeResellerWalletPublic(id, reason, {
    id: actor.id,
    name: actor.name,
    email: actor.email,
  });
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Could not freeze wallet." };
  }
  const patched = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Wallet frozen. " + reason.trim(), actor, {})
  );
  return patched
    ? { ok: true, reseller: patched }
    : { ok: false, error: "Reseller not found." };
}

export function unfreezeResellerWallet(
  id: string,
  actor: ResellerActor
): MutationResult {
  const result = unfreezeResellerWalletPublic(id, {
    id: actor.id,
    name: actor.name,
    email: actor.email,
  });
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Could not unfreeze wallet." };
  }
  const patched = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Wallet unfrozen.", actor, {})
  );
  return patched
    ? { ok: true, reseller: patched }
    : { ok: false, error: "Reseller not found." };
}

export function assignResellerTier(
  id: string,
  tierId: string,
  actor: ResellerActor
): MutationResult {
  const tier = getTierById(tierId);
  if (!tier) return { ok: false, error: "Tier not found." };
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Tier changed to " + tier.name, actor, {
      tierId: tier.id,
      tierName: tier.name,
    })
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function sendResellerNotification(
  id: string,
  channel: "email" | "sms" | "push",
  message: string,
  actor: ResellerActor
): MutationResult {
  const channelLabel = channel.toUpperCase();
  void message;
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Notification sent via " + channelLabel, actor, {})
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export function resetResellerSecurity(
  id: string,
  actor: ResellerActor
): MutationResult {
  const result = applyResellerPatch(id, (r) =>
    withLogsAndPatch(r, "Security reset. All sessions revoked.", actor, {})
  );
  return result
    ? { ok: true, reseller: result }
    : { ok: false, error: "Reseller not found." };
}

export interface OnboardResellerInput {
  businessName: string;
  storeName: string;
  contactPerson: string;
  email: string;
  phone: string;
  tierId?: string;
}

export function onboardReseller(
  input: OnboardResellerInput,
  actor: ResellerActor
): Reseller {
  const tier = input.tierId ? getTierById(input.tierId) : undefined;
  const nowIso = new Date().toISOString();
  const id = "RS-" + crypto.randomUUID().slice(0, 6).toUpperCase();
  const reseller: Reseller = {
    id,
    businessName: input.businessName,
    storeName: input.storeName,
    contactPerson: input.contactPerson,
    email: input.email,
    phone: input.phone,
    totalOrders: 0,
    totalRevenue: 0,
    status: "pending",
    verificationStatus: "not_submitted",
    joinedAt: nowIso,
    lastActive: nowIso,
    tierName: tier?.name,
    tierId: tier?.id,
    activityLog: [makeActivityEntry("Account created")],
    auditTrail: [makeAuditEntry("Created reseller account", actor)],
  };
  addResellerToStore(reseller);
  internalEnsureResellerWallet(id, input.businessName);
  return reseller;
}