import type {
  TransactionOverlayRecord,
  TransactionStatus,
} from "../types/transaction";
import { OVERLAY_REFERENCE_NOW_MS } from "../transactions/transactions-constants";

type Listener = () => void;

let overlay: TransactionOverlayRecord[] | null = null;
const listeners = new Set<Listener>();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(ms: number): string {
  return new Date(OVERLAY_REFERENCE_NOW_MS - ms).toISOString();
}

function seed(): TransactionOverlayRecord[] {
  return [
    {
      id: "OVR-ADJ-0001",
      kind: "adjustment",
      audience: "direct",
      ownerName: "Ama Serwaa",
      ownerType: "customer",
      walletId: "WAL-CUST-001",
      amount: 20,
      fee: 0,
      netAmount: 20,
      currency: "GHS",
      status: "successful",
      settlementStatus: "captured",
      paymentMethodId: "wallet",
      createdAt: ago(6 * HOUR),
      reason: "Goodwill credit for delayed delivery",
      actor: { name: "Finance Admin", email: "finance@atlas.com" },
    },
    {
      id: "OVR-ADJ-0002",
      kind: "adjustment",
      audience: "storefront_user",
      ownerName: "Nana Ama",
      ownerType: "storefront_user",
      walletId: "WAL-SFU-001",
      amount: 10,
      fee: 0,
      netAmount: 10,
      currency: "GHS",
      status: "successful",
      settlementStatus: "captured",
      paymentMethodId: "wallet",
      createdAt: ago(2 * DAY),
      reason: "Correction for duplicate funding charge",
      actor: { name: "Support Admin", email: "support@atlas.com" },
    },
    {
      id: "OVR-TRF-0001",
      kind: "transfer",
      audience: "reseller",
      ownerName: "Kwame Store",
      ownerType: "reseller",
      walletId: "WAL-RS-001",
      relatedWalletId: "WAL-RS-001-MAIN",
      amount: 150,
      fee: 0,
      netAmount: 150,
      currency: "GHS",
      status: "successful",
      settlementStatus: "captured",
      paymentMethodId: "wallet",
      createdAt: ago(3 * DAY),
      reason: "Internal reallocation",
      actor: { name: "Finance Admin", email: "finance@atlas.com" },
    },
  ];
}

function ensureLoaded(): TransactionOverlayRecord[] {
  if (overlay === null) overlay = seed();
  return overlay;
}

export function getOverlayTransactions(): TransactionOverlayRecord[] {
  return ensureLoaded();
}

export function subscribeToTransactionOverlay(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isTransactionOverlayLoaded(): boolean {
  return overlay !== null;
}

export function resetTransactionOverlayForTest(): void {
  overlay = null;
  listeners.clear();
}

// Not used yet. Kept so the overlay type contract stays complete.
export const __overlayStatusUnion: TransactionStatus[] = [
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
];