"use client";

import { useMemo, useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { WithdrawFlowModal } from "@/components/payments/withdrawFlowModal";
import { WalletBalanceHero } from "@/components/customer/wallet/wallet-balance-hero";
import { WalletQuickStats } from "@/components/customer/wallet/wallet-quick-stats";
import { WalletFundingMethods } from "@/components/customer/wallet/wallet-funding-methods";
import { WalletSavedMethods } from "@/components/customer/wallet/wallet-saved-methods";
import { WalletRecentFunding } from "@/components/customer/wallet/wallet-recent-funding";
import { WalletPendingRefunds } from "@/components/customer/wallet/wallet-pending-refunds";
import { EditSavedMethodModal } from "@/components/customer/wallet/edit-saved-method-modal";
import { useCurrentCustomerWallet } from "@/lib/customer/hooks/use-current-customer-wallet";
import { useSavedMethods } from "@/lib/customer/hooks/use-saved-methods";
import { useCurrentCustomer } from "@/lib/customer/hooks/use-current-customer";
import { useNow } from "@/lib/admin/hooks/use-now";
import { fundMethods, type PaymentMethod } from "@/lib/payment-methods";
import {
  cancelCustomerWithdrawal,
  fundCustomerWallet,
  requestCustomerWithdrawal,
} from "@/lib/customer/wallet/wallet-mutations";
import {
  addSavedMethod,
  deleteSavedMethod,
  setDefaultSavedMethod,
  updateSavedMethod,
} from "@/lib/customer/wallet/saved-methods-mutations";
import type {
  CustomerSavedPaymentMethod,
} from "@/lib/customer/types/wallet";
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

function buildMaskedLabel(
  methodId: string,
  formData: Record<string, string>
): string {
  if (methodId === "momo") {
    const raw = (formData.phoneNumber || "").replace(/\s+/g, "");
    const last4 = raw.slice(-4);
    return lastFour(last4);
  }
  if (methodId === "card") {
    const raw = (formData.cardNumber || "").replace(/\s+/g, "");
    const last4 = raw.slice(-4);
    return "ending " + lastFour(last4);
  }
  if (methodId === "bank") {
    const raw = (formData.accountNumber || "").replace(/\s+/g, "");
    const last4 = raw.slice(-4);
    return lastFour(last4);
  }
  return "****";
}

function lastFour(value: string): string {
  const digits = value.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}

function providerFor(methodId: string, formData: Record<string, string>): string {
  if (methodId === "momo") return "Mobile Money";
  if (methodId === "card") return formData.cardBrand || "Card";
  if (methodId === "bank") return formData.bankName || "Bank Transfer";
  return "Payment method";
}

export function WalletOverview() {
  const customer = useCurrentCustomer();
  const nowMs = useNow();
  const walletState = useCurrentCustomerWallet();
  const savedMethodsState = useSavedMethods();

  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [editingSaved, setEditingSaved] =
    useState<CustomerSavedPaymentMethod | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const availableFundMethods: PaymentMethod[] = useMemo(
    () => fundMethods,
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
    if (!customer) {
      return { status: "failed", message: "You are not signed in." };
    }
    const provider = providerFor(input.methodId, input.formData);
    const maskedLabel = buildMaskedLabel(input.methodId, input.formData);

    const result = fundCustomerWallet(
      {
        amount: input.amount,
        method: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        saveForFuture: false,
      },
      { id: customer.id, name: customer.name, email: customer.email }
    );

    if (!result.ok) {
      return {
        status: "failed",
        message: result.error ?? "Funding failed.",
      };
    }

    showToast(
      "success",
      "Wallet funded. New balance: " + (result.reference ?? "updated") + "."
    );
    return {
      status: "success",
      message: "Your wallet has been funded successfully.",
    };
  };

  const handleSaveMethod = (input: PaymentFlowSaveInput) => {
    if (!customer) return;
    const provider = providerFor(input.methodId, input.details);
    const maskedLabel = buildMaskedLabel(input.methodId, input.details);
    addSavedMethod(
      customer.id,
      {
        methodId: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        label: input.label,
      },
      { id: customer.id, name: customer.name, email: customer.email }
    );
  };

  const handleWithdrawSubmit = async (input: {
    sourcePaymentId: string;
    amount: number;
  }) => {
    if (!customer) {
      return { ok: false, error: "You are not signed in." };
    }
    const result = requestCustomerWithdrawal(input, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });
    if (result.ok) {
      showToast(
        "success",
        result.requiresApproval
          ? "Refund submitted. Atlas will review it."
          : "Refund on the way."
      );
    }
    return {
      ok: result.ok,
      requiresApproval: result.requiresApproval,
      error: result.error,
    };
  };

  const handleCancelRefund = (requestId: string) => {
    if (!customer) return;
    setCancelling(true);
    const result = cancelCustomerWithdrawal(requestId, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });
    setCancelling(false);
    if (result.ok) {
      showToast("success", "Refund cancelled.");
    } else {
      showToast("error", result.error ?? "Could not cancel this refund.");
    }
  };

  const handleSetDefault = (methodId: string) => {
    if (!customer) return;
    setDefaultSavedMethod(methodId, {
        id: customer.id,
        name: customer.email,
        email: ""
    });
  };

  const handleDeleteMethod = (methodId: string) => {
    if (!customer) return;
    const result = deleteSavedMethod(methodId, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });
    if (!result.ok) {
      showToast("error", result.error ?? "Could not delete this method.");
    }
  };

  const handleSaveEdit = (patch: { label: string }) => {
    if (!customer || !editingSaved) return;
    setSavingEdit(true);
    const result = updateSavedMethod(editingSaved.id, patch, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });
    setSavingEdit(false);
    if (result.ok) {
      setEditingSaved(null);
      showToast("success", "Saved method updated.");
    } else {
      showToast("error", result.error ?? "Could not update this method.");
    }
  };

  if (walletState.loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-52 w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <AtlasSkeleton className="h-32 w-full" />
          <AtlasSkeleton className="h-32 w-full" />
          <AtlasSkeleton className="h-32 w-full" />
        </div>
        <AtlasSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (walletState.error) {
    return (
      <AtlasErrorState
        title="Could not load your wallet"
        description={walletState.error}
        onRetry={() => {
          window.location.reload();
        }}
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
      <WalletBalanceHero
        wallet={walletRecord}
        onFund={() => setFundModalOpen(true)}
        onWithdraw={() => setWithdrawModalOpen(true)}
      />

      <WalletQuickStats
        summary={walletState.summary}
        pendingRefundCount={walletState.pendingRefunds.length}
      />

      <WalletPendingRefunds
        rows={walletState.pendingRefunds}
        nowMs={nowMs}
        onCancel={handleCancelRefund}
        cancelling={cancelling}
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

      <WalletRecentFunding
        rows={walletState.fundingRows}
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

      <WithdrawFlowModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        wallet={walletRecord}
        sources={walletState.refundableSources}
        config={walletState.config}
        nowMs={nowMs}
        onConfirm={handleWithdrawSubmit}
        onSubmitted={() => {
          // Store subscription will re-render the summary and pending list.
        }}
      />

      <EditSavedMethodModal
        open={editingSaved !== null}
        method={editingSaved}
        submitting={savingEdit}
        onSubmit={handleSaveEdit}
        onClose={() => setEditingSaved(null)}
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