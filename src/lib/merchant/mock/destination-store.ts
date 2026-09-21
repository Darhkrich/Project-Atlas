import type {
  MerchantDestinationStoreState,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";

const REFERENCE_NOW_MS = Date.now();
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

const SEED: MerchantDestinationStoreState = {
  destination: {
    id: "MDST-MER-001",
    merchantId: "MER-001",
    method: "momo",
    provider: "MTN",
    accountNumber: "024 555 9001",
    maskedLabel: "**** 9001",
    nameOnAccount: "TechHub Store",
    verifiedAt: ago(60 * DAY),
  },
};

let store: MerchantDestinationStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantDestinationStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isMerchantDestinationStoreLoaded(): boolean {
  return store !== null;
}

export function getMerchantDestinationStore(): MerchantDestinationStoreState {
  return ensureStore();
}

export function subscribeToMerchantDestinationStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalSetDestination(
  destination: RegisteredDestination | null
): RegisteredDestination | null {
  const s = ensureStore();
  s.destination = destination;
  notify();
  return s.destination;
}

export function internalPatchDestination(
  updater: (d: RegisteredDestination) => RegisteredDestination
): RegisteredDestination | null {
  const s = ensureStore();
  if (!s.destination) return null;
  s.destination = updater(s.destination);
  notify();
  return s.destination;
}

export function resetMerchantDestinationStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}