/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { useCurrentStorefrontCustomer } from "@/lib/storefront-user/hooks/use-current-storefront-customer";
import { useCurrentStorefrontWallet } from "@/lib/storefront-user/hooks/use-current-storefront-wallet";
import { useSavedMethods } from "@/lib/storefront-user/hooks/use-saved-methods";
import { useNow } from "@/lib/shared/hooks/use-now";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import type {
  PaymentFlowSavedMethod,
  PaymentFlowSaveInput,
} from "@/components/payments/PaymentFlowModal";
import { fundMethods, type PaymentMethod } from "@/lib/payment-methods";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { WalletCard } from "./wallet-card";
import { WalletPendingRefunds } from "./wallet-pending-refunds";
import { WalletRecentActivity } from "./wallet-recent-activity";
import { ProfileSection } from "./profile-section";
import { SavedDetailsSection } from "./saved-details-section";
import { SavedMethodsSection } from "./saved-methods-section";
import { SecuritySection } from "./security-section";
import { LogoutButton } from "./logout-button";
import { StorefrontRefundModal } from "./storefront-refund-modal";
import { Enable2FAModal } from "./enable-2fa-modal";
import { DeleteAccountModal } from "./delete-account-modal";
import {
  cancelStorefrontRefund,
  deleteStorefrontAccount,
  fundStorefrontUserWallet,
  requestStorefrontRefund,
  ensureStorefrontWallet,
} from "@/lib/storefront-user/wallet/wallet-mutations";
import { addSavedMethod } from "@/lib/storefront-user/wallet/saved-methods-mutations";
import {
  getStorefrontUserState,
  internalPatchStorefrontUserWallet,
} from "@/lib/domains/wallet/storefront-user-state";

interface Props {
  config: StorefrontConfig;
}

type Toast = { kind: "success" | "error"; text: string };

function maskAccount(raw: string): string {
  const digits = raw.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}

function providerFor(
  methodId: string,
  formData: Record<string, string>
): string {
  if (methodId === "momo") return "Momo";
  if (methodId === "card") return formData.cardBrand || "Card";
  if (methodId === "bank") return formData.bankName || "Bank";
  return "Payment method";
}

function labelFor(
  methodId: string,
  formData: Record<string, string>
): string {
  if (methodId === "momo") return "Saved momo";
  if (methodId === "card") return "Saved card";
  if (methodId === "bank") return "Saved bank";
  return "Saved method";
}

export function AccountPageContent({ config }: Props) {
  const router = useRouter();
  const { customer, setTwoFactor, logout, setPreferredPaymentMethod } =
    useStorefrontCustomer();
  const currentCustomer = useCurrentStorefrontCustomer();
  const nowMs = useNow();
  const state = useCurrentStorefrontWallet();
  const savedMethodsState = useSavedMethods();

  const [fundOpen, setFundOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [enable2FAOpen, setEnable2FAOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // The wallet is created by the wallet hook before the storefront name is
  // known. Patch it on mount if it landed empty.
  useEffect(() => {
    if (!currentCustomer) return;
    const storefrontName = config.store.name;
    if (!storefrontName) return;
    const walletId =
      "SW-" + currentCustomer.storefrontId + "-" + currentCustomer.id;
    const state = getStorefrontUserState();
    const wallet = state.wallets[walletId];
    if (!wallet) return;
    if (wallet.storefrontName) return;
    internalPatchStorefrontUserWallet(walletId, (w) => ({
      ...w,
      storefrontName,
    }));
  }, [currentCustomer, config.store.name]);

  const availableFundMethods: PaymentMethod[] = useMemo(
    () =>
      fundMethods.filter((m) => m.id !== "wallet" && m.id !== "atlas_points"),
    []
  );

  const modalSavedMethods: PaymentFlowSavedMethod[] = useMemo(
    () =>
      savedMethodsState.savedMethods.map((m) => ({
        id: m.id,
        methodId: m.methodId,
        label: m.label,
        maskedSummary: m.provider + " " + m.maskedLabel,
        fieldValues: m.fieldValues,
      })),
    [savedMethodsState.savedMethods]
  );

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.text === text ? null : prev));
    }, 5000);
  };

  if (!currentCustomer || !customer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-neutral-600">
          Please sign in to view your account.
        </p>
      </div>
    );
  }

  const actor = {
    id: currentCustomer.id,
    name: currentCustomer.name,
    email: currentCustomer.email,
    phone: currentCustomer.phone,
    storefrontId: currentCustomer.storefrontId,
    resellerSlug: currentCustomer.resellerSlug,
    storefrontName: config.store.name,
  };

  const handleFundSubmit = async (input: {
    methodId: string;
    amount: number;
    formData: Record<string, string>;
  }) => {
    const walletId = ensureStorefrontWallet(actor);
    const provider = providerFor(input.methodId, input.formData);
    const maskedLabel = maskAccount(
      input.formData.phoneNumber ||
        input.formData.cardNumber ||
        input.formData.accountNumber ||
        ""
    );
    const result = fundStorefrontUserWallet(
      walletId,
      {
        amount: input.amount,
        method: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
      },
      actor
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
    const walletId = ensureStorefrontWallet(actor);
    const provider = providerFor(input.methodId, input.details);
    const maskedLabel = maskAccount(
      input.details.phoneNumber ||
        input.details.cardNumber ||
        input.details.accountNumber ||
        ""
    );
    const result = addSavedMethod(
      walletId,
      currentCustomer.id,
      {
        methodId: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        label: labelFor(input.methodId, input.details),
        fieldValues: input.details,
      },
      {
        id: currentCustomer.id,
        name: currentCustomer.name,
        email: currentCustomer.email,
      }
    );
    if (result.ok) {
      setPreferredPaymentMethod(input.methodId);
      showToast("success", "Payment method saved.");
    } else if (result.error) {
      showToast("error", result.error);
    }
  };

  const handleRefundSubmit = async (input: {
    sourcePaymentId: string;
    amount: number;
  }) => {
    if (!state.wallet) return { ok: false, error: "Wallet not loaded." };
    const result = requestStorefrontRefund(
      state.wallet.record.id,
      input,
      actor
    );
    if (result.ok) {
      showToast(
        "success",
        result.requiresApproval
          ? "Refund submitted for review."
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
    if (!state.wallet) return;
    setCancelling(true);
    const result = cancelStorefrontRefund(
      state.wallet.record.id,
      requestId,
      actor
    );
    setCancelling(false);
    if (result.ok) showToast("success", "Refund cancelled.");
    else showToast("error", result.error ?? "Could not cancel.");
  };

  const handleEnable2FA = () => {
    setTwoFactor(true);
    setEnable2FAOpen(false);
    showToast("success", "Two-factor authentication enabled.");
  };

  const handleDisable2FA = () => {
    setTwoFactor(false);
    showToast("success", "Two-factor authentication disabled.");
  };

  const handleDeleteAccount = () => {
    if (!state.wallet) return;
    setSubmitting(true);
    const result = deleteStorefrontAccount(state.wallet.record.id, actor);
    setSubmitting(false);
    if (result.ok) {
      logout();
      router.push("/customer-store/" + config.store.slug);
    } else {
      showToast("error", result.error ?? "Could not delete the account.");
      setDeleteOpen(false);
    }
  };

  if (state.loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <AtlasSkeleton className="h-10 w-48" />
        <AtlasSkeleton className="h-48 w-full rounded-2xl" />
        <AtlasSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-neutral-500">
          {config.store.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          My account
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Manage your wallet, review your activity, and update your details.
        </p>
      </div>

      {state.wallet && state.summary && (
        <WalletCard
          wallet={state.wallet.record}
          summary={state.summary}
          isFrozen={state.wallet.isFrozen}
          onFund={() => setFundOpen(true)}
          onRefund={() => setRefundOpen(true)}
        />
      )}

      <WalletPendingRefunds
        rows={state.pendingRefunds}
        nowMs={nowMs}
        onCancel={handleCancelRefund}
        cancelling={cancelling}
      />

      <WalletRecentActivity rows={state.ledgerRows} nowMs={nowMs} />

      <SavedMethodsSection onAdd={() => setFundOpen(true)} />

      <ProfileSection />

      <SavedDetailsSection />

      <SecuritySection
        twoFactorEnabled={currentCustomer.twoFactorEnabled}
        onEnable={() => setEnable2FAOpen(true)}
        onDisable={handleDisable2FA}
        onDeleteAccount={() => setDeleteOpen(true)}
      />

      <div className="flex justify-end">
        <LogoutButton />
      </div>

      {state.wallet && (
        <PaymentFlowModal
          open={fundOpen}
          mode="fund"
          title="Fund wallet"
          methods={availableFundMethods}
          savedMethods={modalSavedMethods}
          onSaveMethod={handleSaveMethod}
          onSubmit={handleFundSubmit}
          showAmountInput
          submitLabel="Fund wallet"
          onClose={() => setFundOpen(false)}
        />
      )}

      {state.wallet && (
        <StorefrontRefundModal
          open={refundOpen}
          onClose={() => setRefundOpen(false)}
          wallet={state.wallet.record}
          sources={state.refundableSources}
          config={state.config}
          nowMs={nowMs}
          onConfirm={handleRefundSubmit}
        />
      )}

      <Enable2FAModal
        open={enable2FAOpen}
        phone={customer.phone ?? ""}
        submitting={submitting}
        onSubmit={handleEnable2FA}
        onClose={() => setEnable2FAOpen(false)}
      />

      <DeleteAccountModal
        open={deleteOpen}
        submitting={submitting}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteOpen(false)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            "fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg " +
            (toast.kind === "success"
              ? "border-success-200 bg-success-50 text-success-800"
              : "border-danger-200 bg-danger-50 text-danger-800")
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}