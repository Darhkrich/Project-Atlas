import type { Reseller } from "@/lib/admin/types/reseller";
import type {
  ResellerCommissionConfig,
  ResellerCommissionWallet,
  WalletApprovalReason,
  WalletCredit,
  WalletSummary,
  WithdrawalHistoryEntry,
  WithdrawalHistoryStatus,
  WithdrawalMethod,
  WithdrawalRequest,
} from "@/lib/admin/types/reseller-commission-wallet";
import type {
  ResellerWalletLedgerEntry,
  ResellerWalletStoreState,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import type { CommissionTotals } from "./helpers";

const ZERO_TOTALS: CommissionTotals = { earned: 0, pending: 0, paid: 0 };

function mapWithdrawalMethod(
  req: ResellerWithdrawalRequest | ResellerWithdrawalHistoryEntry
): WithdrawalMethod {
  if (req.kind === "refund_to_source") {
    return req.sourceMethodId === "bank" ? "Bank Transfer" : "Mobile Money";
  }
  return req.destinationMethod === "bank" ? "Bank Transfer" : "Mobile Money";
}

function mapHistoryStatus(
  s: ResellerWithdrawalHistoryEntry["status"]
): WithdrawalHistoryStatus {
  if (s === "completed") return "completed";
  if (s === "failed") return "failed";
  return "rejected";
}

export function projectWallet(
  reseller: Reseller,
  state: ResellerWalletStoreState,
  commissionTotalsById: Map<string, CommissionTotals>
): ResellerCommissionWallet {
  const walletRecord = state.wallets[reseller.id];
  const balance = walletRecord?.balance ?? 0;

  const myLedger = state.ledger.filter((e) => e.resellerId === reseller.id);
  const myRequests = state.withdrawalRequests.filter(
    (r) => r.resellerId === reseller.id
  );
  const myHistory = state.withdrawalHistory.filter(
    (h) => h.resellerId === reseller.id
  );

  const commissions = myLedger.filter(
    (e): e is Extract<ResellerWalletLedgerEntry, { kind: "commission" }> =>
      e.kind === "commission"
  );

  const sortedCommissions = [...commissions].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const recentCredits: WalletCredit[] = sortedCommissions
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      orderId: c.relatedOrderId,
      service: c.service,
      amount: c.amount,
      createdAt: c.createdAt,
    }));

  const withdrawalRequests: WithdrawalRequest[] = myRequests.map((r) => ({
    id: r.id,
    amount: r.amount,
    fee: r.fee,
    total: r.total,
    method: mapWithdrawalMethod(r),
    requestedAt: r.requestedAt,
    status: "pending",
    approvalRequiredReasons: [],
  }));

  const withdrawalHistory: WithdrawalHistoryEntry[] = myHistory.map((h) => ({
    id: h.id,
    amount: h.amount,
    fee: h.fee,
    total: h.total,
    method: mapWithdrawalMethod(h),
    requestedAt: h.requestedAt,
    resolvedAt: h.resolvedAt,
    status: mapHistoryStatus(h.status),
    autoApproved: h.autoApproved,
    reason: h.rejectionReason ?? h.failureReason,
    actor: h.resolvedBy,
  }));

  const totals = commissionTotalsById.get(reseller.id) ?? ZERO_TOTALS;

  return {
    id: "CW-" + reseller.id,
    resellerId: reseller.id,
    resellerName: reseller.businessName,
    currency: "GHS",
    balance,
    isOverdrawn: balance < 0,
    pendingBalance: totals.pending,
    totalEarned: totals.earned,
    totalWithdrawn: totals.paid,
    lastCreditAt: sortedCommissions[0]?.createdAt ?? null,
    recentCredits,
    withdrawalRequests,
    withdrawalHistory,
  };
}

export function projectWallets(
  resellers: Reseller[],
  state: ResellerWalletStoreState,
  commissionTotalsById: Map<string, CommissionTotals>
): ResellerCommissionWallet[] {
  return resellers.map((r) =>
    projectWallet(r, state, commissionTotalsById)
  );
}

export function deriveApprovalReasons(
  reseller: Reseller,
  wallet: ResellerCommissionWallet,
  request: WithdrawalRequest,
  config: ResellerCommissionConfig
): WalletApprovalReason[] {
  const reasons: WalletApprovalReason[] = [];

  if (request.method !== "Wallet Credit") {
    if (request.total > config.withdrawalApprovalThreshold) {
      reasons.push("exceeds_threshold");
    }
  }

  if (request.total > wallet.balance) {
    reasons.push("insufficient_balance");
  }

  if (reseller.status === "suspended") {
    reasons.push("reseller_suspended");
  }

  if (
    reseller.verificationStatus !== "verified" &&
    reseller.verificationStatus !== "pending"
  ) {
    reasons.push("verification_not_approved");
  }

  return reasons;
}

export function projectWalletsWithReasons(
  resellers: Reseller[],
  state: ResellerWalletStoreState,
  config: ResellerCommissionConfig,
  commissionTotalsById: Map<string, CommissionTotals>
): ResellerCommissionWallet[] {
  const byId = new Map(resellers.map((r) => [r.id, r] as const));
  return projectWallets(resellers, state, commissionTotalsById).map((w) => {
    const reseller = byId.get(w.resellerId);
    if (!reseller) return w;
    const requests: WithdrawalRequest[] = w.withdrawalRequests.map((req) => ({
      ...req,
      approvalRequiredReasons: deriveApprovalReasons(reseller, w, req, config),
    }));
    return { ...w, withdrawalRequests: requests };
  });
}

export function walletSummary(
  wallets: ResellerCommissionWallet[],
  totalResellers: number
): WalletSummary {
  let pending = 0;
  let awaiting = 0;
  let overdrawn = 0;
  let feeRevenue = 0;
  let feeCount = 0;

  for (const w of wallets) {
    pending += w.pendingBalance;
    for (const r of w.withdrawalRequests) {
      if (r.method !== "Wallet Credit") awaiting += 1;
    }
    for (const h of w.withdrawalHistory) {
      if (h.status === "completed") {
        feeRevenue += h.fee;
        feeCount += 1;
      }
    }
    if (w.isOverdrawn) overdrawn += 1;
  }

  return {
    totalPending: pending,
    awaitingApproval: awaiting,
    overdrawnCount: overdrawn,
    walletCount: wallets.length,
    resellerCount: totalResellers,
    feeRevenueTotal: Math.round(feeRevenue * 100) / 100,
    feeRevenueWithdrawalCount: feeCount,
    currency: "GHS",
  };
}