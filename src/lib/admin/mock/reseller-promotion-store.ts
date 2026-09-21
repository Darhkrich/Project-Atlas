import type {
  PromotionAuditEntry,
  ResellerPromotion,
} from "@/lib/admin/types/reseller-promotion";
import { mockResellerPromotions } from "./reseller-promotions";

interface StoreState {
  promotions: ResellerPromotion[];
  audit: PromotionAuditEntry[];
  loaded: boolean;
}

const state: StoreState = {
  promotions: [],
  audit: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.promotions = structuredClone(mockResellerPromotions);
  state.loaded = true;
}

export interface PromotionActor {
  name: string;
  email: string;
}

export interface PromotionInput {
  name: string;
  description: string;
  scope: ResellerPromotion["scope"];
  tierId?: string;
  resellerIds?: string[];
  serviceCategories?: ResellerPromotion["serviceCategories"];
  boostPercentPoints: number;
  startDate: string;
  endDate: string;
}

export interface PromotionMutationResult {
  ok: boolean;
  promotion?: ResellerPromotion;
  error?: string;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToPromotionStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getPromotions(): ResellerPromotion[] {
  ensureLoaded();
  return state.promotions;
}

export function getPromotionById(
  id: string
): ResellerPromotion | undefined {
  ensureLoaded();
  return state.promotions.find((p) => p.id === id);
}

export function getPromotionAudit(): PromotionAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getPromotionAuditFor(
  promotionId: string
): PromotionAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.promotionId === promotionId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/* ------------------------------ Validation ---------------------------- */

export function validatePromotionInput(input: PromotionInput): string | null {
  const trimmed = input.name.trim();
  if (!trimmed) return "Name is required.";
  if (trimmed.length > 80) return "Name must be 80 characters or fewer.";
  if (!input.description.trim()) return "Description is required.";
  if (!Number.isFinite(input.boostPercentPoints)) {
    return "Boost must be a number.";
  }
  if (input.boostPercentPoints <= 0) return "Boost must be greater than zero.";
  if (input.boostPercentPoints > 20) return "Boost must be 20 or less.";
  const start = new Date(input.startDate).getTime();
  const end = new Date(input.endDate).getTime();
  if (!Number.isFinite(start)) return "Start date is invalid.";
  if (!Number.isFinite(end)) return "End date is invalid.";
  if (end <= start) return "End date must be after start date.";
  if (input.scope === "tier" && !input.tierId) return "Choose a tier.";
  if (
    input.scope === "resellers" &&
    (!input.resellerIds || input.resellerIds.length === 0)
  ) {
    return "Choose at least one reseller.";
  }
  if (
    input.scope === "service" &&
    (!input.serviceCategories || input.serviceCategories.length === 0)
  ) {
    return "Choose at least one service.";
  }
  return null;
}

/* ------------------------------ Mutations ----------------------------- */

function nextPromotionId(existing: ResellerPromotion[]): string {
  let max = 0;
  for (const p of existing) {
    const m = /^PROMO-(\d+)$/.exec(p.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `PROMO-${String(max + 1).padStart(3, "0")}`;
}

function buildAudit(input: {
  promotionId: string;
  promotionName: string;
  action: PromotionAuditEntry["action"];
  actor: PromotionActor;
  changes?: PromotionAuditEntry["changes"];
  reason?: string;
}): PromotionAuditEntry {
  return {
    id: crypto.randomUUID(),
    promotionId: input.promotionId,
    promotionName: input.promotionName,
    action: input.action,
    admin: input.actor.name,
    adminEmail: input.actor.email,
    timestamp: new Date().toISOString(),
    changes: input.changes,
    reason: input.reason,
  };
}

export function createPromotion(
  input: PromotionInput,
  actor: PromotionActor
): PromotionMutationResult {
  ensureLoaded();
  const error = validatePromotionInput(input);
  if (error) return { ok: false, error };

  const nowIso = new Date().toISOString();
  const promotion: ResellerPromotion = {
    id: nextPromotionId(state.promotions),
    name: input.name.trim(),
    description: input.description.trim(),
    scope: input.scope,
    tierId: input.scope === "tier" ? input.tierId : undefined,
    resellerIds:
      input.scope === "resellers" ? [...(input.resellerIds ?? [])] : undefined,
    serviceCategories:
      input.scope === "service"
        ? [...(input.serviceCategories ?? [])]
        : undefined,
    boostPercentPoints: input.boostPercentPoints,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: actor.name,
  };

  state.promotions = [...state.promotions, promotion];
  state.audit = [
    buildAudit({
      promotionId: promotion.id,
      promotionName: promotion.name,
      action: "Created",
      actor,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true, promotion };
}

export function updatePromotion(
  id: string,
  input: PromotionInput,
  actor: PromotionActor
): PromotionMutationResult {
  ensureLoaded();
  const current = state.promotions.find((p) => p.id === id);
  if (!current) return { ok: false, error: "Promotion not found." };
  if (current.endedAt) {
    return { ok: false, error: "Ended promotions cannot be edited." };
  }
  const error = validatePromotionInput(input);
  if (error) return { ok: false, error };

  const changes: PromotionAuditEntry["changes"] = [];
  const push = (field: string, from: string, to: string) => {
    if (from !== to) changes.push({ field, from, to });
  };
  push("Name", current.name, input.name.trim());
  push("Description", current.description, input.description.trim());
  push("Scope", current.scope, input.scope);
  push(
    "Boost",
    `${current.boostPercentPoints}pp`,
    `${input.boostPercentPoints}pp`
  );
  push("Start", current.startDate, input.startDate);
  push("End", current.endDate, input.endDate);

  const nowIso = new Date().toISOString();
  const next: ResellerPromotion = {
    ...current,
    name: input.name.trim(),
    description: input.description.trim(),
    scope: input.scope,
    tierId: input.scope === "tier" ? input.tierId : undefined,
    resellerIds:
      input.scope === "resellers" ? [...(input.resellerIds ?? [])] : undefined,
    serviceCategories:
      input.scope === "service"
        ? [...(input.serviceCategories ?? [])]
        : undefined,
    boostPercentPoints: input.boostPercentPoints,
    startDate: input.startDate,
    endDate: input.endDate,
    updatedAt: nowIso,
  };

  state.promotions = state.promotions.map((p) => (p.id === id ? next : p));
  state.audit = [
    buildAudit({
      promotionId: id,
      promotionName: next.name,
      action: "Updated",
      actor,
      changes,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true, promotion: next };
}

export function endPromotion(
  id: string,
  reason: string,
  actor: PromotionActor
): PromotionMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const current = state.promotions.find((p) => p.id === id);
  if (!current) return { ok: false, error: "Promotion not found." };
  if (current.endedAt) {
    return { ok: false, error: "Already ended." };
  }

  const nowIso = new Date().toISOString();
  const next: ResellerPromotion = {
    ...current,
    endedAt: nowIso,
    endedReason: trimmed,
    updatedAt: nowIso,
  };

  state.promotions = state.promotions.map((p) => (p.id === id ? next : p));
  state.audit = [
    buildAudit({
      promotionId: id,
      promotionName: next.name,
      action: "Ended",
      actor,
      reason: trimmed,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true, promotion: next };
}

export function deletePromotion(
  id: string,
  actor: PromotionActor
): PromotionMutationResult {
  ensureLoaded();
  const current = state.promotions.find((p) => p.id === id);
  if (!current) return { ok: false, error: "Promotion not found." };

  const now = Date.now();
  const start = new Date(current.startDate).getTime();
  const end = new Date(current.endDate).getTime();
  const isActive = !current.endedAt && start <= now && end >= now;
  if (isActive) {
    return {
      ok: false,
      error: "Active promotions must be ended before they can be deleted.",
    };
  }

  state.promotions = state.promotions.filter((p) => p.id !== id);
  state.audit = [
    buildAudit({
      promotionId: id,
      promotionName: current.name,
      action: "Deleted",
      actor,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true };
}