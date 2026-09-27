import type {
  StorefrontFundingLedgerEntry,
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
  StorefrontUserWalletRecord,
  StorefrontUserWalletState,
  StorefrontWalletLedgerEntry,
} from "./storefront-user-types";

const STORAGE_KEY = "atlas-storefront-user-state-v1";

const DAY_MS = 86_400_000;

function loadSeed(): StorefrontUserWalletState {
  const now = Date.now();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  const wallets: Record<string, StorefrontUserWalletRecord> = {
    "SW-SF-001-SFU-001": {
      id: "SW-SF-001-SFU-001",
      ownerId: "SFU-001",
      ownerName: "Kwame Owusu",
      ownerEmail: "kwame.owusu@example.com",
      ownerPhone: "024 555 1001",
      storefrontId: "SF-001",
      resellerSlug: "tech-trends",
      storefrontName: "Tech Trends Storefront",
      balance: 120,
      currency: "GHS",
      status: "active",
      updatedAt: ago(DAY_MS * 3),
      lastFundingAt: ago(DAY_MS * 5),
      lastPurchaseAt: ago(DAY_MS * 3),
      lastRefundAt: null,
    },
    "SW-SF-001-SFU-002": {
      id: "SW-SF-001-SFU-002",
      ownerId: "SFU-002",
      ownerName: "Akosua Mensah",
      ownerEmail: "akosua.mensah@example.com",
      ownerPhone: "020 555 1002",
      storefrontId: "SF-001",
      resellerSlug: "tech-trends",
      storefrontName: "Tech Trends Storefront",
      balance: 340,
      currency: "GHS",
      status: "active",
      updatedAt: ago(DAY_MS * 1),
      lastFundingAt: ago(DAY_MS * 2),
      lastPurchaseAt: null,
      lastRefundAt: null,
    },
    "SW-SF-002-SFU-003": {
      id: "SW-SF-002-SFU-003",
      ownerId: "SFU-003",
      ownerName: "Yaw Asante",
      ownerEmail: "yaw.asante@example.com",
      ownerPhone: "027 555 1003",
      storefrontId: "SF-002",
      resellerSlug: "fashion-hub",
      storefrontName: "Fashion Hub",
      balance: 500,
      currency: "GHS",
      status: "active",
      updatedAt: ago(DAY_MS * 6),
      lastFundingAt: ago(DAY_MS * 10),
      lastPurchaseAt: ago(DAY_MS * 6),
      lastRefundAt: null,
    },
    "SW-SF-003-SFU-004": {
      id: "SW-SF-003-SFU-004",
      ownerId: "SFU-004",
      ownerName: "Nana Adwoa",
      ownerEmail: "nana.adwoa@example.com",
      ownerPhone: "055 555 1004",
      storefrontId: "SF-003",
      resellerSlug: "gadget-world",
      storefrontName: "Gadget World",
      balance: 85,
      currency: "GHS",
      status: "active",
      updatedAt: ago(DAY_MS * 4),
      lastFundingAt: ago(DAY_MS * 7),
      lastPurchaseAt: null,
      lastRefundAt: null,
    },
  };

  const fundingLedger: StorefrontWalletLedgerEntry[] = [
    {
      id: "SL-FUND-SF-001-SFU-001-01",
      walletId: "SW-SF-001-SFU-001",
      ownerId: "SFU-001",
      kind: "funding",
      amount: 200,
      method: "momo",
      provider: "MTN",
      maskedLabel: "**** 1001",
      reference: "REF-SF-001-1001",
      status: "successful",
      createdAt: ago(DAY_MS * 5),
      completedAt: ago(DAY_MS * 5),
    } as StorefrontFundingLedgerEntry,
    {
      id: "SL-FUND-SF-001-SFU-002-01",
      walletId: "SW-SF-001-SFU-002",
      ownerId: "SFU-002",
      kind: "funding",
      amount: 400,
      method: "card",
      provider: "Visa",
      maskedLabel: "**** 1002",
      reference: "REF-SF-001-1002",
      status: "successful",
      createdAt: ago(DAY_MS * 2),
      completedAt: ago(DAY_MS * 2),
    } as StorefrontFundingLedgerEntry,
    {
      id: "SL-FUND-SF-002-SFU-003-01",
      walletId: "SW-SF-002-SFU-003",
      ownerId: "SFU-003",
      kind: "funding",
      amount: 500,
      method: "momo",
      provider: "Vodafone",
      maskedLabel: "**** 1003",
      reference: "REF-SF-002-1003",
      status: "successful",
      createdAt: ago(DAY_MS * 10),
      completedAt: ago(DAY_MS * 10),
    } as StorefrontFundingLedgerEntry,
    {
      id: "SL-FUND-SF-002-SFU-003-02",
      walletId: "SW-SF-002-SFU-003",
      ownerId: "SFU-003",
      kind: "funding",
      amount: 250,
      method: "momo",
      provider: "Vodafone",
      maskedLabel: "**** 1003",
      reference: "REF-SF-002-1004",
      status: "successful",
      createdAt: ago(DAY_MS * 4),
      completedAt: ago(DAY_MS * 4),
    } as StorefrontFundingLedgerEntry,
    {
      id: "SL-FUND-SF-003-SFU-004-01",
      walletId: "SW-SF-003-SFU-004",
      ownerId: "SFU-004",
      kind: "funding",
      amount: 100,
      method: "momo",
      provider: "MTN",
      maskedLabel: "**** 1004",
      reference: "REF-SF-003-1005",
      status: "successful",
      createdAt: ago(DAY_MS * 7),
      completedAt: ago(DAY_MS * 7),
    } as StorefrontFundingLedgerEntry,
  ];

  return {
    wallets,
    fundingLedger,
    refundRequests: [],
    refundHistory: [],
  };
}

function readFromStorage(): StorefrontUserWalletState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorefrontUserWalletState;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.wallets ||
      !Array.isArray(parsed.fundingLedger) ||
      !Array.isArray(parsed.refundRequests) ||
      !Array.isArray(parsed.refundHistory)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(state: StorefrontUserWalletState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let store: StorefrontUserWalletState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): StorefrontUserWalletState {
  if (store) return store;
  const fromStorage = readFromStorage();
  store = fromStorage ?? loadSeed();
  return store;
}

function notify() {
  if (store) writeToStorage(store);
  for (const fn of listeners) fn();
}

export function isStorefrontUserStateLoaded(): boolean {
  return store !== null;
}

export function getStorefrontUserState(): StorefrontUserWalletState {
  return ensureStore();
}

export function subscribeToStorefrontUserState(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchStorefrontUserWallet(
  walletId: string,
  updater: (w: StorefrontUserWalletRecord) => StorefrontUserWalletRecord
): StorefrontUserWalletRecord | null {
  const s = ensureStore();
  const w = s.wallets[walletId];
  if (!w) return null;
  s.wallets[walletId] = updater(w);
  notify();
  return s.wallets[walletId];
}

export function internalSetStorefrontUserWallet(
  wallet: StorefrontUserWalletRecord
): StorefrontUserWalletRecord {
  const s = ensureStore();
  s.wallets[wallet.id] = wallet;
  notify();
  return wallet;
}

export function internalAppendStorefrontLedgerEntry(
  entry: StorefrontWalletLedgerEntry
): StorefrontWalletLedgerEntry {
  const s = ensureStore();
  s.fundingLedger = [entry, ...s.fundingLedger];
  notify();
  return entry;
}

export function internalAddStorefrontRefundRequest(
  req: StorefrontRefundRequest
): StorefrontRefundRequest {
  const s = ensureStore();
  s.refundRequests = [req, ...s.refundRequests];
  notify();
  return req;
}

export function internalRemoveStorefrontRefundRequest(
  requestId: string
): StorefrontRefundRequest | null {
  const s = ensureStore();
  const found = s.refundRequests.find((r) => r.id === requestId);
  if (!found) return null;
  s.refundRequests = s.refundRequests.filter((r) => r.id !== requestId);
  notify();
  return found;
}

export function internalPatchStorefrontRefundRequest(
  requestId: string,
  updater: (r: StorefrontRefundRequest) => StorefrontRefundRequest
): StorefrontRefundRequest | null {
  const s = ensureStore();
  const idx = s.refundRequests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  s.refundRequests[idx] = updater(s.refundRequests[idx]);
  notify();
  return s.refundRequests[idx];
}

export function internalAddStorefrontRefundHistory(
  entry: StorefrontRefundHistoryEntry
): StorefrontRefundHistoryEntry {
  const s = ensureStore();
  s.refundHistory = [entry, ...s.refundHistory];
  notify();
  return entry;
}

export function internalDeleteStorefrontUserWallet(walletId: string): boolean {
  const s = ensureStore();
  if (!s.wallets[walletId]) return false;
  delete s.wallets[walletId];
  s.fundingLedger = s.fundingLedger.filter((e) => e.walletId !== walletId);
  s.refundRequests = s.refundRequests.filter((r) => r.walletId !== walletId);
  s.refundHistory = s.refundHistory.filter((r) => r.walletId !== walletId);
  notify();
  return true;
}

export function resetStorefrontUserStateForTest(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  store = loadSeed();
  notify();
}