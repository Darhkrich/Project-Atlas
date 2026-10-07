"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import {
  PaymentFlowModal,
  type PaymentFlowSavedMethod,
  type PaymentFlowSaveInput,
} from "@/components/payments/PaymentFlowModal";
import { WalletMainHero } from "@/components/merchant/wallet/wallet-main-hero";
import { WalletBillingCard } from "@/components/merchant/wallet/wallet-billing-card";
import { WalletQuickStats } from "@/components/merchant/wallet/wallet-quick-stats";
import { WalletWaitingOnAtlas } from "@/components/merchant/wallet/wallet-waiting-on-atlas";
import { WalletUnifiedActivity } from "@/components/merchant/wallet/wallet-unified-activity";
import { WalletActivityFilters } from "@/components/merchant/wallet/wallet-activity-filters";
import { TransferModal } from "@/components/merchant/wallet/transfer-modal";
import { MerchantWithdrawModal } from "@/components/merchant/wallet/merchant-withdraw-modal";
import { WalletAutoPayModal } from "@/components/merchant/wallet/wallet-auto-pay-modal";
import { UpdateCardModal } from "@/components/merchant/wallet/update-card-modal";
import { EditDestinationModal } from "@/components/merchant/wallet/edit-destination-modal";
import { useCurrentMerchantWallet } from "@/lib/merchant/hooks/use-current-merchant-wallet";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useMerchantWalletActivityFilters } from "@/lib/merchant/hooks/use-merchant-wallet-activity-filters";
import { fundMethods, type PaymentMethod } from "@/lib/payment-methods";
import {
  addMerchantSavedMethod,
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

const ALLOWED_FUND_METHOD_IDS = ["momo", "card", "bank"] as const;

export function MerchantWalletOverview() {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const state = useCurrentMerchantWallet();
  const { filters, setWallet, setKind } = useMerchantWalletActivityFilters();

  const [fundTarget, setFundTarget] = useState<FundTarget | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [autoPayOpen, setAutoPayOpen] = useState(false);
  const [updateCardOpen, setUpdateCardOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => {
      setToast((prev) => (prev && prev.text === text ? null : prev));
      toastTimer.current = null;
    }, 5000);
  };

  const availableFundMethods: PaymentMethod[] = useMemo(
    () =>
      fundMethods.filter((m) =>
        (ALLOWED_FUND_METHOD_IDS as readonly string[]).includes(m.id)
      ),
    []
  );

  const paymentFlowSavedMethods: PaymentFlowSavedMethod[] = useMemo(
    () =>
      state.savedMethods.map((m) => ({
        id: m.id,
        methodId: m.methodId,
        label: m.label,
        maskedSummary: (m.provider + " " + m.maskedLabel).trim(),
        fieldValues: {},
        tokenRef: m.tokenRef,
      })),
    [state.savedMethods]
  );

  const filteredRows = useMemo(() => {
    const { wallet, kind } = filters;
    return state.allRows.filter((row) => {
      if (wallet !== "all" && row.walletType !== wallet) return false;
      if (kind === "all") return true;
      if (kind === "transfer") {
        return row.kind === "transfer_in" || row.kind === "transfer_out";
      }
      return row.kind === kind;
    });
  }, [state.allRows, filters]);

  const pendingWithdrawalTotal = useMemo(
    () => state.pendingWithdrawals.reduce((s, r) => s + r.total, 0),
    [state.pendingWithdrawals]
  );

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <AtlasSkeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
          <AtlasSkeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <AtlasSkeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (state.error) {
    return (
      <AtlasErrorState
        title="Could not load your wallet"
        message={state.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!state.wallet || !state.quickStats || !state.config) {
    return (
      <AtlasErrorState
        title="Wallet unavailable"
        message="We could not find a wallet for the current account."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const view = state.wallet;

  const handleFundSubmit = async (input: {
    methodId: string;
    amount: number;
    formData: Record<string, string>;
    savedMethodId?: string;
  }) => {
    if (!merchant || !fundTarget) {
      return { status: "failed" as const, message: "No merchant session." };
    }
    const saved = input.savedMethodId
      ? state.savedMethods.find((m) => m.id === input.savedMethodId) ?? null
      : null;

    const methodId = saved ? saved.methodId : input.methodId;
    const provider = saved
      ? saved.provider
      : providerFor(input.methodId, input.formData);
    const maskedLabel = saved
      ? saved.maskedLabel
      : maskAccount(
          input.formData.phoneNumber ||
            input.formData.cardNumber ||
            input.formData.accountNumber ||
            ""
        );

    const result = fundMerchantWallet(
      fundTarget,
      {
        amount: input.amount,
        method: methodId as "momo" | "card" | "bank",
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

  const handleSaveMethod = (input: PaymentFlowSaveInput) => {
    if (!merchant) return;
    const provider = providerFor(input.methodId, input.details);
    const maskedLabel = maskAccount(
      input.details.phoneNumber ||
        input.details.cardNumber ||
        input.details.accountNumber ||
        ""
    );
    addMerchantSavedMethod(
      {
        methodId: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        tokenRef: "tok_" + crypto.randomUUID().slice(0, 12),
        label: input.label,
        isDefault: state.savedMethods.length === 0,
      },
      { id: merchant.id, name: merchant.name, email: merchant.email }
    );
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
    if (!merchant || cancellingId !== null) return;
    setCancellingId(requestId);
    const result = cancelMerchantWithdrawal(requestId, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    setCancellingId(null);
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
    const result = requestDestinationChange(input, {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    });
    if (result.ok) {
      setDestinationOpen(false);
      showToast("success", "Withdrawal account submitted for review.");
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Finance
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Wallet
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Your money in, money out, and where it goes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WalletMainHero
            view={view}
            pendingWithdrawalTotal={pendingWithdrawalTotal}
            pendingWithdrawalCount={state.pendingWithdrawals.length}
            destination={state.destination}
            onWithdraw={() => setWithdrawOpen(true)}
            onTransfer={() => setTransferOpen(true)}
            onEditDestination={() => setDestinationOpen(true)}
          />
        </div>
        <div className="lg:col-span-1">
          <WalletBillingCard
            record={view.billing}
            frozen={view.billingFrozen}
            summary={state.billingSummary}
            nowMs={nowMs}
            onFund={() => setFundTarget("billing")}
            onAutoPay={() => setAutoPayOpen(true)}
          />
        </div>
      </div>

      <WalletQuickStats stats={state.quickStats} />

      <WalletWaitingOnAtlas
        pending={state.pendingWithdrawals}
        destination={state.destination}
        nowMs={nowMs}
        cancellingId={cancellingId}
        onCancel={handleCancelWithdrawal}
        onViewDestination={() => setDestinationOpen(true)}
      />

      <div className="space-y-3">
        <WalletActivityFilters
          wallet={filters.wallet}
          kind={filters.kind}
          onWallet={setWallet}
          onKind={setKind}
        />
        <WalletUnifiedActivity
          rows={filteredRows}
          nowMs={nowMs}
          viewAllHref="/merchant/transactions"
          onFund={() => setFundTarget("main")}
          emptyHeading={
            filters.wallet === "all" && filters.kind === "all"
              ? "Nothing yet"
              : "No matching activity"
          }
          emptyBody={
            filters.wallet === "all" && filters.kind === "all"
              ? "Your funding, payments, and payouts will show up here."
              : "Try a different wallet or kind filter."
          }
        />
      </div>

      <PaymentFlowModal
        open={fundTarget !== null}
        mode="fund"
        title={
          fundTarget === "billing"
            ? "Fund billing wallet"
            : "Fund main wallet"
        }
        methods={availableFundMethods}
        savedMethods={paymentFlowSavedMethods}
        onSaveMethod={handleSaveMethod}
        onSubmit={handleFundSubmit}
        showAmountInput
        submitLabel="Fund wallet"
        onClose={() => setFundTarget(null)}
      />

      <TransferModal
        open={transferOpen}
        billing={view.billing}
        main={view.main}
        onSubmit={handleTransferSubmit}
        onClose={() => setTransferOpen(false)}
      />

      <MerchantWithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        main={view.main}
        destination={state.destination}
        config={state.config}
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
        onSubmit={handleUpdateCard}
        onClose={() => setUpdateCardOpen(false)}
      />

      <EditDestinationModal
        open={destinationOpen}
        destination={state.destination}
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