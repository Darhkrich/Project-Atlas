/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasCard } from "@/components/atlas/card";
import { subscriptionPlans, getPlanByCode } from "@/config/subscription-plans";
import { useSubscription } from "@/contexts/subscription-context";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { allPaymentMethods } from "@/lib/payment-methods";

export default function MerchantBillingPage() {
  const {
    currentPlan,
    billingCycle,
    setBillingCycle,
    upgradePlan,
    subscriptionStartDate,
    subscriptionEndDate,
    autoRenew,
    setAutoRenew,
  } = useSubscription();
  const { updateStorefrontConfig } = useStorefrontConfig();
  const plan = getPlanByCode(currentPlan);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [salesContactOpen, setSalesContactOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [paymentMethods] = useState(
    allPaymentMethods.filter((m) => ["momo", "card", "bank"].includes(m.id))
  );

  const proratedAmount = useMemo(() => {
    if (selectedPlan === currentPlan || selectedPlan === "enterprise") return 0;

    const oldPlan = getPlanByCode(currentPlan);
    const newPlan = getPlanByCode(selectedPlan);

    const oldPrice = parseFloat(
      (billingCycle === "monthly" ? oldPlan.monthlyPrice : oldPlan.annualPrice).replace(/[^0-9.]/g, "")
    );
    const newPrice = parseFloat(
      (billingCycle === "monthly" ? newPlan.monthlyPrice : newPlan.annualPrice).replace(/[^0-9.]/g, "")
    );

    const now = Date.now();
    const remainingMs = Math.max(0, subscriptionEndDate - now);
    const totalDurationMs = subscriptionEndDate - subscriptionStartDate;
    const remainingFraction = totalDurationMs > 0 ? remainingMs / totalDurationMs : 1;

    const priceDifference = Math.max(0, newPrice - oldPrice);
    return priceDifference * remainingFraction;
  }, [selectedPlan, currentPlan, billingCycle, subscriptionStartDate, subscriptionEndDate]);

  const remainingDays = Math.ceil((subscriptionEndDate - Date.now()) / (24 * 60 * 60 * 1000));

  const handlePlanSelect = (planCode: string) => {
    setSelectedPlan(planCode as "starter" | "growth" | "pro" | "enterprise");
    if (planCode === currentPlan) {
      setUpgradeModalOpen(false);
      return;
    }
    if (planCode === "enterprise") {
      setUpgradeModalOpen(false);
      setSalesContactOpen(true);
    } else {
      setUpgradeModalOpen(true);
    }
  };

  const handleConfirmUpgrade = () => {
    setUpgradeModalOpen(false);
    setPaymentAmount(proratedAmount);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentOpen(false);
    upgradePlan(selectedPlan, billingCycle);
    updateStorefrontConfig({ planId: selectedPlan });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Billing & Plan
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your subscription, payment methods, and plan.
        </p>
      </div>

      <AtlasCard className="border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Current Plan</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {plan.name}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} /{" "}
              {billingCycle}
            </p>
            <p className="text-xs text-neutral-500">
              Next billing date:{" "}
              {new Date(subscriptionEndDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700 ring-1 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800">
              Active
            </span>
          </div>
        </div>
      </AtlasCard>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Billing Cycle:</span>
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billingCycle === "monthly"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billingCycle === "annual"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
        >
          Annual
          <span className="ml-1 text-xs text-success-600">Save 17%</span>
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Auto-Renewal
            </p>
            <p className="text-xs text-neutral-500">
              Automatically renew your subscription at the end of each billing cycle.
            </p>
          </div>
          <button
            onClick={() => setAutoRenew(!autoRenew)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              autoRenew ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                autoRenew ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionPlans.map((p) => {
          const isSelected = selectedPlan === p.code;
          const isCurrent = p.code === currentPlan;
          const price = billingCycle === "monthly" ? p.monthlyPrice : p.annualPrice;

          return (
            <div
              key={p.code}
              className={`relative flex flex-col rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected
                  ? "border-brand-600 bg-brand-50 shadow-lg dark:border-brand-500 dark:bg-brand-900/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              }`}
            >
              {p.code === "pro" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">{p.supportLevel}</p>
              <div className="mt-4">
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {price}
                </p>
                <p className="text-sm text-neutral-500">
                  per {billingCycle === "monthly" ? "month" : "year"}
                </p>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2">
                  <AtlasIcon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />
                  {p.maxProducts === Infinity ? "Unlimited products" : `Up to ${p.maxProducts} products`}
                </li>
                <li className="flex items-start gap-2">
                  <AtlasIcon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />
                  {p.themes.length} theme{p.themes.length !== 1 ? "s" : ""}
                </li>
                <li className="flex items-start gap-2">
                  <AtlasIcon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />
                  {p.paymentMethods.length} payment method{p.paymentMethods.length !== 1 ? "s" : ""}
                </li>
                <li className="flex items-start gap-2">
                  <AtlasIcon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />
                  Custom domain: {p.customDomain ? "Yes" : "No"}
                </li>
              </ul>

              <div className="mt-auto pt-5">
                <Button
                  onClick={() => handlePlanSelect(p.code)}
                  variant={isSelected ? "primary" : "outline"}
                  className="w-full"
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Plan" : isSelected ? "Selected" : "Select Plan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
          Payment Methods
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Saved methods used for subscription billing.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {plan.paymentMethods.map((methodId) => {
            const methodName =
              methodId === "momo" ? "Mobile Money" : methodId === "card" ? "Card" : methodId === "bank" ? "Bank Transfer" : methodId;
            return (
              <div key={methodId} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                <AtlasIcon name={methodId === "momo" ? "mobile" : methodId === "card" ? "card" : methodId === "bank" ? "bank" : "wallet"} className="h-4 w-4 text-neutral-500" />
                {methodName}
              </div>
            );
          })}
        </div>
      </div>

      {upgradeModalOpen && selectedPlan !== currentPlan && selectedPlan !== "enterprise" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <AtlasIcon name="info" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Upgrade to {getPlanByCode(selectedPlan).name}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  You have {remainingDays} days remaining in your current {plan.name} plan.
                  You will be charged a prorated amount of{" "}
                  <span className="font-bold">GH₵ {proratedAmount.toFixed(2)}</span> now.
                  After payment, your new plan will be active immediately, and your billing cycle will reset.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <Button onClick={handleConfirmUpgrade}>
                Pay GH₵ {proratedAmount.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PaymentFlowModal
        open={paymentOpen}
        mode="purchase"
        title="Upgrade Plan"
        amount={paymentAmount}
        methods={paymentMethods}
        showAmountInput={false}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        onFailed={() => setPaymentOpen(false)}
      />

      {salesContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSalesContactOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <AtlasIcon name="headphones" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Enterprise Plan
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Our Enterprise plan is customized to your business needs. Please contact our sales team for a personalized quote.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="mailto:sales@atlas.com"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    <AtlasIcon name="send" className="h-4 w-4" />
                    Email Sales
                  </a>
                  <button
                    onClick={() => setSalesContactOpen(false)}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}