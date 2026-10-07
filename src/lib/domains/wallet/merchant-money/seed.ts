// lib/domains/wallet/merchant-money/seed.ts

import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import type {
  MerchantAutoPayConfig,
  MerchantCustomerPaymentLedgerEntry,
  MerchantFundingLedgerEntry,
  MerchantMoneyStoreState,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
  MerchantSavedPaymentMethod,
  MerchantTransferLedgerEntry,
  MerchantWalletLedgerEntry,
  MerchantWalletRecord,
  MerchantWalletState,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalLedgerEntry,
  MerchantWithdrawalRequest,
  RegisteredDestination,
} from "./types";

const HOUR = 3_600_000;
const DAY = 86_400_000;

interface MerchantSeedInput {
  id: string;
  businessName: string;
}

const SEED_MERCHANTS: MerchantSeedInput[] = [
  { id: "MER-001", businessName: "TechHub Store" },
  { id: "MER-002", businessName: "Ada's Kiosk" },
  { id: "MER-003", businessName: "Kwame Electronics" },
  { id: "MER-004", businessName: "Accra Traders" },
  { id: "MER-005", businessName: "Linda's Boutique" },
  { id: "MER-006", businessName: "Kofi Wholesale" },
  { id: "MER-007", businessName: "Yaa Cosmetics" },
  { id: "MER-008", businessName: "Emmanuel Foods" },
  { id: "MER-009", businessName: "Nana Shoes" },
  { id: "MER-010", businessName: "Comfort Fabrics" },
  { id: "MER-011", businessName: "Prince Phones" },
  { id: "MER-012", businessName: "Abena Groceries" },
  { id: "MER-013", businessName: "Kwesi Motors" },
  { id: "MER-014", businessName: "Esi Beauty" },
  { id: "MER-015", businessName: "Daniel Books" },
  { id: "MER-016", businessName: "Patricia Home" },
  { id: "MER-017", businessName: "Grace Networks" },
  { id: "MER-018", businessName: "Fiifi Pharmacy" },
  { id: "MER-019", businessName: "Akua Fashion" },
  { id: "MER-020", businessName: "Yaw Stationery" },
];

const PLAN_CODES = ["starter", "growth", "pro", "enterprise"] as const;
type PlanCode = (typeof PLAN_CODES)[number];

const PLAN_MONTHLY: Record<PlanCode, number> = {
  starter: 50,
  growth: 150,
  pro: 400,
  enterprise: 2500,
};

const MAIN_TOP_UP: Record<string, number> = {
  "MER-008": 9000,
  "MER-020": 8000,
};

function pickPlan(seed: number): PlanCode {
  return PLAN_CODES[seed % PLAN_CODES.length];
}

export function buildWalletRecord(
  merchantId: string,
  merchantName: string,
  walletType: "billing" | "main",
  referenceNowMs: number
): MerchantWalletRecord {
  const isBilling = walletType === "billing";
  return {
    id: "MW-" + merchantId + (isBilling ? "-B" : "-M"),
    merchantId,
    merchantName,
    walletType,
    balance: 0,
    currency: "GHS",
    status: "active",
    updatedAt: new Date(
      referenceNowMs - (isBilling ? 30 : 1) * DAY
    ).toISOString(),
    lastFundingAt: null,
    lastCreditAt: null,
    lastDebitAt: null,
  };
}

export function buildBlankAutoPayConfig(
  referenceNowMs: number
): MerchantAutoPayConfig {
  return {
    enabled: false,
    source: "billing_wallet",
    updatedAt: new Date(referenceNowMs).toISOString(),
    updatedBy: "System",
  };
}

function buildDestination(
  merchantId: string,
  seed: number,
  referenceNowMs: number
): RegisteredDestination {
  const isBank = seed % 3 === 0;
  return {
    id: "MDST-" + merchantId,
    merchantId,
    method: isBank ? "bank" : "momo",
    provider: isBank ? "GCB" : seed % 2 === 0 ? "MTN" : "Vodafone",
    accountNumber: isBank
      ? String(1000000000 + seed * 1234).slice(0, 10)
      : "0" + String(200000000 + seed * 777).slice(0, 9),
    maskedLabel: "**** " + String(1000 + (seed % 9000)).slice(-4),
    nameOnAccount: "Merchant Account",
    verifiedAt: new Date(referenceNowMs - 60 * DAY).toISOString(),
  };
}

function buildAutoPay(
  merchantId: string,
  seed: number,
  referenceNowMs: number
): MerchantAutoPayConfig {
  const hasCard = seed % 4 === 0;
  return {
    enabled: hasCard,
    source: hasCard ? "card" : "billing_wallet",
    cardRef: hasCard ? "tok_" + merchantId.toLowerCase() : undefined,
    cardBrand: hasCard
      ? seed % 2 === 0
        ? "visa"
        : "mastercard"
      : undefined,
    cardLast4: hasCard
      ? String(4000 + (seed % 1000)).slice(-4)
      : undefined,
    updatedAt: new Date(referenceNowMs - 30 * DAY).toISOString(),
    updatedBy: "System",
  };
}

function buildSavedMethods(
  merchantId: string,
  seed: number,
  referenceNowMs: number
): MerchantSavedPaymentMethod[] {
  if (seed % 3 !== 0) return [];
  return [
    {
      id: "MSM-" + merchantId + "-01",
      merchantId,
      methodId: "card",
      provider: seed % 2 === 0 ? "Visa" : "Mastercard",
      maskedLabel: "**** " + String(4000 + (seed % 900)).slice(-4),
      tokenRef: "tok_" + merchantId.toLowerCase() + "_saved",
      label: "Primary card",
      isDefault: true,
      createdAt: new Date(referenceNowMs - 90 * DAY).toISOString(),
      updatedAt: new Date(referenceNowMs - 90 * DAY).toISOString(),
    },
  ];
}

interface BuiltMerchant {
  billingFunding: MerchantFundingLedgerEntry | null;
  mainFunding: MerchantFundingLedgerEntry | null;
  customerPayments: MerchantCustomerPaymentLedgerEntry[];
  planCharges: MerchantPlanChargeLedgerEntry[];
  refunds: MerchantRefundLedgerEntry[];
  transfers: MerchantTransferLedgerEntry[];
  withdrawalRequests: MerchantWithdrawalRequest[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  withdrawalLedger: MerchantWithdrawalLedgerEntry[];
}

function buildMerchantLedger(
  merchant: MerchantSeedInput,
  seed: number,
  referenceNowMs: number,
  feeRatePercent: number,
  destination: RegisteredDestination
): BuiltMerchant {
  const plan = pickPlan(seed);
  const planAmount = PLAN_MONTHLY[plan];

  const billingFundingAmount = planAmount * 3 + 50;
  const billingFunding: MerchantFundingLedgerEntry = {
    id: "ML-BF-" + merchant.id + "-01",
    merchantId: merchant.id,
    walletType: "billing",
    kind: "funding",
    amount: billingFundingAmount,
    method: "momo",
    provider: "MTN",
    maskedLabel: "**** " + String(1000 + seed * 11).slice(-4),
    reference: "REF-BF-" + merchant.id,
    status: "successful",
    createdAt: new Date(referenceNowMs - 100 * DAY).toISOString(),
    completedAt: new Date(referenceNowMs - 100 * DAY + 60_000).toISOString(),
    transactionRef: "TXN-BF-" + merchant.id,
  };

  const baseMainFunding = seed % 2 === 0 ? 200 + (seed % 4) * 100 : 0;
  const topUp = MAIN_TOP_UP[merchant.id] ?? 0;
  const mainFundingAmount = baseMainFunding + topUp;
  const mainFunding: MerchantFundingLedgerEntry | null =
    mainFundingAmount > 0
      ? {
          id: "ML-MF-" + merchant.id + "-01",
          merchantId: merchant.id,
          walletType: "main",
          kind: "funding",
          amount: mainFundingAmount,
          method: "bank",
          provider: "GCB",
          maskedLabel: "**** " + String(1000 + seed * 13).slice(-4),
          reference: "REF-MF-" + merchant.id,
          status: "successful",
          createdAt: new Date(referenceNowMs - 120 * DAY).toISOString(),
          completedAt: new Date(
            referenceNowMs - 120 * DAY + 60_000
          ).toISOString(),
          transactionRef: "TXN-MF-" + merchant.id,
        }
      : null;

  const customerPaymentCount = 3 + (seed % 4);
  const customerPayments: MerchantCustomerPaymentLedgerEntry[] = [];
  for (let i = 0; i < customerPaymentCount; i++) {
    const amount = 60 + ((seed * (i + 1) * 17) % 400);
    const dayAgo = 1 + i * 2 + (seed % 3);
    customerPayments.push({
      id:
        "ML-CP-" +
        merchant.id +
        "-" +
        String(i + 1).padStart(2, "0"),
      merchantId: merchant.id,
      walletType: "main",
      kind: "customer_payment",
      amount,
      relatedOrderId:
        "ORD-" + merchant.id + "-" + String(i + 1).padStart(2, "0"),
      relatedOrderNumber:
        "ATL-" + merchant.id + "-" + String(i + 1).padStart(2, "0"),
      customerEmail: "customer" + (i + 1) + "@example.com",
      paymentMethod: i % 3 === 0 ? "Card" : "Mobile Money",
      paymentProvider: i % 3 === 0 ? "Visa" : "MTN",
      createdAt: new Date(referenceNowMs - dayAgo * DAY).toISOString(),
      settledAt: new Date(
        referenceNowMs - dayAgo * DAY + 60_000
      ).toISOString(),
      transactionRef:
        "TXN-CP-" +
        merchant.id +
        "-" +
        String(i + 1).padStart(2, "0"),
    });
  }
  const customerPaymentTotal = customerPayments.reduce(
    (s, p) => s + p.amount,
    0
  );

  const planCharges: MerchantPlanChargeLedgerEntry[] = [];
  for (let i = 0; i < 3; i++) {
    const monthAgo = 30 * (i + 1);
    planCharges.push({
      id: "ML-PC-" + merchant.id + "-" + String(i + 1).padStart(2, "0"),
      merchantId: merchant.id,
      walletType: "billing",
      kind: "plan_charge",
      amount: planAmount,
      planCode: plan,
      billingCycle: "monthly",
      status: "successful",
      source: "billing_wallet",
      createdAt: new Date(referenceNowMs - monthAgo * DAY).toISOString(),
      completedAt: new Date(
        referenceNowMs - monthAgo * DAY + 60_000
      ).toISOString(),
      transactionRef:
        "TXN-PC-" +
        merchant.id +
        "-" +
        String(i + 1).padStart(2, "0"),
    });
  }

  const refunds: MerchantRefundLedgerEntry[] = [];
  let mainRunning = mainFundingAmount + customerPaymentTotal;

  if (seed % 5 === 0) {
    const refundAmount = 40 + (seed % 80);
    if (mainRunning - refundAmount >= 0) {
      refunds.push({
        id: "ML-RF-" + merchant.id + "-01",
        merchantId: merchant.id,
        walletType: "main",
        kind: "refund",
        amount: refundAmount,
        relatedOrderId: "ORD-" + merchant.id + "-RF1",
        relatedOrderNumber: "ATL-" + merchant.id + "-RF1",
        customerEmail: "refund.customer@example.com",
        reason: "Item not as described",
        createdAt: new Date(referenceNowMs - 3 * DAY).toISOString(),
        settledAt: new Date(
          referenceNowMs - 3 * DAY + 120_000
        ).toISOString(),
        transactionRef: "TXN-RF-" + merchant.id + "-01",
      });
      mainRunning -= refundAmount;
    }
  }

  const transfers: MerchantTransferLedgerEntry[] = [];
  if (seed % 6 === 0) {
    const amount = 100 + (seed % 3) * 50;
    if (mainRunning - amount >= 0) {
      const ref = "TRF-" + merchant.id;
      const at = new Date(referenceNowMs - 8 * DAY).toISOString();
      transfers.push(
        {
          id: "ML-TR-" + merchant.id + "-OUT",
          merchantId: merchant.id,
          walletType: "main",
          kind: "transfer_out",
          amount,
          pairedEntryId: "ML-TR-" + merchant.id + "-IN",
          counterpartyWalletType: "billing",
          transferRef: ref,
          createdAt: at,
          transactionRef: ref,
        },
        {
          id: "ML-TR-" + merchant.id + "-IN",
          merchantId: merchant.id,
          walletType: "billing",
          kind: "transfer_in",
          amount,
          pairedEntryId: "ML-TR-" + merchant.id + "-OUT",
          counterpartyWalletType: "main",
          transferRef: ref,
          createdAt: at,
          transactionRef: ref,
        }
      );
      mainRunning -= amount;
    }
  }

  const withdrawalRequests: MerchantWithdrawalRequest[] = [];
  const withdrawalHistory: MerchantWithdrawalHistoryEntry[] = [];
  const withdrawalLedger: MerchantWithdrawalLedgerEntry[] = [];

  const desiredCompleted = 200 + (seed % 5) * 100;
  const { fee: completedFee, total: completedTotal } = computeWithdrawalTotal(
    desiredCompleted,
    feeRatePercent
  );
  if (mainRunning - completedTotal >= 0) {
    const completedAt = new Date(referenceNowMs - 5 * DAY).toISOString();
    const completedRequest: MerchantWithdrawalRequest = {
      id: "MWD-" + merchant.id + "-01",
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      amount: desiredCompleted,
      fee: completedFee,
      total: completedTotal,
      destinationId: destination.id,
      destinationMethod: destination.method,
      destinationProvider: destination.provider,
      destinationMaskedLabel: destination.maskedLabel,
      destinationNameOnAccount: destination.nameOnAccount,
      status: "completed",
      autoApproved: true,
      approvalRequiredReasons: [],
      transactionRef: "TXN-MWD-" + merchant.id + "-01",
      requestedAt: completedAt,
      approvedAt: completedAt,
      completedAt: completedAt,
    };
    withdrawalHistory.push({
      ...completedRequest,
      resolvedAt: completedAt,
      resolvedBy: "System",
    });
    withdrawalLedger.push({
      id: "ML-" + completedRequest.id,
      merchantId: merchant.id,
      walletType: "main",
      kind: "withdrawal",
      amount: desiredCompleted,
      fee: completedFee,
      total: completedTotal,
      withdrawalId: completedRequest.id,
      status: "completed",
      destinationSummary:
        destination.provider + " " + destination.maskedLabel,
      createdAt: completedAt,
      completedAt: completedAt,
      transactionRef: completedRequest.transactionRef,
    });
    mainRunning -= completedTotal;
  }

  if (topUp > 0) {
    const pendingAmount = 5100 + (seed % 5) * 100;
    const { fee: pendingFee, total: pendingTotal } = computeWithdrawalTotal(
      pendingAmount,
      feeRatePercent
    );
    if (mainRunning - pendingTotal >= 0) {
      const pendingAt = new Date(referenceNowMs - 6 * HOUR).toISOString();
      const pendingRequest: MerchantWithdrawalRequest = {
        id: "MWD-" + merchant.id + "-02",
        merchantId: merchant.id,
        merchantName: merchant.businessName,
        amount: pendingAmount,
        fee: pendingFee,
        total: pendingTotal,
        destinationId: destination.id,
        destinationMethod: destination.method,
        destinationProvider: destination.provider,
        destinationMaskedLabel: destination.maskedLabel,
        destinationNameOnAccount: destination.nameOnAccount,
        status: "pending_admin",
        autoApproved: false,
        approvalRequiredReasons: ["exceeds_threshold"],
        transactionRef: "TXN-MWD-" + merchant.id + "-02",
        requestedAt: pendingAt,
      };
      withdrawalRequests.push(pendingRequest);
      withdrawalLedger.push({
        id: "ML-" + pendingRequest.id,
        merchantId: merchant.id,
        walletType: "main",
        kind: "withdrawal",
        amount: pendingAmount,
        fee: pendingFee,
        total: pendingTotal,
        withdrawalId: pendingRequest.id,
        status: "pending_admin",
        destinationSummary:
          destination.provider + " " + destination.maskedLabel,
        createdAt: pendingAt,
        transactionRef: pendingRequest.transactionRef,
      });
      mainRunning -= pendingTotal;
    }
  }

  return {
    billingFunding,
    mainFunding,
    customerPayments,
    planCharges,
    refunds,
    transfers,
    withdrawalRequests,
    withdrawalHistory,
    withdrawalLedger,
  };
}

function buildMerchantState(
  merchant: MerchantSeedInput,
  seed: number,
  referenceNowMs: number,
  config: WalletAutoApproveConfig
): MerchantWalletState {
  const destination = buildDestination(merchant.id, seed, referenceNowMs);
  const built = buildMerchantLedger(
    merchant,
    seed,
    referenceNowMs,
    config.feeRatePercent,
    destination
  );

  const ledger: MerchantWalletLedgerEntry[] = [];
  if (built.billingFunding) ledger.push(built.billingFunding);
  if (built.mainFunding) ledger.push(built.mainFunding);
  ledger.push(...built.customerPayments);
  ledger.push(...built.planCharges);
  ledger.push(...built.refunds);
  ledger.push(...built.transfers);
  ledger.push(...built.withdrawalLedger);
  ledger.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    billing: buildWalletRecord(
      merchant.id,
      merchant.businessName,
      "billing",
      referenceNowMs
    ),
    main: buildWalletRecord(
      merchant.id,
      merchant.businessName,
      "main",
      referenceNowMs
    ),
    ledger,
    withdrawalRequests: built.withdrawalRequests,
    withdrawalHistory: built.withdrawalHistory,
    destination,
    savedMethods: buildSavedMethods(merchant.id, seed, referenceNowMs),
    autoPay: buildAutoPay(merchant.id, seed, referenceNowMs),
  };
}

export function buildMerchantMoneySeed(
  referenceNowMs: number,
  config: WalletAutoApproveConfig
): MerchantMoneyStoreState {
  const out: MerchantMoneyStoreState = {};
  for (let i = 0; i < SEED_MERCHANTS.length; i++) {
    const m = SEED_MERCHANTS[i];
    out[m.id] = buildMerchantState(m, i + 1, referenceNowMs, config);
  }
  return out;
}

export { SEED_MERCHANTS };
export type { MerchantSeedInput };