import type {
  ResellerTier,
  TierPercentRates,
} from "@/lib/admin/types/commission";

const SEED: ResellerTier[] = [
  {
    id: "TIER-1",
    name: "Bronze",
    minMonthlySales: 0,
    extraCutPercent: 30,
    baseCommissionRates: {
      data: 0.4,
      airtime: 2,
      bills: 3,
      tv: 3,
      exam_pins: 3,
      other: 3,
    },
    perks: ["Standard support"],
  },
  {
    id: "TIER-2",
    name: "Silver",
    minMonthlySales: 5000,
    extraCutPercent: 25,
    baseCommissionRates: {
      data: 0.5,
      airtime: 3,
      bills: 4,
      tv: 4,
      exam_pins: 4,
      other: 4,
    },
    perks: ["Priority support"],
  },
  {
    id: "TIER-3",
    name: "Gold",
    minMonthlySales: 10000,
    extraCutPercent: 20,
    baseCommissionRates: {
      data: 0.6,
      airtime: 3.5,
      bills: 4.5,
      tv: 4.5,
      exam_pins: 4.5,
      other: 4.5,
    },
    perks: ["Priority support", "Lower withdrawal fees"],
  },
];

interface StoreState {
  tiers: ResellerTier[];
  audit: TierAuditEntry[];
  loaded: boolean;
}

const state: StoreState = {
  tiers: [],
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
  state.tiers = structuredClone(SEED);
  state.loaded = true;
}

export interface TierActor {
  name: string;
  email: string;
}

export interface TierFieldChange {
  field: string;
  from: string;
  to: string;
}

export interface TierAuditEntry {
  id: string;
  tierId: string;
  tierName: string;
  action: "Created" | "Updated" | "Deleted";
  admin: string;
  adminEmail: string;
  timestamp: string;
  changes?: TierFieldChange[];
}

export interface TierInput {
  name: string;
  minMonthlySales: number;
  extraCutPercent: number;
  baseCommissionRates: TierPercentRates;
  perks: string[];
}

export interface TierMutationResult {
  ok: boolean;
  tier?: ResellerTier;
  error?: string;
}

export function subscribeToTierStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTiers(): ResellerTier[] {
  ensureLoaded();
  return state.tiers;
}

export function getTierById(id: string): ResellerTier | undefined {
  ensureLoaded();
  return state.tiers.find((t) => t.id === id);
}

export function getTierAudit(): TierAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getTierAuditFor(tierId: string): TierAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.tierId === tierId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function validateTierInput(
  input: TierInput,
  existing: ResellerTier[],
  excludeId?: string
): string | null {
  const trimmed = input.name.trim();
  if (!trimmed) return "Tier name is required.";
  if (
    existing.some(
      (t) =>
        t.id !== excludeId &&
        t.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return "Another tier already uses that name.";
  }
  if (!Number.isFinite(input.minMonthlySales) || input.minMonthlySales < 0) {
    return "Minimum monthly revenue must be a non-negative number.";
  }
  if (
    !Number.isFinite(input.extraCutPercent) ||
    input.extraCutPercent < 0 ||
    input.extraCutPercent > 100
  ) {
    return "Extra cut must be between 0 and 100.";
  }
  const percentEntries = Object.entries(input.baseCommissionRates) as [
    keyof TierPercentRates,
    number,
  ][];
  for (const [key, value] of percentEntries) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return `${key.replace("_", " ")} rate must be between 0 and 100.`;
    }
  }
  return null;
}

function nextTierId(existing: ResellerTier[]): string {
  let max = 0;
  for (const t of existing) {
    const m = /^TIER-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `TIER-${max + 1}`;
}

function buildAuditEntry(input: {
  tierId: string;
  tierName: string;
  action: TierAuditEntry["action"];
  actor: TierActor;
  changes?: TierFieldChange[];
}): TierAuditEntry {
  return {
    id: crypto.randomUUID(),
    tierId: input.tierId,
    tierName: input.tierName,
    action: input.action,
    admin: input.actor.name,
    adminEmail: input.actor.email,
    timestamp: new Date().toISOString(),
    changes: input.changes,
  };
}

export function addTier(
  input: TierInput,
  actor: TierActor
): TierMutationResult {
  ensureLoaded();
  const error = validateTierInput(input, state.tiers);
  if (error) return { ok: false, error };

  const tier: ResellerTier = {
    id: nextTierId(state.tiers),
    name: input.name.trim(),
    minMonthlySales: input.minMonthlySales,
    extraCutPercent: input.extraCutPercent,
    baseCommissionRates: { ...input.baseCommissionRates },
    perks: [...input.perks],
  };

  state.tiers = [...state.tiers, tier];
  state.audit = [
    buildAuditEntry({
      tierId: tier.id,
      tierName: tier.name,
      action: "Created",
      actor,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true, tier };
}

export function updateTier(
  id: string,
  input: TierInput,
  actor: TierActor
): TierMutationResult {
  ensureLoaded();
  const current = state.tiers.find((t) => t.id === id);
  if (!current) return { ok: false, error: "Tier not found." };

  const error = validateTierInput(input, state.tiers, id);
  if (error) return { ok: false, error };

  const changes: TierFieldChange[] = [];
  if (current.name !== input.name.trim()) {
    changes.push({ field: "Name", from: current.name, to: input.name.trim() });
  }
  if (current.minMonthlySales !== input.minMonthlySales) {
    changes.push({
      field: "Min monthly revenue",
      from: String(current.minMonthlySales),
      to: String(input.minMonthlySales),
    });
  }
  if (current.extraCutPercent !== input.extraCutPercent) {
    changes.push({
      field: "Extra cut",
      from: `${current.extraCutPercent}%`,
      to: `${input.extraCutPercent}%`,
    });
  }
  const rateKeys: (keyof TierPercentRates)[] = [
    "data",
    "airtime",
    "bills",
    "tv",
    "exam_pins",
    "other",
  ];
  for (const key of rateKeys) {
    if (current.baseCommissionRates[key] !== input.baseCommissionRates[key]) {
      changes.push({
        field: key.replace("_", " "),
        from: `${current.baseCommissionRates[key].toFixed(2)}%`,
        to: `${input.baseCommissionRates[key].toFixed(2)}%`,
      });
    }
  }
  if (current.perks.join("|") !== input.perks.join("|")) {
    changes.push({
      field: "Perks",
      from: current.perks.join(", ") || "None",
      to: input.perks.join(", ") || "None",
    });
  }

  const next: ResellerTier = {
    ...current,
    name: input.name.trim(),
    minMonthlySales: input.minMonthlySales,
    extraCutPercent: input.extraCutPercent,
    baseCommissionRates: { ...input.baseCommissionRates },
    perks: [...input.perks],
  };

  state.tiers = state.tiers.map((t) => (t.id === id ? next : t));
  state.audit = [
    buildAuditEntry({
      tierId: id,
      tierName: next.name,
      action: "Updated",
      actor,
      changes,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true, tier: next };
}

export function removeTier(
  id: string,
  actor: TierActor,
  resellerCount: number
): TierMutationResult {
  ensureLoaded();
  const current = state.tiers.find((t) => t.id === id);
  if (!current) return { ok: false, error: "Tier not found." };
  if (resellerCount > 0) {
    return {
      ok: false,
      error: `${resellerCount} reseller${
        resellerCount === 1 ? " is" : "s are"
      } on this tier. Reassign them before deleting.`,
    };
  }

  state.tiers = state.tiers.filter((t) => t.id !== id);
  state.audit = [
    buildAuditEntry({
      tierId: id,
      tierName: current.name,
      action: "Deleted",
      actor,
    }),
    ...state.audit,
  ];
  notify();
  return { ok: true };
}