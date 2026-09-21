import type {
  ResellerWalletEvents,
  WalletCredit,
  WithdrawalHistoryEntry,
  WithdrawalMethod,
} from "@/lib/admin/types/reseller-commission-wallet";

const REFERENCE_NOW_MS = Date.now();
const hour = 3_600_000;
const day = 86_400_000;
const FEE_RATE = 0.005;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

function withFee(amount: number): { fee: number; total: number } {
  const fee = Math.round(amount * FEE_RATE * 100) / 100;
  return { fee, total: amount + fee };
}

function request(
  id: string,
  amount: number,
  method: WithdrawalMethod,
  requestedAt: string
) {
  const { fee, total } = withFee(amount);
  return { id, amount, fee, total, method, requestedAt, status: "pending" as const };
}

function history(
  id: string,
  amount: number,
  method: WithdrawalMethod,
  requestedAt: string,
  resolvedAt: string,
  status: "completed" | "failed" | "rejected",
  autoApproved: boolean,
  actor?: string,
  reason?: string
) {
  const { fee, total } = withFee(amount);
  return {
    id,
    amount,
    fee,
    total,
    method,
    requestedAt,
    resolvedAt,
    status,
    autoApproved,
    actor,
    reason,
  };
}

const SEED: Record<string, ResellerWalletEvents> = {
  "RS-001": {
    resellerId: "RS-001",
    lastCreditAt: ago(hour),
    recentCredits: [
      {
        id: "CR-001",
        orderId: "ATX-983821",
        service: "MTN Data",
        amount: 50,
        createdAt: ago(hour),
      },
      {
        id: "CR-002",
        orderId: "ATX-983818",
        service: "DSTV",
        amount: 200,
        createdAt: ago(day),
      },
    ],
    withdrawalRequests: [
      request("WR-001", 7500, "Bank Transfer", ago(hour * 2)),
    ],
    withdrawalHistory: [
      history(
        "WR-000",
        500,
        "Mobile Money",
        ago(day * 3),
        ago(day * 2),
        "completed",
        true,
        "System"
      ),
      history(
        "WR-WC-001",
        400,
        "Wallet Credit",
        ago(day * 2),
        ago(day * 2),
        "completed",
        true,
        "System",
        "Internal transfer to Atlas wallet"
      ),
      history(
        "WR-OLD-001",
        2000,
        "Bank Transfer",
        ago(day * 12),
        ago(day * 11),
        "completed",
        false,
        "Finance Admin"
      ),
    ],
  },
  "RS-002": {
    resellerId: "RS-002",
    lastCreditAt: ago(day * 2),
    recentCredits: [],
    withdrawalRequests: [],
    withdrawalHistory: [
      history(
        "WR-002",
        300,
        "Bank Transfer",
        ago(day * 5),
        ago(day * 4),
        "completed",
        true,
        "System"
      ),
      history(
        "WR-REJ-001",
        800,
        "Mobile Money",
        ago(day * 8),
        ago(day * 7),
        "rejected",
        false,
        "Finance Admin",
        "Destination does not match registered details"
      ),
    ],
  },
  "RS-004": {
    resellerId: "RS-004",
    lastCreditAt: ago(hour * 2),
    recentCredits: [
      {
        id: "CR-003",
        orderId: "ATX-983816",
        service: "WAEC",
        amount: 30,
        createdAt: ago(hour * 2),
      },
    ],
    withdrawalRequests: [],
    withdrawalHistory: [],
  },
};

interface StoreState {
  events: Record<string, ResellerWalletEvents>;
  loaded: boolean;
}

const state: StoreState = {
  events: {},
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.events = structuredClone(SEED);
  state.loaded = true;
}

export function isWalletStoreLoaded(): boolean {
  return state.loaded;
}

export function subscribeToWalletStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWalletEvents(): Record<string, ResellerWalletEvents> {
  ensureLoaded();
  return state.events;
}

export function getWalletEventsFor(
  resellerId: string
): ResellerWalletEvents | undefined {
  ensureLoaded();
  return state.events[resellerId];
}

export interface WalletActor {
  name: string;
  email: string;
}

export function appendAutoApprovedWithdrawal(
  resellerId: string,
  input: {
    amount: number;
    method: WithdrawalMethod;
    requestedAt?: string;
  }
): WithdrawalHistoryEntry | null {
  ensureLoaded();
  const events = state.events[resellerId];
  if (!events) return null;

  const resolvedAt = new Date().toISOString();
  const { fee, total } = withFee(input.amount);
  const entry: WithdrawalHistoryEntry = {
    id: "WR-" + crypto.randomUUID(),
    amount: input.amount,
    fee,
    total,
    method: input.method,
    requestedAt: input.requestedAt ?? resolvedAt,
    resolvedAt,
    status: "completed",
    autoApproved: true,
    actor: "System",
  };
  events.withdrawalHistory = [entry, ...events.withdrawalHistory];
  notify();
  return entry;
}

export interface ResolveWithdrawalInput {
  resellerId: string;
  requestId: string;
  outcome: "completed" | "failed" | "rejected";
  actor: WalletActor;
  reason?: string;
}

export function internalResolveWithdrawal(
  input: ResolveWithdrawalInput
): WithdrawalHistoryEntry | null {
  ensureLoaded();
  const events = state.events[input.resellerId];
  if (!events) return null;

  const request = events.withdrawalRequests.find(
    (r) => r.id === input.requestId
  );
  if (!request) return null;

  const resolvedAt = new Date().toISOString();
  const entry: WithdrawalHistoryEntry = {
    id: request.id,
    amount: request.amount,
    fee: request.fee,
    total: request.total,
    method: request.method,
    requestedAt: request.requestedAt,
    resolvedAt,
    status: input.outcome,
    autoApproved: false,
    actor: input.actor.name,
    reason: input.reason,
  };

  events.withdrawalRequests = events.withdrawalRequests.filter(
    (r) => r.id !== input.requestId
  );
  events.withdrawalHistory = [entry, ...events.withdrawalHistory];
  notify();
  return entry;
}

export function appendCommissionCredit(
  resellerId: string,
  credit: Omit<WalletCredit, "id" | "createdAt"> & { createdAt?: string }
): WalletCredit | null {
  ensureLoaded();
  const events = state.events[resellerId];
  if (!events) return null;

  const full: WalletCredit = {
    id: "CR-" + crypto.randomUUID(),
    orderId: credit.orderId,
    service: credit.service,
    amount: credit.amount,
    createdAt: credit.createdAt ?? new Date().toISOString(),
  };
  events.recentCredits = [full, ...events.recentCredits].slice(0, 20);
  events.lastCreditAt = full.createdAt;
  notify();
  return full;
}

export function ensureWalletEventsFor(
  resellerId: string
): ResellerWalletEvents {
  ensureLoaded();
  if (!state.events[resellerId]) {
    state.events[resellerId] = {
      resellerId,
      recentCredits: [],
      withdrawalRequests: [],
      withdrawalHistory: [],
      lastCreditAt: null,
    };
  }
  return state.events[resellerId];
}

export function resetWalletStoreForTest(): void {
  state.events = structuredClone(SEED);
  state.loaded = true;
  notify();
}

export { withFee as computeWithdrawalFee };