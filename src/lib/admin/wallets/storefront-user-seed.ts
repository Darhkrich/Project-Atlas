import type {
  CustomerWallet,
  WalletFundingTransaction,
  WalletStoreState,
  WalletWithdrawalHistoryEntry,
  WalletWithdrawalRequest,
} from "@/lib/admin/types/customer-wallet";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";

const ANCHOR_MS = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(ANCHOR_MS - ms).toISOString();

interface WalletSeed {
  ownerId: string;
  ownerName: string;
  storefrontId: string;
  balance: number;
  daysSinceLastFunding: number;
}

const WALLETS_SEED: WalletSeed[] = [
  {
    ownerId: "SFU-001",
    ownerName: "Nana Ama",
    storefrontId: "SF-RS-001",
    balance: 75,
    daysSinceLastFunding: 3,
  },
  {
    ownerId: "SFU-002",
    ownerName: "Kojo Danso",
    storefrontId: "SF-RS-001",
    balance: 12,
    daysSinceLastFunding: 8,
  },
  {
    ownerId: "SFU-003",
    ownerName: "Adwoa Serwaa",
    storefrontId: "SF-RS-002",
    balance: 210,
    daysSinceLastFunding: 1,
  },
];

function walletIdFor(ownerId: string): string {
  return "WAL-" + ownerId;
}

function seedWallets(): Record<string, CustomerWallet> {
  const out: Record<string, CustomerWallet> = {};
  for (const s of WALLETS_SEED) {
    const id = walletIdFor(s.ownerId);
    out[id] = {
      id,
      ownerId: s.ownerId,
      ownerName: s.ownerName,
      ownerType: "reseller_storefront_user",
      storefrontId: s.storefrontId,
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

function seedFunding(): WalletFundingTransaction[] {
  const seeds: Array<{
    ownerId: string;
    amount: number;
    provider: string;
    masked: string;
    daysAgo: number;
  }> = [
    { ownerId: "SFU-001", amount: 100, provider: "Vodafone", masked: "**** 3344", daysAgo: 3 },
    { ownerId: "SFU-002", amount: 20, provider: "Vodafone", masked: "**** 3344", daysAgo: 8 },
    { ownerId: "SFU-003", amount: 250, provider: "MTN", masked: "**** 5599", daysAgo: 1 },
  ];
  return seeds.map((s, i) => {
    const n = i + 6;
    const id = "FUND-" + String(n).padStart(4, "0");
    return {
      id,
      walletId: walletIdFor(s.ownerId),
      ownerId: s.ownerId,
      amount: s.amount,
      method: "momo" as const,
      provider: s.provider,
      maskedLabel: s.masked,
      reference: "FUNDREF-" + String(n).padStart(4, "0"),
      status: "successful" as const,
      createdAt: ago(s.daysAgo * DAY),
      completedAt: ago(s.daysAgo * DAY - 60_000),
    };
  });
}

function seedRequests(): WalletWithdrawalRequest[] {
  const { fee, total } = computeWithdrawalTotal(200, 0.5);
  return [
    {
      id: "WWD-0002",
      walletId: walletIdFor("SFU-003"),
      ownerId: "SFU-003",
      ownerName: "Adwoa Serwaa",
      ownerType: "reseller_storefront_user",
      storefrontId: "SF-RS-002",
      amount: 200,
      fee,
      total,
      sourcePaymentId: "FUND-0008",
      sourceMethodId: "momo",
      sourceProvider: "MTN",
      sourceMaskedLabel: "**** 5599",
      sourceCreatedAt: ago(1 * DAY),
      sourceAmount: 250,
      status: "pending_admin",
      autoApproved: false,
      approvalRequiredReasons: ["exceeds_threshold"],
      transactionRef: "TXN-WWD-0002",
      requestedAt: ago(6 * HOUR),
    },
  ];
}

function seedHistory(): WalletWithdrawalHistoryEntry[] {
  const sfu001 = computeWithdrawalTotal(75, 0.5);
  const sfu002 = computeWithdrawalTotal(25, 0.5);
  return [
    {
      id: "WWD-0004",
      walletId: walletIdFor("SFU-001"),
      ownerId: "SFU-001",
      ownerName: "Nana Ama",
      ownerType: "reseller_storefront_user",
      storefrontId: "SF-RS-001",
      amount: 75,
      fee: sfu001.fee,
      total: sfu001.total,
      sourcePaymentId: "FUND-0006",
      sourceMethodId: "momo",
      sourceProvider: "Vodafone",
      sourceMaskedLabel: "**** 3344",
      sourceCreatedAt: ago(3 * DAY),
      sourceAmount: 100,
      status: "rejected",
      autoApproved: false,
      approvalRequiredReasons: [],
      rejectionReason: "Source payment still within verification window",
      approvedBy: "Finance Admin",
      transactionRef: "TXN-WWD-0004",
      requestedAt: ago(3 * DAY),
      resolvedAt: ago(2 * DAY),
    },
    {
      id: "WWD-0006",
      walletId: walletIdFor("SFU-002"),
      ownerId: "SFU-002",
      ownerName: "Kojo Danso",
      ownerType: "reseller_storefront_user",
      storefrontId: "SF-RS-001",
      amount: 25,
      fee: sfu002.fee,
      total: sfu002.total,
      sourcePaymentId: "FUND-0007",
      sourceMethodId: "momo",
      sourceProvider: "Vodafone",
      sourceMaskedLabel: "**** 3344",
      sourceCreatedAt: ago(8 * DAY),
      sourceAmount: 20,
      status: "failed",
      autoApproved: false,
      approvalRequiredReasons: [],
      failureReason: "insufficient_balance",
      transactionRef: "TXN-WWD-0006",
      requestedAt: ago(8 * DAY),
      resolvedAt: ago(7 * DAY),
    },
  ];
}

export function seedStorefrontUserWalletStore(): WalletStoreState {
  const wallets = seedWallets();
  const history = seedHistory();
  const lastWithdrawalByWallet: Record<string, string> = {};
  for (const h of history) {
    const current = lastWithdrawalByWallet[h.walletId];
    if (!current || new Date(h.resolvedAt) > new Date(current)) {
      lastWithdrawalByWallet[h.walletId] = h.resolvedAt;
    }
  }
  for (const id of Object.keys(wallets)) {
    if (lastWithdrawalByWallet[id]) {
      wallets[id].lastWithdrawalAt = lastWithdrawalByWallet[id];
    }
  }
  return {
    wallets,
    fundingTransactions: seedFunding(),
    withdrawalRequests: seedRequests(),
    withdrawalHistory: history,
  };
}