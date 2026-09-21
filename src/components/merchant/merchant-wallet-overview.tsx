"use client";

import { useMemo, useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { WalletBalanceHero } from "@/components/merchant/wallet/wallet-balance-hero";
import { WalletQuickStats } from "@/components/merchant/wallet/wallet-quick-stats";
import { WalletCard } from "@/components/merchant/wallet/wallet-card";
import { WalletPendingWithdrawals } from "@/components/merchant/wallet/wallet-pending-withdrawals";
import { WalletDestinationCard } from "@/components/merchant/wallet/wallet-destination-card";
import { WalletRecentActivity } from "@/components/merchant/wallet/wallet-recent-activity";
import { TransferModal } from "@/components/merchant/wallet/transfer-modal";
import { MerchantWithdrawModal } from "@/components/merchant/wallet/merchant-withdraw-modal";
import { WalletAutoPayModal } from "@/components/merchant/wallet/wallet-auto-pay-modal";
import { UpdateCardModal } from "@/components/merchant/wallet/update-card-modal";
import { EditDestinationModal } from "@/components/merchant/wallet/edit-destination-modal";
import { useCurrentMerchantWallet } from "@/lib/merchant/hooks/use-current-merchant-wallet";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useNow } from "@/lib/shared/hooks/use-now";
import { fundMethods, type PaymentMethod } from "@/lib/payment-methods";
import {
  cancelMerchantWithdrawal,
  fundMerchantWallet,
  requestDestinationChange,
  requestMerchantWithdrawal,
  setAutoPayEnabled,
  setAutoPaySource,
  transferBetweenWallets,
  updateAutoPayCard,
} from "@/lib/merchant/wallet/wallet-mutations";

type Toast = { kind: "success" | "error"; text: string };
type FundTarget = "billing" | "main";

function maskAccount(raw: string): string {
  const digits = raw.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}

function providerFor(
  methodId: string,
  formData: Record<string, string>
): string {
  if (methodId === "momo") return "Mobile Money";
  if (methodId === "card") return formData.cardBrand || "Card";
  if (methodId === "bank") return formData.bankName || "Bank Transfer";
  return "Payment method";
}

export function MerchantWalletOverview() {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const state = useCurrentMerchantWallet();

  const [fundTarget, setFundTarget] = useState<FundTarget | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [autoPayOpen, setAutoPayOpen] = useState(false);
  const [updateCardOpen, setUpdateCardOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const availableFundMethods: PaymentMethod[] = useMemo(
    () => fundMethods.filter((m) => m.id !== "wallet" && m.id !== "atlas_points"),
    []
  );

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.text === text ? null : prev));
    }, 5000);
  };

  const handleFundSubmit = async (input: {
    methodId: string;
    amount: number;
    formData: Record<string, string>;
  }) => {
    if (!merchant || !fundTarget) {
      return { status: "failed" as const, message: "No merchant session." };
    }
    const provider = providerFor(input.methodId, input.formData);
    const maskedLabel = maskAccount(
      input.formData.phoneNumber ||
        input.formData.cardNumber ||
        input.formData.accountNumber ||
        ""
    );
    const result = fundMerchantWallet(
      fundTarget,
      {
        amount: input.amount,
        method: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
      },
      { id: merchant.id, name: merchant.name, email: merchant.email }
    );
    if (!result.ok) {
      return {
        status: "failed" as const,
        message: result.error ?? "Funding failed.",
      };
    }
    showToast("success", "Wallet funded.");
    return {
      status: "success" as const,
      message: "Your wallet has been funded successfully.",
    };
  };

  const handleTransferSubmit = async (input: {
    from: "billing" | "main";
    to: "billing" | "main";
    amount: number;
  }) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const result = transferBetweenWallets(input, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    if (result.ok) showToast("success", "Transfer complete.");
    return { ok: result.ok, error: result.error };
  };

  const handleWithdrawSubmit = async (input: { amount: number }) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const result = requestMerchantWithdrawal(input, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    if (result.ok) {
      showToast(
        "success",
        result.requiresApproval
          ? "Withdrawal submitted for approval."
          : "Withdrawal on the way."
      );
    }
    return {
      ok: result.ok,
      requiresApproval: result.requiresApproval,
      error: result.error,
    };
  };

  const handleCancelWithdrawal = (requestId: string) => {
    if (!merchant) return;
    setCancelling(true);
    const result = cancelMerchantWithdrawal(requestId, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    setCancelling(false);
    if (result.ok) showToast("success", "Withdrawal cancelled.");
    else showToast("error", result.error ?? "Could not cancel.");
  };

  const handleDestinationSubmit = (input: {
    method: "momo" | "bank";
    provider: string;
    accountNumber: string;
    nameOnAccount: string;
    reason: string;
  }) => {
    if (!merchant) return;
    setSubmitting(true);
    const result = requestDestinationChange(input, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    setSubmitting(false);
    if (result.ok) {
      setDestinationOpen(false);
      showToast("success", "Destination change submitted for review.");
    } else {
      showToast("error", result.error ?? "Could not submit the change.");
    }
  };

  const handleAutoPayEnabled = async (enabled: boolean) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const result = setAutoPayEnabled(enabled, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    return { ok: result.ok, error: result.error };
  };

  const handleAutoPaySource = async (
    source: "card" | "billing_wallet"
  ) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const result = setAutoPaySource(source, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    return { ok: result.ok, error: result.error };
  };

  const handleUpdateCard = async (input: {
    cardRef: string;
    cardBrand: string;
    cardLast4: string;
  }) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const result = updateAutoPayCard(input, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    if (result.ok) {
      setUpdateCardOpen(false);
      showToast("success", "Card saved.");
    }
    return { ok: result.ok, error: result.error };
  };

  const pendingWithdrawalTotal = useMemo(
    () => state.pendingWithdrawals.reduce((s, r) => s + r.total, 0),
    [state.pendingWithdrawals]
  );

  if (state.loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AtlasSkeleton className="h-72 w-full" />
          <AtlasSkeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <AtlasErrorState
        title="Could not load your wallets"
        description={state.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!state.wallet || !state.quickStats) {
    return (
      <AtlasErrorState
        title="Wallets unavailable"
        description="We could not find wallets for the current account."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const view = state.wallet;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Finance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Wallet
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Manage your billing and main wallets, transfer between them, cash
            out, and review your activity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          disabled={view.isFrozen}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Transfer between wallets
        </button>
      </div>

      <WalletBalanceHero view={view} />

      <WalletQuickStats stats={state.quickStats} />

      <WalletPendingWithdrawals
        rows={state.pendingWithdrawals}
        nowMs={nowMs}
        onCancel={handleCancelWithdrawal}
        cancelling={cancelling}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WalletCard
          walletType="billing"
          record={view.billing}
          frozen={view.billingFrozen}
          billingSummary={state.billingSummary ?? undefined}
          nowMs={nowMs}
          onFund={() => setFundTarget("billing")}
          onTransfer={() => setTransferOpen(true)}
          onWithdraw={() => {}}
          onAutoPay={() => setAutoPayOpen(true)}
        />
        <WalletCard
          walletType="main"
          record={view.main}
          frozen={view.mainFrozen}
          mainSummary={state.mainSummary ?? undefined}
          nowMs={nowMs}
          onFund={() => setFundTarget("main")}
          onTransfer={() => setTransferOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
          onAutoPay={() => {}}
        />
      </div>

      <WalletDestinationCard
        destination={state.destination}
        onEdit={() => setDestinationOpen(true)}
        frozen={view.isFrozen}
      />

      <WalletRecentActivity
        title="Billing wallet activity"
        rows={state.billingRows}
        nowMs={nowMs}
        viewAllHref="/merchant/transactions"
        onFund={() => setFundTarget("billing")}
      />

      <WalletRecentActivity
        title="Main wallet activity"
        rows={state.mainRows}
        nowMs={nowMs}
        viewAllHref="/merchant/transactions"
        onFund={() => setFundTarget("main")}
      />

      <PaymentFlowModal
        open={fundTarget !== null}
        mode="fund"
        title={
          fundTarget === "billing"
            ? "Fund billing wallet"
            : "Fund main wallet"
        }
        methods={availableFundMethods}
        onSubmit={handleFundSubmit}
        showAmountInput
        submitLabel="Fund wallet"
        onClose={() => setFundTarget(null)}
      />

      <TransferModal
        open={transferOpen}
        billing={view.billing}
        main={view.main}
        submitting={submitting}
        onSubmit={handleTransferSubmit}
        onClose={() => setTransferOpen(false)}
      />

      <MerchantWithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        main={view.main}
        destination={state.destination}
        config={state.config}
        pendingWithdrawalTotal={pendingWithdrawalTotal}
        onSubmit={handleWithdrawSubmit}
        onRequestDestination={() => {
          setWithdrawOpen(false);
          setDestinationOpen(true);
        }}
      />

      <WalletAutoPayModal
        open={autoPayOpen}
        config={state.autoPay}
        billing={view.billing}
        nextChargeAmount={state.billingSummary?.nextChargeAmount ?? null}
        submitting={submitting}
        onSetEnabled={handleAutoPayEnabled}
        onSetSource={handleAutoPaySource}
        onRequestCard={() => {
          setAutoPayOpen(false);
          setUpdateCardOpen(true);
        }}
        onClose={() => setAutoPayOpen(false)}
      />

      <UpdateCardModal
        open={updateCardOpen}
        submitting={submitting}
        onSubmit={handleUpdateCard}
        onClose={() => setUpdateCardOpen(false)}
      />

      <EditDestinationModal
        open={destinationOpen}
        destination={state.destination}
        submitting={submitting}
        onSubmit={handleDestinationSubmit}
        onClose={() => setDestinationOpen(false)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            "fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg " +
            (toast.kind === "success"
              ? "border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-900/90 dark:text-success-200"
              : "border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800 dark:bg-danger-900/90 dark:text-danger-200")
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}