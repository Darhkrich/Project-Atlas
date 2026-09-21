/* eslint-disable @typescript-eslint/no-unused-vars */
import { mockResellers } from "./resellers";
import type {
  Reseller,
} from "@/lib/admin/types/reseller";
import type {
  VerificationSlice,
  VerificationSnapshot,
} from "@/lib/admin/resellers/verification-projection";

interface StoreState {
  slices: Record<string, VerificationSlice>;
  loaded: boolean;
}

const state: StoreState = {
  slices: {},
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  const slices: Record<string, VerificationSlice> = {};
  for (const r of mockResellers) {
    slices[r.id] = {
      id: r.id,
      verificationStatus: r.verificationStatus,
      lastVerifiedAt: r.lastVerifiedAt,
      verificationRejectionReason: undefined,
      verificationSubmittedAt: undefined,
    };
  }
  state.slices = slices;
  state.loaded = true;
}

export function subscribeToVerificationStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVerificationSnapshot(): VerificationSnapshot {
  ensureLoaded();
  return { slices: state.slices };
}

export interface VerificationActor {
  name: string;
  email: string;
}

export interface VerificationMutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Verification mutations write a corresponding entry to the reseller's
 * audit trail by side-channel. The audit is stored on the reseller record
 * in the full store, not here. This store owns only the verification
 * slice. Consumers that need the audit read it from the resellers mock.
 */
export function verifyReseller(
  id: string,
  _actor: VerificationActor
): VerificationMutationResult {
  ensureLoaded();
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Reseller not found." };
  if (current.verificationStatus === "verified") {
    return { ok: false, error: "Already verified." };
  }
  const now = new Date().toISOString();
  state.slices = {
    ...state.slices,
    [id]: {
      ...current,
      verificationStatus: "verified",
      lastVerifiedAt: now,
      verificationRejectionReason: undefined,
    },
  };
  notify();
  return { ok: true };
}

export function rejectReseller(
  id: string,
  reason: string,
  _actor: VerificationActor
): VerificationMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return {
      ok: false,
      error: "Rejection reason must be at least 10 characters.",
    };
  }
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Reseller not found." };
  state.slices = {
    ...state.slices,
    [id]: {
      ...current,
      verificationStatus: "rejected",
      lastVerifiedAt: undefined,
      verificationRejectionReason: trimmed,
    },
  };
  notify();
  return { ok: true };
}

export function markSubmitted(
  id: string,
  submittedAt: string
): VerificationMutationResult {
  ensureLoaded();
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Reseller not found." };
  state.slices = {
    ...state.slices,
    [id]: {
      ...current,
      verificationSubmittedAt: submittedAt,
    },
  };
  notify();
  return { ok: true };
}

export function getSlice(id: string): VerificationSlice | undefined {
  ensureLoaded();
  return state.slices[id];
}

/**
 * Test-only reset used by no runtime caller. Kept for completeness.
 */
export function resetVerificationStore(): void {
  state.slices = {};
  state.loaded = false;
  notify();
}