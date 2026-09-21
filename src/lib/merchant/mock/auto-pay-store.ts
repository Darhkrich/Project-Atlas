import type {
  MerchantAutoPayConfig,
  MerchantAutoPayStoreState,
} from "@/lib/merchant/types/wallet";

const REFERENCE_NOW_MS = Date.now();
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

const SEED: MerchantAutoPayStoreState = {
  config: {
    enabled: true,
    source: "billing_wallet",
    updatedAt: ago(30 * DAY),
    updatedBy: "System",
  },
};

let store: MerchantAutoPayStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantAutoPayStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isMerchantAutoPayStoreLoaded(): boolean {
  return store !== null;
}

export function getMerchantAutoPayStore(): MerchantAutoPayStoreState {
  return ensureStore();
}

export function subscribeToMerchantAutoPayStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchAutoPayConfig(
  updater: (c: MerchantAutoPayConfig) => MerchantAutoPayConfig
): MerchantAutoPayConfig {
  const s = ensureStore();
  s.config = updater(s.config);
  notify();
  return s.config;
}

export function resetMerchantAutoPayStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}