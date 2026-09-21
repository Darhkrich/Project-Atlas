import type {
  RegisteredDestination,
  ResellerDestinationStoreState,
} from "@/lib/reseller/types/wallet";

const ANCHOR_MS = Date.now();
const DAY = 86_400_000;

const ago = (ms: number) => new Date(ANCHOR_MS - ms).toISOString();

function seedDestinations(): Record<string, RegisteredDestination | null> {
  return {
    "RS-001": {
      id: "DST-RS-001",
      resellerId: "RS-001",
      method: "momo",
      provider: "MTN",
      accountNumber: "024 555 6666",
      maskedLabel: "**** 6666",
      nameOnAccount: "Kwame Store",
      verifiedAt: ago(60 * DAY),
    },
  };
}

let store: ResellerDestinationStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): ResellerDestinationStoreState {
  if (!store) store = { destinations: seedDestinations() };
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isDestinationStoreLoaded(): boolean {
  return store !== null;
}

export function getDestinationStore(): ResellerDestinationStoreState {
  return ensureStore();
}

export function subscribeToDestinationStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDestinationFor(
  resellerId: string
): RegisteredDestination | null {
  return ensureStore().destinations[resellerId] ?? null;
}

export function internalSetDestination(
  resellerId: string,
  destination: RegisteredDestination | null
): RegisteredDestination | null {
  const s = ensureStore();
  s.destinations[resellerId] = destination;
  notify();
  return destination;
}

export function internalPatchDestination(
  resellerId: string,
  updater: (d: RegisteredDestination) => RegisteredDestination
): RegisteredDestination | null {
  const s = ensureStore();
  const current = s.destinations[resellerId];
  if (!current) return null;
  s.destinations[resellerId] = updater(current);
  notify();
  return s.destinations[resellerId];
}

export function resetDestinationStoreForTest(): void {
  store = { destinations: seedDestinations() };
  notify();
}