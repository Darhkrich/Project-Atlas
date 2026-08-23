/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { fundMethods, withdrawMethods, type PaymentMethod } from "@/lib/payment-methods";
import {
  useSavedPaymentMethods,
  type SavedPaymentMethod,
} from "@/contexts/SavedPaymentMethodsContext";

type FundingTransaction = {
  id: string;
  method: string;
  amount: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
  icon: AtlasIconName;
};

const mockFundingHistory: FundingTransaction[] = [
  {
    id: "fw1",
    method: "Mobile Money",
    amount: "GHS 500.00",
    date: "Today, 9:15 AM",
    status: "Successful",
    statusVariant: "success",
    icon: "mobile",
  },
  {
    id: "fw2",
    method: "Bank Transfer",
    amount: "GHS 1,000.00",
    date: "Yesterday, 4:30 PM",
    status: "Successful",
    statusVariant: "success",
    icon: "bank",
  },
  {
    id: "fw3",
    method: "Card Payment",
    amount: "GHS 200.00",
    date: "May 12, 2025",
    status: "Successful",
    statusVariant: "success",
    icon: "card",
  },
];

export function WalletOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fundingHistory, setFundingHistory] = useState<FundingTransaction[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"fund" | "withdraw">("fund");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const {
    savedMethods,
    deleteSavedMethod,
    setDefaultMethod,
    updateSavedMethod,
  } = useSavedPaymentMethods();

  const [editingMethod, setEditingMethod] = useState<SavedPaymentMethod | null>(null);
  const [editForm, setEditForm] = useState({
    label: "",
    details: {} as Record<string, string>,
  });

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setFundingHistory(mockFundingHistory);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openFundModal = (method?: PaymentMethod) => {
    setPaymentMode("fund");
    setSelectedMethod(method || null);
    setPaymentModalOpen(true);
  };

  const openWithdrawModal = () => {
    setPaymentMode("withdraw");
    setSelectedMethod(null);
    setPaymentModalOpen(true);
  };

  const handlePaymentClose = () => {
    setPaymentModalOpen(false);
    setSelectedMethod(null);
  };

  const getSavedMethodIcon = (methodId: string): AtlasIconName => {
    switch (methodId) {
      case "card":
        return "card";
      case "bank":
        return "bank";
      case "momo":
        return "mobile";
      default:
        return "star";
    }
  };

  const handleEditSave = () => {
    if (editingMethod) {
      updateSavedMethod(editingMethod.id, editForm.label, editForm.details);
      setEditingMethod(null);
    }
  };

  if (loading) {
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

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 p-8 text-white shadow-sm">
        <div className="pointer-events-none absolute bottom-0 right-0 opacity-15">
          <svg
            className="h-48 w-48"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="30" y="60" width="140" height="100" rx="15" fill="white" />
            <rect x="70" y="90" width="60" height="40" rx="5" fill="#0d5a49" />
            <circle cx="100" cy="110" r="8" fill="white" />
            <circle cx="150" cy="130" r="12" fill="#ffa000" />
            <circle cx="160" cy="140" r="10" fill="#ffa000" />
            <circle cx="140" cy="150" r="8" fill="#ffa000" />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-brand-200">Available Balance</p>
          <p className="mt-2 text-5xl font-bold tracking-tight">GHS 1,250.75</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => openFundModal()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
            >
              <AtlasIcon name="plus" className="h-4 w-4" />
              Fund Wallet
            </button>
            <button
              onClick={openWithdrawModal}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <AtlasIcon name="bank" className="h-4 w-4" />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              <AtlasIcon name="wallet" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Deposits</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">GHS 2,500.00</p>
            </div>
          </div>
        </AtlasCard>
        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
              <AtlasIcon name="repeat" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Spend</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">GHS 1,249.25</p>
            </div>
          </div>
        </AtlasCard>
        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300">
              <AtlasIcon name="check" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Successful Funding</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">32</p>
            </div>
          </div>
        </AtlasCard>
      </div>

      {/* Funding Methods */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Add Money to Your Wallet
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fundMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => openFundModal(method)}
              className="group rounded-xl border border-neutral-200 bg-white p-5 text-left transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${method.bgClass}`}>
                <AtlasIcon name={method.icon} className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{method.name}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{method.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Saved Payment Methods */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Saved Payment Methods
          </h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {savedMethods.length} saved
          </span>
        </div>
        {savedMethods.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedMethods.map((method) => (
              <AtlasCard key={method.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon
                      name={getSavedMethodIcon(method.methodId)}
                      className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {method.label}
                      </p>
                      {method.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {Object.values(method.details).join(" • ")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultMethod(method.id)}
                        className="rounded-md p-1.5 text-neutral-400 hover:text-brand-800 dark:hover:text-brand-300"
                        aria-label="Set as default"
                      >
                        <AtlasIcon name="star" className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingMethod(method);
                        setEditForm({ label: method.label, details: { ...method.details } });
                      }}
                      className="rounded-md p-1.5 text-neutral-400 hover:text-brand-800 dark:hover:text-brand-300"
                      aria-label="Edit saved method"
                    >
                      <AtlasIcon name="settings" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSavedMethod(method.id)}
                      className="rounded-md p-1.5 text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
                      aria-label="Delete saved method"
                    >
                      <AtlasIcon name="x-circle" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </AtlasCard>
            ))}
          </div>
        ) : (
          <AtlasEmptyState
            title="No saved payment methods"
            description="Save your payment methods for faster checkout."
            action={<Button variant="outline">Add Payment Method</Button>}
          />
        )}
      </section>

      {/* Recent Funding */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Funding
          </h2>
          <Link
            href="/customer/transactions"
            className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
          >
            View all
          </Link>
        </div>
        <AtlasCard padding="none">
          {fundingHistory.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {fundingHistory.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <AtlasIcon name={tx.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{tx.method}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tx.amount}</p>
                    <AtlasBadge variant={tx.statusVariant}>{tx.status}</AtlasBadge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AtlasEmptyState
              title="No funding history"
              description="Your wallet funding activity will appear here."
              action={<Button variant="outline" onClick={() => openFundModal()}>Fund Wallet</Button>}
            />
          )}
        </AtlasCard>
      </section>

      {/* Payment Flow Modal */}
      <PaymentFlowModal
        open={paymentModalOpen}
        mode={paymentMode}
        title={paymentMode === "fund" ? "Fund Wallet" : "Withdraw"}
        methods={paymentMode === "fund" ? fundMethods : withdrawMethods}
        initialMethod={selectedMethod}
        showAmountInput={true}
        onClose={handlePaymentClose}
        submitLabel={paymentMode === "fund" ? "Fund Wallet" : "Withdraw"}
        successMessage={
          paymentMode === "fund"
            ? "Wallet funded successfully."
            : "Withdrawal request submitted successfully."
        }
      />

      {/* Edit Saved Method Modal */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setEditingMethod(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white p-6 shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Edit Saved Method
              </h3>
              <button
                onClick={() => setEditingMethod(null)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <AtlasInput
                label="Label"
                type="text"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, label: e.target.value }))
                }
              />
              {Object.keys(editForm.details).map((key) => (
                <AtlasInput
                  key={key}
                  label={key}
                  type="text"
                  value={editForm.details[key]}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      details: { ...prev.details, [key]: e.target.value },
                    }))
                  }
                />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingMethod(null)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleEditSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}