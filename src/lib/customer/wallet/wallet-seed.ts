import type {
  CustomerFundingTransaction,
  CustomerWalletRecord,
  CustomerWalletStoreState,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";

const ANCHOR_MS = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(ANCHOR_MS - ms).toISOString();

interface WalletSeed {
  customerId: string;
  customerName: string;
  balance: number;
  daysSinceLastFunding: number;
}

// CUST-008 funded 500 and now holds 320. The 180 GHS delta is spending
// that happened through orders, which lives in orders-store.ts. Not
// reproduced here; the wallet store only knows what moved through it.
const WALLETS_SEED: WalletSeed[] = [
  { customerId: "CUST-001", customerName: "Ama Serwaa", balance: 145, daysSinceLastFunding: 2 },
  { customerId: "CUST-003", customerName: "Efua Mensimah", balance: 0, daysSinceLastFunding: 30 },
  { customerId: "CUST-005", customerName: "Akua Bediako", balance: 60, daysSinceLastFunding: 6 },
  { customerId: "CUST-008", customerName: "Kwesi Antwi", balance: 320, daysSinceLastFunding: 1 },
  { customerId: "CUST-010", customerName: "Fiifi Amoah", balance: 40, daysSinceLastFunding: 12 },
];

function walletIdFor(customerId: string): string {
  return "WAL-" + customerId;
}

function seedWallets(): Record<string, CustomerWalletRecord> {
  const out: Record<string, CustomerWalletRecord> = {};
  for (const s of WALLETS_SEED) {
    const id = walletIdFor(s.customerId);
    out[id] = {
      id,
      customerId: s.customerId,
      customerName: s.customerName,
      balance: s.balance,
      currency: "GHS",
      status: "active",
      updatedAt: ago(s.daysSinceLastFunding * DAY),
      lastFundingAt: ago(s.daysSinceLastFunding * DAY),
      lastWithdrawalAt: null,
    };
  }
  return out;
}

function seedFunding(): CustomerFundingTransaction[] {
  const seeds: Array<{
    customerId: string;
    amount: number;
    method: CustomerFundingTransaction["method"];
    provider: string;
    masked: string;
    daysAgo: number;
  }> = [
    { customerId: "CUST-001", amount: 200, method: "momo", provider: "MTN", masked: "**** 4567", daysAgo: 2 },
    { customerId: "CUST-001", amount: 100, method: "momo", provider: "MTN", masked: "**** 4567", daysAgo: 45 },
    { customerId: "CUST-005", amount: 100, method: "card", provider: "Visa", masked: "**** 4021", daysAgo: 6 },
    { customerId: "CUST-008", amount: 500, method: "momo", provider: "MTN", masked: "**** 7788", daysAgo: 1 },
    { customerId: "CUST-010", amount: 50, method: "bank", provider: "GCB", masked: "**** 0099", daysAgo: 12 },
  ];
  return seeds.map((s, i) => {
    const n = i + 1;
    const id = "FUND-" + String(n).padStart(4, "0");
    return {
      id,
      customerId: s.customerId,
      amount: s.amount,
      method: s.method,
      provider: s.provider,
      maskedLabel: s.masked,
      reference: "FUNDREF-" + String(n).padStart(4, "0"),
      status: "successful" as const,
      createdAt: ago(s.daysAgo * DAY),
      completedAt: ago(s.daysAgo * DAY - 60_000),
    };
  });
}

function buildPendingRequest(): CustomerWithdrawalRequest {
  const amount = 120;
  const { fee, total } = computeWithdrawalTotal(amount, 0.5);
  return {
    id: "WWD-0001",
    customerId: "CUST-001",
    customerName: "Ama Serwaa",
    amount,
    fee,
    total,
    sourcePaymentId: "FUND-0001",
    sourceMethodId: "momo",
    sourceProvider: "MTN",
    sourceMaskedLabel: "**** 4567",
    sourceCreatedAt: ago(2 * DAY),
    sourceAmount: 200,
    status: "pending_admin",
    autoApproved: false,
    approvalRequiredReasons: [],
    transactionRef: "TXN-WWD-0001",
    requestedAt: ago(4 * HOUR),
  };
}

function buildHistoryEntry(
  id: string,
  customerId: string,
  customerName: string,
  amount: number,
  method: "card" | "bank",
  provider: string,
  masked: string,
  sourceAmount: number,
  sourcePaymentId: string,
  requestedDaysAgo: number,
  resolvedDaysAgo: number,
  actorName: string
): CustomerWithdrawalHistoryEntry {
  const { fee, total } = computeWithdrawalTotal(amount, 0.5);
  return {
    id,
    customerId,
    customerName,
    amount,
    fee,
    total,
    sourcePaymentId,
    sourceMethodId: method,
    sourceProvider: provider,
    sourceMaskedLabel: masked,
    sourceCreatedAt: ago((requestedDaysAgo + 1) * DAY),
    sourceAmount,
    status: "completed",
    autoApproved: true,
    approvalRequiredReasons: [],
    transactionRef: "TXN-" + id,
    requestedAt: ago(requestedDaysAgo * DAY),
    approvedAt: ago((requestedDaysAgo - 1) * DAY),
    completedAt: ago(resolvedDaysAgo * DAY),
    resolvedAt: ago(resolvedDaysAgo * DAY),
    resolvedBy: actorName,
  };
}

function seedHistory(): CustomerWithdrawalHistoryEntry[] {
  return [
    buildHistoryEntry(
      "WWD-0003",
      "CUST-005",
      "Akua Bediako",
      50,
      "card",
      "Visa",
      "**** 4021",
      100,
      "FUND-0003",
      5,
      4,
      "System"
    ),
    buildHistoryEntry(
      "WWD-0005",
      "CUST-010",
      "Fiifi Amoah",
      30,
      "bank",
      "GCB",
      "**** 0099",
      50,
      "FUND-0005",
      11,
      10,
      "System"
    ),
  ];
}

export function seedCustomerWalletStore(): CustomerWalletStoreState {
  return {
    wallets: seedWallets(),
    fundingTransactions: seedFunding(),
    withdrawalRequests: [buildPendingRequest()],
    withdrawalHistory: seedHistory(),
  };
}