import type {
  MerchantCustomerPaymentLedgerEntry,
  MerchantFundingLedgerEntry,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
  MerchantTransferLedgerEntry,
  MerchantWalletLedgerEntry,
  MerchantWalletRecord,
  MerchantWalletStoreState,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalLedgerEntry,
  MerchantWithdrawalRequest,
} from "@/lib/merchant/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";

const REFERENCE_NOW_MS = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

const SEED_MERCHANT = {
  id: "MER-001",
  name: "TechHub Store",
};

const SEED_BILLING: MerchantWalletRecord = {
  id: "MW-MER-001-B",
  merchantId: SEED_MERCHANT.id,
  merchantName: SEED_MERCHANT.name,
  walletType: "billing",
  balance: 400,
  currency: "GHS",
  status: "active",
  updatedAt: ago(30 * DAY),
  lastFundingAt: ago(30 * DAY),
  lastCreditAt: ago(30 * DAY),
  lastDebitAt: ago(30 * DAY),
};

const SEED_MAIN: MerchantWalletRecord = {
  id: "MW-MER-001-M",
  merchantId: SEED_MERCHANT.id,
  merchantName: SEED_MERCHANT.name,
  walletType: "main",
  balance: 8500,
  currency: "GHS",
  status: "active",
  updatedAt: ago(HOUR),
  lastFundingAt: ago(45 * DAY),
  lastCreditAt: ago(HOUR),
  lastDebitAt: ago(21 * DAY),
};

const SEED_CONFIG: WalletAutoApproveConfig = {
  thresholdGHS: 5000,
  feeRatePercent: 0.5,
  dailyCap: 2,
  updatedAt: ago(30 * DAY),
  updatedBy: "System",
};

const SEED_BILLING_FUNDING: MerchantFundingLedgerEntry[] = [
  {
    id: "ML-BF-001",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "funding",
    amount: 200,
    method: "momo",
    provider: "MTN",
    maskedLabel: "**** 9001",
    reference: "REF-MBF-0001",
    status: "successful",
    createdAt: ago(30 * DAY),
    completedAt: ago(30 * DAY - 60_000),
  },
  {
    id: "ML-BF-002",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "funding",
    amount: 150,
    method: "card",
    provider: "Visa",
    maskedLabel: "**** 4021",
    reference: "REF-MBF-0002",
    status: "successful",
    createdAt: ago(60 * DAY),
    completedAt: ago(60 * DAY - 60_000),
  },
  {
    id: "ML-BF-003",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "funding",
    amount: 50,
    method: "bank",
    provider: "GCB",
    maskedLabel: "**** 0099",
    reference: "REF-MBF-0003",
    status: "successful",
    createdAt: ago(90 * DAY),
    completedAt: ago(90 * DAY - 60_000),
  },
];

const SEED_MAIN_FUNDING: MerchantFundingLedgerEntry[] = [
  {
    id: "ML-MF-001",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "funding",
    amount: 500,
    method: "momo",
    provider: "MTN",
    maskedLabel: "**** 9001",
    reference: "REF-MMF-0001",
    status: "successful",
    createdAt: ago(45 * DAY),
    completedAt: ago(45 * DAY - 60_000),
  },
  {
    id: "ML-MF-002",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "funding",
    amount: 1000,
    method: "bank",
    provider: "GCB",
    maskedLabel: "**** 0099",
    reference: "REF-MMF-0002",
    status: "successful",
    createdAt: ago(60 * DAY),
    completedAt: ago(60 * DAY - 60_000),
  },
];

const SEED_CUSTOMER_PAYMENTS: MerchantCustomerPaymentLedgerEntry[] = [
  {
    id: "ML-CP-001",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 350,
    relatedOrderId: "ORD-1001",
    relatedOrderNumber: "ATL-ORD-1001",
    customerEmail: "customer1@example.com",
    paymentMethod: "Card",
    paymentProvider: "Visa",
    createdAt: ago(HOUR * 3),
  },
  {
    id: "ML-CP-002",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 120,
    relatedOrderId: "ORD-1002",
    relatedOrderNumber: "ATL-ORD-1002",
    customerEmail: "customer2@example.com",
    paymentMethod: "Mobile Money",
    paymentProvider: "MTN",
    createdAt: ago(DAY),
  },
  {
    id: "ML-CP-003",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 400,
    relatedOrderId: "ORD-1005",
    relatedOrderNumber: "ATL-ORD-1005",
    customerEmail: "customer4@example.com",
    paymentMethod: "Card",
    paymentProvider: "Visa",
    createdAt: ago(DAY * 2),
  },
  {
    id: "ML-CP-004",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 220,
    relatedOrderId: "ORD-1004",
    relatedOrderNumber: "ATL-ORD-1004",
    customerEmail: "customer3@example.com",
    paymentMethod: "Mobile Money",
    paymentProvider: "MTN",
    createdAt: ago(DAY * 5),
  },
  {
    id: "ML-CP-005",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 180,
    relatedOrderId: "ORD-1010",
    relatedOrderNumber: "ATL-ORD-1010",
    customerEmail: "customer5@example.com",
    paymentMethod: "Card",
    paymentProvider: "Mastercard",
    createdAt: ago(DAY * 6),
  },
  {
    id: "ML-CP-006",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "customer_payment",
    amount: 260,
    relatedOrderId: "ORD-1011",
    relatedOrderNumber: "ATL-ORD-1011",
    customerEmail: "customer6@example.com",
    paymentMethod: "Mobile Money",
    paymentProvider: "Vodafone",
    createdAt: ago(DAY * 8),
  },
];

const SEED_PLAN_CHARGES: MerchantPlanChargeLedgerEntry[] = [
  {
    id: "ML-PC-001",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "plan_charge",
    amount: 400,
    planCode: "pro",
    billingCycle: "monthly",
    status: "successful",
    source: "billing_wallet",
    createdAt: ago(30 * DAY),
  },
  {
    id: "ML-PC-002",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "plan_charge",
    amount: 400,
    planCode: "pro",
    billingCycle: "monthly",
    status: "successful",
    source: "billing_wallet",
    createdAt: ago(60 * DAY),
  },
  {
    id: "ML-PC-003",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "plan_charge",
    amount: 400,
    planCode: "pro",
    billingCycle: "monthly",
    status: "failed",
    source: "billing_wallet",
    failureReason: "insufficient_billing_balance",
    createdAt: ago(90 * DAY),
  },
];

const SEED_REFUNDS: MerchantRefundLedgerEntry[] = [
  {
    id: "ML-RF-001",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "refund",
    amount: 120,
    relatedOrderId: "ORD-1003",
    relatedOrderNumber: "ATL-ORD-1003",
    customerEmail: "customer2@example.com",
    reason: "Item out of stock",
    createdAt: ago(DAY * 3),
  },
];

function buildWithdrawalHistory(): MerchantWithdrawalHistoryEntry[] {
  const amount = 500;
  const { fee, total } = computeWithdrawalTotal(
    amount,
    SEED_CONFIG.feeRatePercent
  );
  return [
    {
      id: "MWD-0001",
      merchantId: SEED_MERCHANT.id,
      merchantName: SEED_MERCHANT.name,
      amount,
      fee,
      total,
      destinationId: "MDST-MER-001",
      destinationMethod: "momo",
      destinationProvider: "MTN",
      destinationMaskedLabel: "**** 9001",
      destinationNameOnAccount: "TechHub Store",
      status: "completed",
      autoApproved: true,
      approvalRequiredReasons: [],
      transactionRef: "TXN-MWD-0001",
      requestedAt: ago(21 * DAY),
      approvedAt: ago(21 * DAY),
      completedAt: ago(21 * DAY - HOUR),
      resolvedAt: ago(21 * DAY - HOUR),
      resolvedBy: "System",
    },
  ];
}

function buildWithdrawalLedger(
  history: MerchantWithdrawalHistoryEntry[]
): MerchantWithdrawalLedgerEntry[] {
  return history.map((h) => ({
    id: "ML-" + h.id,
    merchantId: h.merchantId,
    walletType: "main",
    kind: "withdrawal",
    amount: h.amount,
    fee: h.fee,
    total: h.total,
    withdrawalId: h.id,
    status: h.status,
    destinationSummary: h.destinationProvider + " " + h.destinationMaskedLabel,
    createdAt: h.requestedAt,
  }));
}

function buildTransfers(): MerchantTransferLedgerEntry[] {
  const out: MerchantTransferLedgerEntry = {
    id: "ML-TR-001-OUT",
    merchantId: SEED_MERCHANT.id,
    walletType: "main",
    kind: "transfer_out",
    amount: 300,
    pairedEntryId: "ML-TR-001-IN",
    counterpartyWalletType: "billing",
    transferRef: "TRF-0001",
    createdAt: ago(10 * DAY),
  };
  const inn: MerchantTransferLedgerEntry = {
    id: "ML-TR-001-IN",
    merchantId: SEED_MERCHANT.id,
    walletType: "billing",
    kind: "transfer_in",
    amount: 300,
    pairedEntryId: "ML-TR-001-OUT",
    counterpartyWalletType: "main",
    transferRef: "TRF-0001",
    createdAt: ago(10 * DAY),
  };
  return [out, inn];
}

function buildPendingRequest(): MerchantWithdrawalRequest {
  const amount = 6000;
  const { fee, total } = computeWithdrawalTotal(
    amount,
    SEED_CONFIG.feeRatePercent
  );
  return {
    id: "MWD-0002",
    merchantId: SEED_MERCHANT.id,
    merchantName: SEED_MERCHANT.name,
    amount,
    fee,
    total,
    destinationId: "MDST-MER-001",
    destinationMethod: "momo",
    destinationProvider: "MTN",
    destinationMaskedLabel: "**** 9001",
    destinationNameOnAccount: "TechHub Store",
    status: "pending_admin",
    autoApproved: false,
    approvalRequiredReasons: ["exceeds_threshold"],
    transactionRef: "TXN-MWD-0002",
    requestedAt: ago(6 * HOUR),
  };
}

function loadSeed(): MerchantWalletStoreState {
  const history = buildWithdrawalHistory();
  const ledger: MerchantWalletLedgerEntry[] = [
    ...SEED_BILLING_FUNDING,
    ...SEED_MAIN_FUNDING,
    ...SEED_CUSTOMER_PAYMENTS,
    ...SEED_PLAN_CHARGES,
    ...SEED_REFUNDS,
    ...buildWithdrawalLedger(history),
    ...buildTransfers(),
  ];
  ledger.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return {
    billing: structuredClone(SEED_BILLING),
    main: structuredClone(SEED_MAIN),
    ledger,
    withdrawalRequests: [buildPendingRequest()],
    withdrawalHistory: history,
    config: structuredClone(SEED_CONFIG),
  };
}

let store: MerchantWalletStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantWalletStoreState {
  if (!store) store = loadSeed();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isMerchantWalletStoreLoaded(): boolean {
  return store !== null;
}

export function getMerchantWalletStore(): MerchantWalletStoreState {
  return ensureStore();
}

export function subscribeToMerchantWalletStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchMerchantWallet(
  walletType: "billing" | "main",
  updater: (w: MerchantWalletRecord) => MerchantWalletRecord
): MerchantWalletRecord {
  const s = ensureStore();
  if (walletType === "billing") {
    s.billing = updater(s.billing);
    notify();
    return s.billing;
  }
  s.main = updater(s.main);
  notify();
  return s.main;
}

export function internalAppendLedgerEntry(
  entry: MerchantWalletLedgerEntry
): MerchantWalletLedgerEntry {
  const s = ensureStore();
  s.ledger = [entry, ...s.ledger];
  notify();
  return entry;
}

export function internalAppendLedgerEntries(
  entries: MerchantWalletLedgerEntry[]
): MerchantWalletLedgerEntry[] {
  const s = ensureStore();
  s.ledger = [...entries, ...s.ledger];
  notify();
  return entries;
}

export function internalAddWithdrawalRequest(
  req: MerchantWithdrawalRequest
): MerchantWithdrawalRequest {
  const s = ensureStore();
  s.withdrawalRequests = [req, ...s.withdrawalRequests];
  notify();
  return req;
}

export function internalRemoveWithdrawalRequest(
  requestId: string
): MerchantWithdrawalRequest | null {
  const s = ensureStore();
  const found = s.withdrawalRequests.find((r) => r.id === requestId);
  if (!found) return null;
  s.withdrawalRequests = s.withdrawalRequests.filter(
    (r) => r.id !== requestId
  );
  notify();
  return found;
}

export function internalAddWithdrawalHistory(
  entry: MerchantWithdrawalHistoryEntry
): MerchantWithdrawalHistoryEntry {
  const s = ensureStore();
  s.withdrawalHistory = [entry, ...s.withdrawalHistory];
  notify();
  return entry;
}

export function resetMerchantWalletStoreForTest(): void {
  store = loadSeed();
  notify();
}