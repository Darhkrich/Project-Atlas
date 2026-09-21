import type {
  Promotion,
  PromotionAuditEntry,
} from "@/lib/admin/types/promotion";
import { mockPromotions } from "./promotions";

interface StoreState {
  promotions: Promotion[];
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
  state.promotions = structuredClone(mockPromotions);
  state.loaded = true;
}

export interface PromotionActor {
  name: string;
  email: string;
}

export type PromotionInput = Omit<
  Promotion,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "endedAt" | "endedReason"
>;

export interface PromotionMutationResult {
  ok: boolean;
  promotion?: Promotion;
  error?: string;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToPromotionStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getPromotions(): Promotion[] {
  ensureLoaded();
  return state.promotions;
}

export function getPromotionById(id: string): Promotion | undefined {
  ensureLoaded();
  return state.promotions.find((p) => p.id === id);
}

export function getPromotionAudit(): PromotionAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getPromotionAuditFor(id: string): PromotionAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.promotionId === id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/* ------------------------------ Validation ---------------------------- */

export function validatePromotionInput(
  input: PromotionInput
): string | null {
  const trimmed = input.name.trim();
  if (!trimmed) return "Name is required.";
  if (trimmed.length > 80) return "Name must be 80 characters or fewer.";
  if (!input.description.trim()) return "Description is required.";
  if (input.surfaces.length === 0) {
    return "Choose at least one surface.";
  }

  const start = new Date(input.startDate).getTime();
  const end = new Date(input.endDate).getTime();
  if (!Number.isFinite(start)) return "Start date is invalid.";
  if (!Number.isFinite(end)) return "End date is invalid.";
  if (end <= start) return "End date must be after start date.";

  const m = input.mechanic;
  if (m.kind === "auto_discount") {
    if (!Number.isFinite(m.value) || m.value <= 0) {
      return "Discount value must be greater than zero.";
    }
    if (m.mode === "percent" && m.value > 100) {
      return "Percent discount cannot exceed 100.";
    }
  }
  if (m.kind === "cashback") {
    if (!Number.isFinite(m.percent) || m.percent <= 0 || m.percent > 100) {
      return "Cashback percent must be between 0 and 100.";
    }
  }
  if (m.kind === "atlas_points") {
    if (!Number.isFinite(m.pointsPerGHS) || m.pointsPerGHS <= 0) {
      return "Points per GHS must be greater than zero.";
    }
    if (input.audience !== "customer") {
      return "Atlas points are only available to customers.";
    }
  }
  if (m.kind === "subscription_discount") {
    if (!Number.isFinite(m.percent) || m.percent <= 0 || m.percent > 100) {
      return "Subscription discount percent must be between 0 and 100.";
    }
    if (input.audience !== "merchant") {
      return "Subscription discounts are only available to merchants.";
    }
  }

  const c = input.conditions;
  if (typeof c.minOrders === "number" && c.minOrders < 0) {
    return "Minimum orders cannot be negative.";
  }
  if (typeof c.minSpendGHS === "number" && c.minSpendGHS < 0) {
    return "Minimum spend cannot be negative.";
  }
  if (typeof c.maxSpendGHS === "number" && c.maxSpendGHS < 0) {
    return "Maximum spend cannot be negative.";
  }
  if (
    typeof c.minSpendGHS === "number" &&
    typeof c.maxSpendGHS === "number" &&
    c.maxSpendGHS < c.minSpendGHS
  ) {
    return "Maximum spend must be greater than minimum spend.";
  }
  if (input.audience === "merchant" && c.tierIds && c.tierIds.length > 0) {
    return "Tier targeting is only available to resellers.";
  }
  if (
    input.audience === "customer" &&
    c.tierIds &&
    c.tierIds.length > 0
  ) {
    return "Tier targeting is only available to resellers.";
  }

  return null;
}

/* ------------------------------ Mutations ----------------------------- */

function nextPromotionId(existing: Promotion[]): string {
  let max = 0;
  for (const p of existing) {
    const m = /^PRO-(\d+)$/.exec(p.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `PRO-${String(max + 1).padStart(3, "0")}`;
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
  const promotion: Promotion = {
    id: nextPromotionId(state.promotions),
    name: input.name.trim(),
    description: input.description.trim(),
    audience: input.audience,
    surfaces: [...input.surfaces],
    conditions: { ...input.conditions },
    mechanic: { ...input.mechanic },
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
  push("Audience", current.audience, input.audience);
  push(
    "Surfaces",
    current.surfaces.join("|"),
    input.surfaces.join("|")
  );
  push(
    "Mechanic",
    current.mechanic.kind,
    input.mechanic.kind
  );
  push("Start", current.startDate, input.startDate);
  push("End", current.endDate, input.endDate);

  const nowIso = new Date().toISOString();
  const next: Promotion = {
    ...current,
    name: input.name.trim(),
    description: input.description.trim(),
    audience: input.audience,
    surfaces: [...input.surfaces],
    conditions: { ...input.conditions },
    mechanic: { ...input.mechanic },
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
  const next: Promotion = {
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