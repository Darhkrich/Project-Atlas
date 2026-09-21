"use client";

import { useMemo, useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { ResellerWithdrawModal } from "@/components/payments/ResellerWithdrawModal";
import { WalletBalanceHero } from "@/components/reseller/wallet/wallet-balance-hero";
import { WalletCommissionsCard } from "@/components/reseller/wallet/wallet-commissions-card";
import { WalletQuickStats } from "@/components/reseller/wallet/wallet-quick-stats";
import { WalletPendingWithdrawals } from "@/components/reseller/wallet/wallet-pending-withdrawals";
import { WalletDestinationCard } from "@/components/reseller/wallet/wallet-destination-card";
import { WalletFundingMethods } from "@/components/reseller/wallet/wallet-funding-methods";
import { WalletSavedMethods } from "@/components/reseller/wallet/wallet-saved-methods";
import { WalletRecentActivity } from "@/components/reseller/wallet/wallet-recent-activity";
import { EditSavedMethodModal } from "@/components/reseller/wallet/edit-saved-method-modal";
import { EditDestinationModal } from "@/components/reseller/wallet/edit-destination-modal";
import { useCurrentResellerWallet } from "@/lib/reseller/hooks/use-current-reseller-wallet";
import { useSavedMethods } from "@/lib/reseller/hooks/use-saved-methods";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useNow } from "@/lib/shared/hooks/use-now";
import { fundMethods, type PaymentMethod } from "@/lib/payment-methods";
import {
  cancelResellerWithdrawal,
  fundResellerWallet,
  requestDestinationChange,
  requestResellerWithdrawal,
} from "@/lib/reseller/wallet/wallet-mutations";
import {
  addSavedMethod,
  deleteSavedMethod,
  setDefaultSavedMethod,
  updateSavedMethod,
} from "@/lib/reseller/wallet/saved-methods-mutations";
import type { ResellerSavedPaymentMethod } from "@/lib/reseller/types/wallet";
import type {
  PaymentFlowResult,
  PaymentFlowSaveInput,
  PaymentFlowSavedMethod,
  PaymentFlowSubmitInput,
} from "@/components/payments/PaymentFlowModal";

type Toast = {
  kind: "success" | "error";
  text: string;
};

function maskAccount(raw: string): string {
  const digits = raw.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}

function providerFor(methodId: string, formData: Record<string, string>): string {
  if (methodId === "momo") return "Mobile Money";
  if (methodId === "card") return formData.cardBrand || "Card";
  if (methodId === "bank") return formData.bankName || "Bank Transfer";
  return "Payment method";
}

export function ResellerWalletOverview() {
  const reseller = useCurrentReseller();
  const nowMs = useNow();
  const walletState = useCurrentResellerWallet();
  const savedMethodsState = useSavedMethods();

  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [editingSaved, setEditingSaved] =
    useState<ResellerSavedPaymentMethod | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const availableFundMethods: PaymentMethod[] = useMemo(
    () =>
      fundMethods.filter(
        (m) => m.id !== "wallet" && m.id !== "atlas_points"
      ),
    []
  );

  const modalSavedMethods: PaymentFlowSavedMethod[] = useMemo(
    () =>
      savedMethodsState.savedMethods.map((m) => ({
        id: m.id,
        methodId: m.methodId,
        label: m.label,
        maskedSummary: m.provider + " " + m.maskedLabel,
      })),
    [savedMethodsState.savedMethods]
  );

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.text === text ? null : prev));
    }, 5000);
  };

  const handleFundSubmit = async (
    input: PaymentFlowSubmitInput
  ): Promise<PaymentFlowResult> => {
    if (!reseller) {
      return { status: "failed", message: "You are not signed in." };
    }
    const provider = providerFor(input.methodId, input.formData);
    const maskedLabel = maskAccount(
      input.formData.phoneNumber ||
        input.formData.cardNumber ||
        input.formData.accountNumber ||
        ""
    );

    const result = fundResellerWallet(
      {
        amount: input.amount,
        method: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
      },
      { id: reseller.id, name: reseller.name, email: reseller.email }
    );

    if (!result.ok) {
      return { status: "failed", message: result.error ?? "Funding failed." };
    }

    showToast("success", "Wallet funded.");
    return {
      status: "success",
      message: "Your wallet has been funded successfully.",
    };
  };

  const handleSaveMethod = (input: PaymentFlowSaveInput) => {
    if (!reseller) return;
    const provider = providerFor(input.methodId, input.details);
    const maskedLabel = maskAccount(
      input.details.phoneNumber ||
        input.details.cardNumber ||
        input.details.accountNumber ||
        ""
    );
    addSavedMethod(
      reseller.id,
      {
        methodId: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        label: input.label,
      },
      { id: reseller.id, name: reseller.name, email: reseller.email }
    );
  };

  const handleWithdrawSubmit = async (input: {
    kind: "refund_to_source" | "cash_out_to_destination";
    amount: number;
    sourcePaymentId?: string;
  }) => {
    if (!reseller) return { ok: false, error: "You are not signed in." };
    const result = requestResellerWithdrawal(input, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
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
    if (!reseller) return;
    setCancelling(true);
    const result = cancelResellerWithdrawal(requestId, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
    });
    setCancelling(false);
    if (result.ok) {
      showToast("success", "Withdrawal cancelled.");
    } else {
      showToast("error", result.error ?? "Could not cancel this withdrawal.");
    }
  };

  const handleSetDefault = (methodId: string) => {
    if (!reseller) return;
    setDefaultSavedMethod(methodId, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
    });
  };

  const handleDeleteMethod = (methodId: string) => {
    if (!reseller) return;
    const result = deleteSavedMethod(methodId, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
    });
    if (!result.ok) {
      showToast("error", result.error ?? "Could not delete this method.");
    }
  };

  const handleSaveEdit = (patch: { label: string }) => {
    if (!reseller || !editingSaved) return;
    setSavingEdit(true);
    const result = updateSavedMethod(editingSaved.id, patch, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
    });
    setSavingEdit(false);
    if (result.ok) {
      setEditingSaved(null);
      showToast("success", "Saved method updated.");
    } else {
      showToast("error", result.error ?? "Could not update this method.");
    }
  };

  const handleDestinationSubmit = (input: {
    method: "momo" | "bank";
    provider: string;
    accountNumber: string;
    nameOnAccount: string;
    reason: string;
  }) => {
    if (!reseller) return;
    const result = requestDestinationChange(input, {
      id: reseller.id,
      name: reseller.name,
      email: reseller.email,
    });
    if (result.ok) {
      setDestinationModalOpen(false);
      showToast("success", "Destination change submitted for review.");
    } else {
      showToast("error", result.error ?? "Could not submit the change.");
    }
  };

  if (walletState.loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-64 w-full rounded-2xl" />
        <AtlasSkeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <AtlasSkeleton className="h-72 w-full" />
      </div>
    );
  }

  if (walletState.error) {
    return (
      <AtlasErrorState
        title="Could not load your wallet"
        description={walletState.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!walletState.wallet || !walletState.summary) {
    return (
      <AtlasErrorState
        title="Wallet unavailable"
        description="We could not find a wallet for the current account."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const walletRecord = walletState.wallet.record;
  const isFrozen = walletState.wallet.isFrozen;

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
            Manage your reseller wallet, fund your account, withdraw available
            funds, and review your activity.
          </p>
        </div>
      </div>

      <WalletBalanceHero
        wallet={walletRecord}
        onFund={() => setFundModalOpen(true)}
        onWithdraw={() => setWithdrawModalOpen(true)}
      />

      {walletState.commissionsSummary && (
        <WalletCommissionsCard
          summary={walletState.commissionsSummary}
          nowMs={nowMs}
        />
      )}

      <WalletQuickStats summary={walletState.summary} />

      <WalletPendingWithdrawals
        rows={walletState.pendingWithdrawals}
        nowMs={nowMs}
        onCancel={handleCancelWithdrawal}
        cancelling={cancelling}
      />

      <WalletDestinationCard
        destination={walletState.destination}
        onEdit={() => setDestinationModalOpen(true)}
      />

      <WalletFundingMethods
        methods={availableFundMethods}
        disabled={isFrozen}
        onSelect={() => setFundModalOpen(true)}
      />

      <WalletSavedMethods
        savedMethods={savedMethodsState.savedMethods}
        onSetDefault={handleSetDefault}
        onEdit={(m) => setEditingSaved(m)}
        onDelete={handleDeleteMethod}
        onAdd={() => setFundModalOpen(true)}
      />

      <WalletRecentActivity
        rows={walletState.ledgerRows}
        nowMs={nowMs}
        onFund={() => setFundModalOpen(true)}
      />

      <PaymentFlowModal
        open={fundModalOpen}
        mode="fund"
        title="Fund Wallet"
        methods={availableFundMethods}
        savedMethods={modalSavedMethods}
        onSaveMethod={handleSaveMethod}
        onSubmit={handleFundSubmit}
        showAmountInput
        submitLabel="Fund Wallet"
        onClose={() => setFundModalOpen(false)}
      />

      <ResellerWithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        wallet={walletRecord}
        sources={walletState.refundableSources}
        destination={walletState.destination}
        config={walletState.config}
        nowMs={nowMs}
        onConfirm={handleWithdrawSubmit}
        onRequestDestination={() => {
          setWithdrawModalOpen(false);
          setDestinationModalOpen(true);
        }}
      />

      <EditSavedMethodModal
        open={editingSaved !== null}
        method={editingSaved}
        submitting={savingEdit}
        onSubmit={handleSaveEdit}
        onClose={() => setEditingSaved(null)}
      />

      <EditDestinationModal
        open={destinationModalOpen}
        destination={walletState.destination}
        submitting={false}
        onSubmit={handleDestinationSubmit}
        onClose={() => setDestinationModalOpen(false)}
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