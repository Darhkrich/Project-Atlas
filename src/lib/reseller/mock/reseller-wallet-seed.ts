/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ResellerCommissionLedgerEntry,
  ResellerFundingLedgerEntry,
  ResellerPurchaseLedgerEntry,
  ResellerWalletLedgerEntry,
  ResellerWalletRecord,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalLedgerEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";

const ANCHOR_MS = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;
const FEE_RATE = 0.5;

const ago = (ms: number) => new Date(ANCHOR_MS - ms).toISOString();

function walletIdFor(resellerId: string): string {
  return "WAL-" + resellerId;
}

interface ResellerSeedSpec {
  resellerId: string;
  resellerName: string;
  openingBalance: number;
  daysSinceLastFunding: number;
}

// Section isolation: this list mirrors the reseller seed in lib/admin/mock.
// When a reseller is added there, add an entry here. The duplicated name is
// a mock artifact; the real name will come from the reseller record after
// the auth layer lands.
const RESELLERS: ResellerSeedSpec[] = [
  { resellerId: "RS-001", resellerName: "Kwame Store", openingBalance: 1380, daysSinceLastFunding: 7 },
  { resellerId: "RS-002", resellerName: "Adjoa Ventures", openingBalance: 800, daysSinceLastFunding: 14 },
  { resellerId: "RS-003", resellerName: "Yaw Enterprises", openingBalance: 0, daysSinceLastFunding: 60 },
  { resellerId: "RS-004", resellerName: "Efua Trading", openingBalance: 300, daysSinceLastFunding: 12 },
  { resellerId: "RS-005", resellerName: "Kojo & Sons", openingBalance: 500, daysSinceLastFunding: 20 },
  { resellerId: "RS-006", resellerName: "Ama Digital Services", openingBalance: 620, daysSinceLastFunding: 9 },
  { resellerId: "RS-007", resellerName: "Kofi Communications", openingBalance: 120, daysSinceLastFunding: 30 },
  { resellerId: "RS-008", resellerName: "Nana Ventures", openingBalance: 2100, daysSinceLastFunding: 5 },
  { resellerId: "RS-009", resellerName: "Akua Reseller Hub", openingBalance: 380, daysSinceLastFunding: 22 },
  { resellerId: "RS-010", resellerName: "Adjoa Telecom Ltd", openingBalance: 1450, daysSinceLastFunding: 6 },
  { resellerId: "RS-011", resellerName: "Prince Digital Ltd", openingBalance: 2600, daysSinceLastFunding: 4 },
  { resellerId: "RS-012", resellerName: "Yaa Ventures", openingBalance: 220, daysSinceLastFunding: 18 },
  { resellerId: "RS-013", resellerName: "Kwesi Trading Co", openingBalance: 1750, daysSinceLastFunding: 8 },
  { resellerId: "RS-014", resellerName: "Esi Mobile Ltd", openingBalance: 540, daysSinceLastFunding: 11 },
  { resellerId: "RS-015", resellerName: "Fiifi Enterprises", openingBalance: 95, daysSinceLastFunding: 26 },
  { resellerId: "RS-016", resellerName: "Abena Trading", openingBalance: 880, daysSinceLastFunding: 10 },
  { resellerId: "RS-017", resellerName: "Daniel Digital Services", openingBalance: 3200, daysSinceLastFunding: 3 },
  { resellerId: "RS-018", resellerName: "Patricia Networks", openingBalance: 180, daysSinceLastFunding: 32 },
  { resellerId: "RS-019", resellerName: "Grace Communications", openingBalance: 1650, daysSinceLastFunding: 7 },
  { resellerId: "RS-020", resellerName: "Emmanuel Traders", openingBalance: 420, daysSinceLastFunding: 15 },
];

function seedWallet(spec: ResellerSeedSpec): ResellerWalletRecord {
  return {
    id: walletIdFor(spec.resellerId),
    resellerId: spec.resellerId,
    resellerName: spec.resellerName,
    balance: spec.openingBalance,
    currency: "GHS",
    status: "active",
    updatedAt: ago(spec.daysSinceLastFunding * DAY),
    lastFundingAt:
      spec.openingBalance > 0 ? ago(spec.daysSinceLastFunding * DAY) : null,
    lastCommissionAt: null,
    lastWithdrawalAt: null,
  };
}

// RS-001 carries the richest ledger. Reconstructs to net 1380.
function rs001Ledger(): ResellerWalletLedgerEntry[] {
  const entries: ResellerWalletLedgerEntry[] = [];
  const funding: Array<{ id: string; amount: number; daysAgo: number; method: ResellerFundingLedgerEntry["method"]; provider: string; masked: string }> = [
    { id: "RL-FUND-001", amount: 800, daysAgo: 14, method: "momo", provider: "MTN", masked: "**** 4567" },
    { id: "RL-FUND-002", amount: 500, daysAgo: 7, method: "bank", provider: "GCB", masked: "**** 0099" },
  ];
  for (const f of funding) {
    entries.push({
      id: f.id,
      resellerId: "RS-001",
      kind: "funding",
      amount: f.amount,
      method: f.method,
      provider: f.provider,
      maskedLabel: f.masked,
      reference: "REF-" + f.id,
      status: "successful",
      createdAt: ago(f.daysAgo * DAY),
      completedAt: ago(f.daysAgo * DAY - 60_000),
    });
  }

  const commissions: Array<{ id: string; amount: number; orderId: string; service: string; hoursAgo: number }> = [
    { id: "RL-COM-001", amount: 220, orderId: "ORD-RS-1024", service: "MTN Data 5GB", hoursAgo: 4 },
    { id: "RL-COM-002", amount: 120, orderId: "ORD-RS-1023", service: "DSTV Compact", hoursAgo: 24 },
    { id: "RL-COM-003", amount: 75, orderId: "ORD-RS-1021", service: "Airtime Bundle", hoursAgo: 72 },
    { id: "RL-COM-004", amount: 140, orderId: "ORD-RS-1019", service: "ECG Prepaid", hoursAgo: 120 },
    { id: "RL-COM-005", amount: 95, orderId: "ORD-RS-1018", service: "Vodafone Data 10GB", hoursAgo: 168 },
    { id: "RL-COM-006", amount: 120, orderId: "ORD-RS-1016", service: "WAEC Voucher", hoursAgo: 216 },
  ];
  for (const c of commissions) {
    entries.push({
      id: c.id,
      resellerId: "RS-001",
      kind: "commission",
      amount: c.amount,
      relatedOrderId: c.orderId,
      service: c.service,
      commissionRate: 5,
      grossOrderValue: c.amount * 20,
      createdAt: ago(c.hoursAgo * HOUR),
    });
  }

  const purchases: Array<{ id: string; amount: number; orderId: string; service: string; daysAgo: number }> = [
    { id: "RL-PUR-001", amount: 300, orderId: "ORD-RS-1015", service: "MTN Airtime Bundle for Storefront", daysAgo: 2 },
    { id: "RL-PUR-002", amount: 120, orderId: "ORD-RS-1013", service: "DSTV Subscription Restock", daysAgo: 4 },
    { id: "RL-PUR-003", amount: 150, orderId: "ORD-RS-1011", service: "ECG Prepaid Restock", daysAgo: 6 },
  ];
  for (const p of purchases) {
    entries.push({
      id: p.id,
      resellerId: "RS-001",
      kind: "purchase",
      amount: p.amount,
      relatedOrderId: p.orderId,
      service: p.service,
      createdAt: ago(p.daysAgo * DAY),
    });
  }

  return entries;
}

function rs001WithdrawalHistory(): ResellerWithdrawalHistoryEntry {
  const amount = 120;
  const { fee, total } = computeWithdrawalTotal(amount, FEE_RATE);
  return {
    id: "RWD-0001",
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    kind: "cash_out_to_destination",
    amount,
    fee,
    total,
    destinationId: "DST-RS-001",
    destinationMethod: "momo",
    destinationProvider: "MTN",
    destinationMaskedLabel: "**** 6666",
    destinationNameOnAccount: "Kwame Store",
    status: "completed",
    autoApproved: true,
    approvalRequiredReasons: [],
    transactionRef: "TXN-RWD-0001",
    requestedAt: ago(21 * DAY),
    approvedAt: ago(21 * DAY),
    completedAt: ago(21 * DAY - HOUR),
    resolvedAt: ago(21 * DAY - HOUR),
    resolvedBy: "System",
  };
}

function rs001PendingRequest(): ResellerWithdrawalRequest {
  const amount = 100;
  const { fee, total } = computeWithdrawalTotal(amount, FEE_RATE);
  return {
    id: "RWD-0002",
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    kind: "cash_out_to_destination",
    amount,
    fee,
    total,
    destinationId: "DST-RS-001",
    destinationMethod: "momo",
    destinationProvider: "MTN",
    destinationMaskedLabel: "**** 6666",
    destinationNameOnAccount: "Kwame Store",
    status: "pending_admin",
    autoApproved: false,
    approvalRequiredReasons: [],
    transactionRef: "TXN-RWD-0002",
    requestedAt: ago(6 * HOUR),
  };
}

export function seedResellerWalletStore(): {
  wallets: Record<string, ResellerWalletRecord>;
  ledger: ResellerWalletLedgerEntry[];
  withdrawalRequests: ResellerWithdrawalRequest[];
  withdrawalHistory: ResellerWithdrawalHistoryEntry[];
} {
  const wallets: Record<string, ResellerWalletRecord> = {};
  const ledger: ResellerWalletLedgerEntry[] = [];
  const withdrawalRequests: ResellerWithdrawalRequest[] = [];
  const withdrawalHistory: ResellerWithdrawalHistoryEntry[] = [];

  for (const spec of RESELLERS) {
    wallets[spec.resellerId] = seedWallet(spec);

    // RS-001 gets the rich ledger plus the withdrawal history.
    if (spec.resellerId === "RS-001") {
      ledger.push(...rs001Ledger());

      const hist = rs001WithdrawalHistory();
      withdrawalHistory.push(hist);
      const withdrawalLedger: ResellerWithdrawalLedgerEntry = {
        id: "RL-" + hist.id,
        resellerId: hist.resellerId,
        kind: "withdrawal",
        amount: hist.amount,
        fee: hist.fee,
        total: hist.total,
        withdrawalKind: hist.kind,
        withdrawalId: hist.id,
        status: hist.status,
        createdAt: hist.requestedAt,
      };
      ledger.push(withdrawalLedger);

      withdrawalRequests.push(rs001PendingRequest());
      continue;
    }

    // Every other non-zero reseller gets a single opening funding entry.
    if (spec.openingBalance > 0) {
      ledger.push({
        id: "RL-OPEN-" + spec.resellerId,
        resellerId: spec.resellerId,
        kind: "funding",
        amount: spec.openingBalance,
        method: "bank",
        provider: "GCB",
        maskedLabel: "**** 0000",
        reference: "OPENING-" + spec.resellerId,
        status: "successful",
        createdAt: ago(spec.daysSinceLastFunding * DAY),
        completedAt: ago(spec.daysSinceLastFunding * DAY - 60_000),
      });
    }
  }

  ledger.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { wallets, ledger, withdrawalRequests, withdrawalHistory };
}