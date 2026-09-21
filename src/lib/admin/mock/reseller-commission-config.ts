import type { ResellerCommissionConfig } from "@/lib/admin/types/reseller-commission-wallet";

interface ConfigState {
  value: ResellerCommissionConfig;
}

const DEFAULT_THRESHOLD = 5000;
const DEFAULT_FEE_PERCENT = 0.5;
const MIN_THRESHOLD = 100;
const MAX_THRESHOLD = 100_000;
const MIN_FEE_PERCENT = 0;
const MAX_FEE_PERCENT = 10;

const state: ConfigState = {
  value: {
    withdrawalApprovalThreshold: DEFAULT_THRESHOLD,
    withdrawalFeePercent: DEFAULT_FEE_PERCENT,
    updatedAt: new Date().toISOString(),
    updatedBy: "System",
  },
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeToResellerCommissionConfig(
  listener: Listener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getResellerCommissionConfig(): ResellerCommissionConfig {
  return state.value;
}

export interface UpdateRulesPatch {
  withdrawalApprovalThreshold?: number;
  withdrawalFeePercent?: number;
}

export interface UpdateRulesResult {
  ok: boolean;
  value?: ResellerCommissionConfig;
  previous?: ResellerCommissionConfig;
  error?: string;
}

export function updateResellerWithdrawalRules(
  patch: UpdateRulesPatch,
  actor: { name: string; email: string }
): UpdateRulesResult {
  const next = { ...state.value };

  if (patch.withdrawalApprovalThreshold !== undefined) {
    const v = patch.withdrawalApprovalThreshold;
    if (!Number.isFinite(v) || !Number.isInteger(v)) {
      return { ok: false, error: "Threshold must be a whole number." };
    }
    if (v < MIN_THRESHOLD) {
      return {
        ok: false,
        error: "Threshold must be at least " + MIN_THRESHOLD + ".",
      };
    }
    if (v > MAX_THRESHOLD) {
      return {
        ok: false,
        error: "Threshold must be at most " + MAX_THRESHOLD + ".",
      };
    }
    next.withdrawalApprovalThreshold = v;
  }

  if (patch.withdrawalFeePercent !== undefined) {
    const v = patch.withdrawalFeePercent;
    if (!Number.isFinite(v)) {
      return { ok: false, error: "Fee rate must be a number." };
    }
    if (v < MIN_FEE_PERCENT || v > MAX_FEE_PERCENT) {
      return {
        ok: false,
        error:
          "Fee rate must be between " +
          MIN_FEE_PERCENT +
          " and " +
          MAX_FEE_PERCENT +
          ".",
      };
    }
    next.withdrawalFeePercent = v;
  }

  const previous = state.value;
  state.value = {
    ...next,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  };
  notify();
  return { ok: true, value: state.value, previous };
}

export const THRESHOLD_BOUNDS = {
  min: MIN_THRESHOLD,
  max: MAX_THRESHOLD,
  defaultValue: DEFAULT_THRESHOLD,
} as const;

export const FEE_PERCENT_BOUNDS = {
  min: MIN_FEE_PERCENT,
  max: MAX_FEE_PERCENT,
  defaultValue: DEFAULT_FEE_PERCENT,
} as const;