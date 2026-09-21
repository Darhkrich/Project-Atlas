import type {
  CustomerFundingTransaction,
  CustomerWalletRecord,
  CustomerWalletStoreState,
  CustomerWalletSummary,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
  RefundableSource,
  WithdrawalAmountBounds,
} from "@/lib/customer/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { MIN_WITHDRAWAL_AMOUNT } from "./wallet-constants";
import {
  FUNDING_STATUS_LABEL,
  FUNDING_STATUS_VARIANT,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  describeSource,
} from "./wallet-labels";

export interface WalletView {
  record: CustomerWalletRecord;
  isFrozen: boolean;
  hasPendingRefunds: boolean;
}

export interface FundingRow {
  id: string;
  amount: number;
  method: CustomerFundingTransaction["method"];
  provider: string;
  maskedLabel: string;
  reference: string;
  status: CustomerFundingTransaction["status"];
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  createdAt: string;
  isRefundable: boolean;
  remainingRefundable: number;
}

export interface PendingRefundRow {
  id: string;
  amount: number;
  fee: number;
  total: number;
  sourceProvider: string;
  sourceMaskedLabel: string;
  sourceMethodId: CustomerFundingTransaction["method"];
  status: CustomerWithdrawalRequest["status"];
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  requestedAt: string;
  canCancel: boolean;
  approvalReasons: string[];
  raw: CustomerWithdrawalRequest;
}

function walletIdFor(customerId: string): string {
  return "WAL-" + customerId;
}

export function projectWallet(
  state: CustomerWalletStoreState,
  customerId: string
): WalletView | null {
  const record = state.wallets[walletIdFor(customerId)];
  if (!record) return null;
  const pending = state.withdrawalRequests.filter(
    (r) => r.customerId === customerId
  );
  return {
    record,
    isFrozen: record.status === "frozen",
    hasPendingRefunds: pending.length > 0,
  };
}

export function deriveRefundableSources(
  state: CustomerWalletStoreState,
  customerId: string
): RefundableSource[] {
  const out: RefundableSource[] = [];
  const funding = state.fundingTransactions.filter(
    (t) => t.customerId === customerId
  );
  const history = state.withdrawalHistory.filter(
    (h) => h.customerId === customerId
  );
  const requests = state.withdrawalRequests.filter(
    (r) => r.customerId === customerId
  );

  for (const tx of funding) {
    if (tx.status !== "successful") continue;

    const refundedAmount = history
      .filter(
        (h) =>
          h.sourcePaymentId === tx.id &&
          (h.status === "completed" ||
            h.status === "pending_admin" ||
            h.status === "pending_processing")
      )
      .reduce((s, h) => s + h.amount, 0);

    const pendingAmount = requests
      .filter((r) => r.sourcePaymentId === tx.id)
      .reduce((s, r) => s + r.amount, 0);

    const consumed = refundedAmount + pendingAmount;
    const remainingAmount = Math.max(0, tx.amount - consumed);

    out.push({
      transaction: tx,
      alreadyRefundedAmount: consumed,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
    });
  }
  return out;
}

export function projectFundingRows(
  state: CustomerWalletStoreState,
  customerId: string
): FundingRow[] {
  const sources = deriveRefundableSources(state, customerId);
  const byId = new Map(sources.map((s) => [s.transaction.id, s] as const));

  const funding = state.fundingTransactions.filter(
    (t) => t.customerId === customerId
  );

  const rows: FundingRow[] = funding.map((tx) => {
    const source = byId.get(tx.id);
    return {
      id: tx.id,
      amount: tx.amount,
      method: tx.method,
      provider: tx.provider,
      maskedLabel: tx.maskedLabel,
      reference: tx.reference,
      status: tx.status,
      statusLabel: FUNDING_STATUS_LABEL[tx.status],
      statusVariant: FUNDING_STATUS_VARIANT[tx.status],
      createdAt: tx.createdAt,
      isRefundable:
        tx.status === "successful" &&
        source !== undefined &&
        source.remainingAmount >= MIN_WITHDRAWAL_AMOUNT,
      remainingRefundable: source?.remainingAmount ?? 0,
    };
  });

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectPendingRefunds(
  state: CustomerWalletStoreState,
  customerId: string
): PendingRefundRow[] {
  const requests = state.withdrawalRequests.filter(
    (r) => r.customerId === customerId
  );

  const rows: PendingRefundRow[] = requests.map((req) => ({
    id: req.id,
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    sourceProvider: req.sourceProvider,
    sourceMaskedLabel: req.sourceMaskedLabel,
    sourceMethodId: req.sourceMethodId,
    status: req.status,
    statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
    requestedAt: req.requestedAt,
    canCancel: req.status === "pending_admin",
    approvalReasons: req.approvalRequiredReasons,
    raw: req,
  }));

  rows.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  return rows;
}

export function projectWithdrawalHistory(
  state: CustomerWalletStoreState,
  customerId: string
): CustomerWithdrawalHistoryEntry[] {
  return state.withdrawalHistory
    .filter((h) => h.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );
}

export function projectSummary(
  state: CustomerWalletStoreState,
  customerId: string
): CustomerWalletSummary | null {
  const wallet = state.wallets[walletIdFor(customerId)];
  if (!wallet) return null;

  const funding = state.fundingTransactions.filter(
    (t) => t.customerId === customerId
  );
  const requests = state.withdrawalRequests.filter(
    (r) => r.customerId === customerId
  );

  let totalDeposits = 0;
  let successfulFundingCount = 0;
  for (const tx of funding) {
    if (tx.status === "successful") {
      totalDeposits += tx.amount;
      successfulFundingCount += 1;
    }
  }

  const totalPendingRefunds = requests.reduce((s, r) => s + r.amount, 0);

  // Money that has left this wallet. Deposits minus current balance.
  // Pending refunds have already debited the balance at request time, so
  // they are NOT subtracted again. Orders spending is not tracked here.
  const totalOutflow = Math.max(
    0,
    Math.round((totalDeposits - wallet.balance) * 100) / 100
  );

  return {
    totalDeposits: Math.round(totalDeposits * 100) / 100,
    totalOutflow,
    successfulFundingCount,
    pendingRefundCount: requests.length,
    pendingRefundAmount: Math.round(totalPendingRefunds * 100) / 100,
    currency: "GHS",
  };
}

export function deriveWithdrawAmountBounds(
  wallet: CustomerWalletRecord,
  source: RefundableSource,
  config: WalletAutoApproveConfig
): WithdrawalAmountBounds {
  const feeRate = config.feeRatePercent;
  const maxBySource = source.remainingAmount;
  const maxByBalance =
    feeRate > 0 ? wallet.balance / (1 + feeRate / 100) : wallet.balance;
  const max = Math.max(
    0,
    Math.floor(Math.min(maxBySource, maxByBalance) * 100) / 100
  );
  const { fee, total } = computeWithdrawalTotal(max, feeRate);
  return {
    min: MIN_WITHDRAWAL_AMOUNT,
    max,
    fee,
    total,
  };
}

export function requiresAdminApproval(
  amount: number,
  config: WalletAutoApproveConfig
): boolean {
  const { total } = computeWithdrawalTotal(amount, config.feeRatePercent);
  return total > config.thresholdGHS;
}

export function describeFundingSource(
  tx: CustomerFundingTransaction
): string {
  return describeSource(tx.method, tx.provider, tx.maskedLabel);
}