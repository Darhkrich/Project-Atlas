import type { PlanCode } from "@/config/subscription-plans";
import { subscriptionPlans } from "@/config/subscription-plans";
import type {
  AutoApproveConfig,
  CheckoutEvent,
  DisputeEvent,
  DunningEvent,
  MerchantCard,
  MerchantMoneyState,
  MerchantWallet,
  MerchantWalletTransaction,
  PlanChargeEvent,
  RefundEvent,
  WithdrawalDestination,
  WithdrawalRequest,
} from "../types/merchant-money";
import { mockMerchants } from "./merchants";

const REFERENCE_NOW_MS = Date.now();
const REFERENCE_NOW_ISO = new Date(REFERENCE_NOW_MS).toISOString();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();
const ahead = (ms: number) => new Date(REFERENCE_NOW_MS + ms).toISOString();

const MONTHLY_PRICES: Record<PlanCode, number | "custom"> = {
  starter: 50,
  growth: 150,
  pro: 400,
  enterprise: "custom",
};

const ANNUAL_PRICES: Record<PlanCode, number | "custom"> = {
  starter: 500,
  growth: 1500,
  pro: 4000,
  enterprise: "custom",
};

const CONTRACT_MRR: Record<string, number> = {
  "MER-017": 2500,
};

function planPriceFor(
  merchantId: string,
  planCode: PlanCode,
  cycle: "monthly" | "annual"
): number {
  const contract = CONTRACT_MRR[merchantId];
  if (planCode === "enterprise" && contract) {
    return cycle === "annual" ? contract * 12 : contract;
  }
  const table = cycle === "annual" ? ANNUAL_PRICES : MONTHLY_PRICES;
  const value = table[planCode];
  return typeof value === "number" ? value : 0;
}

const BILLING_SEED: Record<string, number> = {
  "MER-001": 400,
  "MER-002": 150,
  "MER-003": 0,
  "MER-004": 4000,
  "MER-005": 150,
  "MER-006": 400,
  "MER-007": 50,
  "MER-008": 4000,
  "MER-009": 0,
  "MER-010": 50,
  "MER-011": 150,
  "MER-012": 0,
  "MER-013": 150,
  "MER-014": 50,
  "MER-015": 4000,
  "MER-016": 0,
  "MER-017": 30000,
  "MER-018": 400,
  "MER-019": 400,
  "MER-020": 0,
};

function seedWallets(): Record<
  string,
  { billing: MerchantWallet; main: MerchantWallet }
> {
  const out: Record<
    string,
    { billing: MerchantWallet; main: MerchantWallet }
  > = {};
  for (const m of mockMerchants) {
    out[m.id] = {
      billing: {
        merchantId: m.id,
        type: "billing",
        balance: BILLING_SEED[m.id] ?? 0,
        currency: "GHS",
        updatedAt: ago(DAY),
      },
      main: {
        merchantId: m.id,
        type: "main",
        balance: m.walletBalance ?? 0,
        currency: "GHS",
        updatedAt: ago(HOUR),
      },
    };
  }
  return out;
}

function seedDestinations(): Record<string, WithdrawalDestination> {
  const out: Record<string, WithdrawalDestination> = {};
  const momo: Array<
    [string, WithdrawalDestination["provider"], string, string]
  > = [
    ["MER-001", "MTN", "024 555 6666", "Nana Kofi"],
    ["MER-002", "Vodafone", "020 555 7001", "Linda Mensah"],
    ["MER-005", "MTN", "020 555 6002", "Akua Bediako"],
    ["MER-007", "AirtelTigo", "024 555 5002", "Yaa Frimpong"],
    ["MER-013", "MTN", "024 555 5008", "Kwame Mensah"],
    ["MER-014", "MTN", "020 555 5009", "Esi Boateng"],
    ["MER-018", "Vodafone", "020 555 5013", "Abena Yeboah"],
    ["MER-020", "MTN", "024 555 5015", "Yaw Boateng"],
  ];
  for (const [id, provider, account, name] of momo) {
    out[id] = {
      merchantId: id,
      method: "momo",
      provider,
      accountNumber: account,
      nameOnAccount: name,
      verifiedAt: ago(DAY * 60),
    };
  }
  const bank: Array<
    [string, WithdrawalDestination["provider"], string, string]
  > = [
    ["MER-004", "GCB", "1234567890", "Daniel Agyeman"],
    ["MER-006", "Ecobank", "2345678901", "Kwesi Antwi"],
    ["MER-008", "Fidelity", "3456789012", "Emmanuel Quaye"],
    ["MER-015", "Stanbic", "4567890123", "Prince Owusu"],
    ["MER-017", "Absa", "5678901234", "Isaac Nartey"],
    ["MER-019", "CalBank", "6789012345", "Comfort Owusu"],
  ];
  for (const [id, provider, account, name] of bank) {
    out[id] = {
      merchantId: id,
      method: "bank",
      provider,
      accountNumber: account,
      nameOnAccount: name,
      verifiedAt: ago(DAY * 60),
    };
  }
  out["MER-009"] = {
    merchantId: "MER-009",
    method: "momo",
    provider: "MTN",
    accountNumber: "020 555 5004",
    nameOnAccount: "Nana Owusu",
    verifiedAt: ago(DAY * 30),
    pendingChange: {
      reason: "Number ported. Updating to new MTN line.",
      requestedAt: ago(DAY * 2),
      requestedBy: "MER-009",
    },
  };
  return out;
}

function seedCards(): Record<string, MerchantCard[]> {
  const out: Record<string, MerchantCard[]> = {};
  const withCard: string[] = ["MER-001", "MER-006", "MER-008", "MER-015"];
  for (let i = 0; i < withCard.length; i++) {
    const id = withCard[i];
    out[id] = [
      {
        id: `CARD-${String(i + 1).padStart(4, "0")}`,
        merchantId: id,
        brand: i % 2 === 0 ? "visa" : "mastercard",
        last4: String(4000 + i).slice(-4),
        tokenRef: `tok_${id.toLowerCase()}_${i}`,
        addedAt: ago(DAY * 90),
      },
    ];
  }
  return out;
}

function seedAutopay(): Record<string, { enabled: boolean; cardRef?: string }> {
  const out: Record<string, { enabled: boolean; cardRef?: string }> = {};
  const cards = seedCards();
  for (const m of mockMerchants) {
    const list = cards[m.id];
    out[m.id] = {
      enabled: Boolean(list && list.length > 0),
      cardRef: list?.[0]?.tokenRef,
    };
  }
  return out;
}

function seedPlanCharges(): PlanChargeEvent[] {
  const events: PlanChargeEvent[] = [];
  let n = 1;
  for (const m of mockMerchants) {
    const cycle = m.subscription.billingCycle;
    const amount = planPriceFor(m.id, m.subscription.planId, cycle);
    if (amount === 0 && m.subscription.planId !== "starter") continue;
    const status: PlanChargeEvent["status"] =
      m.subscription.status === "past_due" ||
      m.subscription.status === "expired"
        ? "failed"
        : "successful";
    const lastPayment = m.subscription.lastPaymentDate ?? ago(DAY * 30);
    events.push({
      id: `PC-${String(n).padStart(4, "0")}`,
      kind: "plan_charge",
      merchantId: m.id,
      planCode: m.subscription.planId,
      billingCycle: cycle,
      amount,
      source: "billing_wallet",
      status,
      failureReason:
        status === "failed" ? "insufficient_billing_balance" : undefined,
      transactionRef: `TXN-PC-${String(n).padStart(4, "0")}`,
      createdAt: lastPayment,
      completedAt: status === "successful" ? lastPayment : undefined,
    });
    n++;
    if (status === "successful") {
      events.push({
        id: `PC-${String(n).padStart(4, "0")}`,
        kind: "plan_charge",
        merchantId: m.id,
        planCode: m.subscription.planId,
        billingCycle: cycle,
        amount,
        source: "billing_wallet",
        status: "successful",
        transactionRef: `TXN-PC-${String(n).padStart(4, "0")}`,
        createdAt: ago(DAY * 30 + (m.totalOrders % 15) * DAY),
        completedAt: ago(DAY * 30 + (m.totalOrders % 15) * DAY),
      });
      n++;
    }
  }
  return events;
}

function seedCheckouts(): CheckoutEvent[] {
  const events: CheckoutEvent[] = [];
  const merchants = mockMerchants.filter((m) => m.totalOrders > 0);
  let n = 1;
  for (const m of merchants) {
    const count = Math.min(5, Math.max(2, Math.floor(m.totalOrders / 40)));
    for (let i = 0; i < count; i++) {
      const amount = 80 + ((m.totalOrders * (i + 1)) % 400);
      const method: CheckoutEvent["method"] =
        i % 3 === 0 ? "card" : i % 3 === 1 ? "momo" : "bank";
      const status: CheckoutEvent["status"] =
        i === count - 1 && m.subscription.status === "past_due"
          ? "failed"
          : i === count - 1 && m.id === "MER-011"
          ? "pending"
          : "successful";
      events.push({
        id: `CO-${String(n).padStart(4, "0")}`,
        kind: "checkout",
        merchantId: m.id,
        orderId: `ORD-${1000 + n}`,
        amount,
        method,
        providerFee: Math.round(amount * 0.015 * 100) / 100,
        mainWalletId: `MW-${m.id}`,
        status,
        settledAt:
          status === "successful" ? ago(HOUR * (n % 72) + HOUR) : undefined,
        transactionRef: `TXN-CO-${String(n).padStart(4, "0")}`,
        createdAt: ago(HOUR * (n % 72) + HOUR),
      });
      n++;
    }
  }
  return events;
}

interface SeedWithdrawalSpec {
  merchantId: string;
  amount: number;
  status: WithdrawalRequest["status"];
  autoApproved: boolean;
  reasons: WithdrawalRequest["approvalRequiredReasons"];
  failureReason?: WithdrawalRequest["failureReason"];
  daysAgo: number;
}

/**
 * Every row below has been checked against the merchant's main wallet balance
 * at seed time. Withdrawals whose total debit exceeds the balance are marked
 * failed with insufficient_balance and never appear in the admin queue.
 */
const WITHDRAWAL_SEEDS: SeedWithdrawalSpec[] = [
  // Auto-approved, completed
  {
    merchantId: "MER-001",
    amount: 500,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 3,
  },
  {
    merchantId: "MER-002",
    amount: 900,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 5,
  },
  {
    merchantId: "MER-008",
    amount: 2500,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 7,
  },
  {
    merchantId: "MER-008",
    amount: 1800,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 4,
  },
  {
    merchantId: "MER-013",
    amount: 400,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 6,
  },
  {
    merchantId: "MER-015",
    amount: 4000,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 2,
  },
  {
    merchantId: "MER-018",
    amount: 1500,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 9,
  },
  {
    merchantId: "MER-019",
    amount: 3000,
    status: "completed",
    autoApproved: true,
    reasons: [],
    daysAgo: 3,
  },
  // In-flight
  {
    merchantId: "MER-005",
    amount: 300,
    status: "pending_processing",
    autoApproved: true,
    reasons: [],
    daysAgo: 0,
  },
  // Awaiting admin approval, balance is sufficient
  {
    merchantId: "MER-008",
    amount: 5100,
    status: "pending_admin",
    autoApproved: false,
    reasons: ["exceeds_threshold"],
    daysAgo: 0,
  },
  {
    merchantId: "MER-009",
    amount: 200,
    status: "pending_admin",
    autoApproved: false,
    reasons: ["destination_change_pending"],
    daysAgo: 0,
  },
  {
    merchantId: "MER-017",
    amount: 8000,
    status: "pending_admin",
    autoApproved: false,
    reasons: ["exceeds_threshold"],
    daysAgo: 1,
  },
  {
    merchantId: "MER-019",
    amount: 4990,
    status: "pending_admin",
    autoApproved: false,
    reasons: ["exceeds_threshold"],
    daysAgo: 0,
  },
  // Failed: total debit exceeds merchant main wallet balance
  {
    merchantId: "MER-004",
    amount: 4800,
    status: "failed",
    autoApproved: false,
    reasons: [],
    failureReason: "insufficient_balance",
    daysAgo: 0,
  },
  {
    merchantId: "MER-006",
    amount: 4800,
    status: "failed",
    autoApproved: false,
    reasons: [],
    failureReason: "insufficient_balance",
    daysAgo: 0,
  },
  {
    merchantId: "MER-006",
    amount: 5200,
    status: "failed",
    autoApproved: false,
    reasons: [],
    failureReason: "insufficient_balance",
    daysAgo: 1,
  },
  {
    merchantId: "MER-014",
    amount: 500,
    status: "failed",
    autoApproved: false,
    reasons: [],
    failureReason: "insufficient_balance",
    daysAgo: 1,
  },
];

function seedWithdrawals(): WithdrawalRequest[] {
  const events: WithdrawalRequest[] = [];
  const feeRate = 0.005;
  for (let i = 0; i < WITHDRAWAL_SEEDS.length; i++) {
    const s = WITHDRAWAL_SEEDS[i];
    const fee = Math.round(s.amount * feeRate * 100) / 100;
    const completedOrProcessing =
      s.status === "completed" || s.status === "pending_processing";
    events.push({
      id: `WD-${String(i + 1).padStart(4, "0")}`,
      kind: "withdrawal",
      merchantId: s.merchantId,
      amount: s.amount,
      fee,
      total: s.amount + fee,
      destinationSnapshot: {
        method: "momo",
        provider: "MTN",
        maskedAccount: "**** " + String(1000 + i).slice(-4),
        nameOnAccount: "Merchant",
      },
      status: s.status,
      autoApproved: s.autoApproved,
      approvalRequiredReasons: s.reasons,
      failureReason: s.failureReason,
      approvedBy: completedOrProcessing ? "finance@atlas.com" : undefined,
      approvedAt: completedOrProcessing ? ago(DAY * s.daysAgo) : undefined,
      completedAt: s.status === "completed" ? ago(DAY * s.daysAgo) : undefined,
      transactionRef: `TXN-WD-${String(i + 1).padStart(4, "0")}`,
      createdAt: ago(DAY * s.daysAgo + HOUR),
    });
  }
  return events;
}

function seedRefunds(): RefundEvent[] {
  return [
    {
      id: "RF-0001",
      kind: "refund",
      merchantId: "MER-001",
      originalPaymentId: "CO-0001",
      orderId: "ORD-1001",
      amount: 120,
      reason: "Item out of stock.",
      initiatedBy: "merchant",
      customerRail: "momo",
      createdAt: ago(DAY * 2),
      settledAt: ago(DAY * 2),
    },
    {
      id: "RF-0002",
      kind: "refund",
      merchantId: "MER-006",
      originalPaymentId: "CO-0020",
      orderId: "ORD-1020",
      amount: 80,
      reason: "Damaged on delivery.",
      initiatedBy: "merchant",
      customerRail: "card",
      createdAt: ago(HOUR * 8),
    },
    {
      id: "RF-0003",
      kind: "refund",
      merchantId: "MER-019",
      originalPaymentId: "CO-0035",
      orderId: "ORD-1035",
      amount: 240,
      reason: "Wrong item shipped.",
      initiatedBy: "merchant",
      customerRail: "bank_transfer",
      createdAt: ago(DAY * 1),
      settledAt: ago(DAY * 1),
    },
  ];
}

function seedDisputes(): DisputeEvent[] {
  return [
    {
      id: "DP-0001",
      merchantId: "MER-006",
      type: "customer_refund_dispute",
      relatedPaymentId: "CO-0020",
      openedAt: ago(DAY * 1),
      openedBy: "customer",
      status: "open",
    },
    {
      id: "DP-0002",
      merchantId: "MER-013",
      type: "merchant_refuses_refund",
      openedAt: ago(DAY * 5),
      openedBy: "customer",
      status: "resolved",
      resolutionNote: "Merchant issued full refund after review.",
      resolvedAt: ago(DAY * 3),
      resolvedBy: "ops@atlas.com",
    },
  ];
}

function seedDunning(): DunningEvent[] {
  const out: DunningEvent[] = [];
  let n = 1;
  for (const m of mockMerchants) {
    if (
      m.subscription.status !== "past_due" &&
      m.subscription.status !== "expired"
    ) {
      continue;
    }
    const planCharge = `PC-${String(mockMerchants.indexOf(m) + 1).padStart(
      4,
      "0"
    )}`;
    const channels: DunningEvent["channel"][] = ["email", "sms", "app"];
    for (const channel of channels) {
      out.push({
        id: `DN-${String(n).padStart(4, "0")}`,
        merchantId: m.id,
        planChargeId: planCharge,
        channel,
        sentAt: ago(DAY * 3),
        acknowledged: false,
      });
      n++;
    }
  }
  return out;
}

function seedWalletTransactions(): MerchantWalletTransaction[] {
  return [
    {
      id: "WT-0001",
      merchantId: "MER-001",
      walletType: "main",
      direction: "credit",
      amount: 350,
      balanceAfter: 800,
      rail: "card",
      relatedEventId: "CO-0001",
      relatedEventKind: "checkout",
      status: "completed",
      actorType: "customer",
      createdAt: ago(HOUR * 3),
    },
    {
      id: "WT-0002",
      merchantId: "MER-001",
      walletType: "main",
      direction: "credit",
      amount: 120,
      balanceAfter: 800,
      rail: "momo",
      relatedEventId: "CO-0002",
      relatedEventKind: "checkout",
      status: "completed",
      actorType: "customer",
      createdAt: ago(DAY),
    },
    {
      id: "WT-0003",
      merchantId: "MER-001",
      walletType: "billing",
      direction: "debit",
      amount: 400,
      balanceAfter: 400,
      rail: "internal_transfer",
      relatedEventId: "PC-0001",
      relatedEventKind: "plan_charge",
      status: "completed",
      actorType: "system",
      createdAt: ago(DAY * 30),
    },
  ];
}

const DEFAULT_CONFIG: AutoApproveConfig = {
  thresholdGHS: 5000,
  feeRatePercent: 0.5,
  dailyCap: 2,
  updatedAt: ago(DAY * 30),
  updatedBy: "system",
};

function loadSeed(): MerchantMoneyState {
  return {
    wallets: seedWallets(),
    walletTransactions: seedWalletTransactions(),
    destinations: seedDestinations(),
    cards: seedCards(),
    autopay: seedAutopay(),
    withdrawals: seedWithdrawals(),
    planCharges: seedPlanCharges(),
    checkouts: seedCheckouts(),
    refunds: seedRefunds(),
    disputes: seedDisputes(),
    dunning: seedDunning(),
    config: DEFAULT_CONFIG,
  };
}

let store: MerchantMoneyState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantMoneyState {
  if (!store) {
    store = structuredClone(loadSeed());
  }
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function getMerchantMoneyState(): MerchantMoneyState {
  return ensureStore();
}

export function subscribeToMerchantMoney(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMerchantMoneySnapshot(merchantId: string) {
  const s = ensureStore();
  return {
    wallets: s.wallets[merchantId],
    destination: s.destinations[merchantId],
    cards: s.cards[merchantId] ?? [],
    autopay: s.autopay[merchantId],
    withdrawals: s.withdrawals.filter((w) => w.merchantId === merchantId),
    planCharges: s.planCharges.filter((p) => p.merchantId === merchantId),
    checkouts: s.checkouts.filter((c) => c.merchantId === merchantId),
    refunds: s.refunds.filter((r) => r.merchantId === merchantId),
    disputes: s.disputes.filter((d) => d.merchantId === merchantId),
    dunning: s.dunning.filter((d) => d.merchantId === merchantId),
    config: s.config,
  };
}

export function internalPatchWallet(
  merchantId: string,
  type: "billing" | "main",
  updater: (wallet: MerchantWallet) => MerchantWallet
) {
  const s = ensureStore();
  const pair = s.wallets[merchantId];
  if (!pair) return;
  s.wallets[merchantId] = { ...pair, [type]: updater(pair[type]) };
  notify();
}

export function internalAddWalletTransaction(tx: MerchantWalletTransaction) {
  const s = ensureStore();
  s.walletTransactions.push(tx);
  notify();
}

export function internalPatchWithdrawal(
  id: string,
  updater: (w: WithdrawalRequest) => WithdrawalRequest
) {
  const s = ensureStore();
  const idx = s.withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) return;
  s.withdrawals[idx] = updater(s.withdrawals[idx]);
  notify();
}

export function internalPatchConfig(
  updater: (c: AutoApproveConfig) => AutoApproveConfig
) {
  const s = ensureStore();
  s.config = updater(s.config);
  notify();
}

export function internalPatchDispute(
  id: string,
  updater: (d: DisputeEvent) => DisputeEvent
) {
  const s = ensureStore();
  const idx = s.disputes.findIndex((d) => d.id === id);
  if (idx === -1) return;
  s.disputes[idx] = updater(s.disputes[idx]);
  notify();
}

export function resetForTest() {
  store = structuredClone(loadSeed());
  notify();
}

export const __plansRef = subscriptionPlans;
export { ahead, ago, REFERENCE_NOW_ISO };