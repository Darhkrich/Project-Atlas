/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useCurrentMerchantWallet } from "@/lib/merchant/hooks/use-current-merchant-wallet";
import { useMerchantSubscription } from "@/lib/merchant/subscription/use-merchant-subscription";
import { useMerchantInvoices } from "@/lib/merchant/billing/use-merchant-invoices";
import { useNow } from "@/lib/shared/hooks/use-now";
import {
  getPlanByCode,
  liveSubscriptionPlans,
  subscribeToPlanStore,
} from "@/lib/domains/subscriptions";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import { BillingCurrentPlanCard } from "@/components/merchant/billing/billing-current-plan-card";
import { BillingCycleSwitch } from "@/components/merchant/billing/billing-cycle-switch";
import { BillingAutoRenewCard } from "@/components/merchant/billing/billing-auto-renew-card";
import { BillingPlanGrid } from "@/components/merchant/billing/billing-plan-grid";
import { BillingSavedMethodsCard } from "@/components/merchant/billing/billing-saved-methods-card";
import { BillingInvoicesSection } from "@/components/merchant/billing/billing-invoices-section";
import {
  PlanChangeModal,
  type PlanChangeAction,
} from "@/components/merchant/billing/plan-change-modal";
import { SalesContactModal } from "@/components/merchant/billing/sales-contact-modal";
import { WalletAutoPayModal } from "@/components/merchant/wallet/wallet-auto-pay-modal";
import { UpdateCardModal } from "@/components/merchant/wallet/update-card-modal";
import {
  applyImmediatePlanChange,
  reactivateSubscription,
  scheduleDowngrade,
} from "@/lib/merchant/subscription/mutations";
import {
  attemptPlanCharge,
  effectivePlanCode,
  isChargeDue,
} from "@/lib/merchant/subscription/charge";
import { projectCurrentChargePreview } from "@/lib/merchant/subscription/projection";
import {
  issueInvoice,
  markInvoiceFailed,
  markInvoicePaid,
} from "@/lib/merchant/billing/mutations";
import { availableInvoiceYears } from "@/lib/merchant/billing/projection";
import {
  setAutoPayEnabled,
  setAutoPaySource,
  updateAutoPayCard,
} from "@/lib/merchant/wallet/wallet-mutations";
import { bridgePlanChargeToLedger } from "@/lib/domains/wallet/merchant-money/bridge";
import type { BillingCycle } from "@/lib/merchant/subscription/types";

type Toast = { kind: "success" | "error"; text: string };

export function MerchantBillingOverview() {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const subscription = useMerchantSubscription();
  const invoices = useMerchantInvoices();
  const wallet = useCurrentMerchantWallet();

  const [displayCycle, setDisplayCycle] = useState<BillingCycle>("monthly");
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [actionType, setActionType] = useState<PlanChangeAction>("defer");
  const [changeOpen, setChangeOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [autoPayOpen, setAutoPayOpen] = useState(false);
  const [updateCardOpen, setUpdateCardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [planVersion, setPlanVersion] = useState(0);
  useEffect(() => {
    return subscribeToPlanStore(() => setPlanVersion((v) => v + 1));
  }, []);

  const allPlans = useMemo(() => [...liveSubscriptionPlans], [planVersion]);

  const subId = subscription.subscription?.id;
  const subCycle = subscription.subscription?.billingCycle;
  const subStatus = subscription.subscription?.status;
  useEffect(() => {
    if (subCycle) setDisplayCycle(subCycle);
  }, [subId, subCycle, subStatus]);

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

  const chargeAttempted = useRef(false);
  useEffect(() => {
    if (chargeAttempted.current) return;
    if (!merchant || !subscription.subscription) return;
    if (subscription.display?.planUnavailable) return;
    const sub = subscription.subscription;
    if (!isChargeDue(sub, Date.now())) return;

    const codeToCharge = effectivePlanCode(sub);
    const plan = getPlanByCode(codeToCharge);
    if (!plan) return;

    chargeAttempted.current = true;
    const source =
      wallet.autoPay?.source === "card" ? "card" : "billing_wallet";
    const actor = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    };
    attemptPlanCharge(sub, plan, source, actor, Date.now());
  }, [
    merchant,
    subscription.subscription,
    subscription.display,
    wallet.autoPay,
  ]);

  const availableYears = useMemo(
    () => availableInvoiceYears(invoices.invoices),
    [invoices.invoices]
  );

  const preview = useMemo(() => {
    if (!targetPlan || !subscription.subscription) return null;
    const currentPlan = allPlans.find(
      (p) => p.code === subscription.subscription?.planCode
    );
    return projectCurrentChargePreview(
      subscription.subscription,
      targetPlan,
      displayCycle,
      currentPlan,
      Date.now()
    );
  }, [targetPlan, subscription.subscription, displayCycle, allPlans]);

  if (subscription.loading || wallet.loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-40 w-full rounded-2xl" />
        <AtlasSkeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
        <AtlasSkeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (
    subscription.error ||
    !subscription.subscription ||
    !subscription.display ||
    !subscription.renewal
  ) {
    return (
      <AtlasErrorState
        title="Could not load billing"
        message={subscription.error ?? "Subscription unavailable."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const sub = subscription.subscription;
  const display = subscription.display;
  const renewal = subscription.renewal;
  const wasTrialing = sub.status === "trialing";
  const actor = {
    id: merchant?.id ?? "unknown",
    name: merchant?.name ?? "Merchant",
    email: merchant?.email ?? "",
  };

  const currentPlanDef = allPlans.find((p) => p.code === sub.planCode);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (!merchant) return;
    if (plan.code === sub.planCode && displayCycle === sub.billingCycle) {
      return;
    }
    if (typeof plan.monthlyPriceGHS !== "number") {
      setSalesOpen(true);
      return;
    }

    const isTrial = sub.status === "trialing";

    setTargetPlan(plan);

    if (isTrial) {
      // Trial conversion is an immediate charge.
      setActionType("charge_now");
    } else if (plan.code === sub.planCode) {
      // Same-plan cycle switch. Monthly to annual charges prorated.
      // Annual to monthly defers to period end.
      if (sub.billingCycle === "monthly" && displayCycle === "annual") {
        setActionType("charge_now");
      } else {
        setActionType("defer");
      }
    } else {
      const targetRaw =
        displayCycle === "monthly"
          ? plan.monthlyPriceGHS
          : plan.annualPriceGHS;
      const currentRaw = currentPlanDef
        ? sub.billingCycle === "monthly"
          ? currentPlanDef.monthlyPriceGHS
          : currentPlanDef.annualPriceGHS
        : 0;
      const target = typeof targetRaw === "number" ? targetRaw : 0;
      const current = typeof currentRaw === "number" ? currentRaw : 0;

      // Compare on daily rates for fair comparison across cycles.
      const targetDays = displayCycle === "annual" ? 365 : 30;
      const currentDays = sub.billingCycle === "annual" ? 365 : 30;
      const targetDaily = target / targetDays;
      const currentDaily = current / currentDays;

      if (targetDaily > currentDaily) {
        setActionType("charge_now");
      } else {
        setActionType("defer");
      }
    }
    setChangeOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!merchant || !targetPlan || !preview) return;
    setSubmitting(true);

    try {
      if (actionType === "reactivate") {
        const r = reactivateSubscription(merchant.id, actor);
        if (!r.ok) {
          showToast("error", r.error ?? "Could not restart.");
          return;
        }
        setChangeOpen(false);
        showToast("success", "Plan restarted.");
        return;
      }

      if (actionType === "defer") {
        const r = scheduleDowngrade(merchant.id, targetPlan.code, actor);
        if (!r.ok) {
          showToast("error", r.error ?? "Could not schedule change.");
          return;
        }
        setChangeOpen(false);
        showToast("success", "Change scheduled for the end of your cycle.");
        return;
      }

      // charge_now. Issue the invoice for the preview amount, attempt the
      // charge, apply the plan with the preview period.
      const source: "billing_wallet" | "card" =
        wallet.autoPay?.source === "card" ? "card" : "billing_wallet";

      const issued = issueInvoice(
        {
          subscriptionId: sub.id,
          merchantId: merchant.id,
          planCode: targetPlan.code,
          planName: targetPlan.name,
          billingCycle: displayCycle,
          amount: preview.amountGHS,
          periodStart: preview.periodStart,
          periodEnd: preview.periodEnd,
          chargeSource: source,
        },
        actor
      );
      if (!issued.ok || !issued.invoice) {
        showToast("error", issued.error ?? "Could not issue invoice.");
        return;
      }

      if (source === "billing_wallet") {
        const nowIso = new Date().toISOString();
        const bridged = bridgePlanChargeToLedger({
          id: issued.invoice.id,
          merchantId: merchant.id,
          planCode: targetPlan.code,
          billingCycle: displayCycle,
          amount: preview.amountGHS,
          status: "successful",
          source: "billing_wallet",
          createdAt: nowIso,
          completedAt: nowIso,
          transactionRef: issued.invoice.id,
        });
        if (!bridged.ok) {
          markInvoiceFailed(
            {
              merchantId: merchant.id,
              invoiceId: issued.invoice.id,
              reason: bridged.error ?? "Charge failed.",
              failedAt: nowIso,
            },
            actor
          );
          showToast("error", bridged.error ?? "Charge failed.");
          return;
        }
        markInvoicePaid(
          {
            merchantId: merchant.id,
            invoiceId: issued.invoice.id,
            ledgerEntryId: "ML-PC-" + issued.invoice.id,
            paidAt: nowIso,
          },
          actor
        );
      } else {
        markInvoicePaid(
          {
            merchantId: merchant.id,
            invoiceId: issued.invoice.id,
            ledgerEntryId: "card-" + issued.invoice.id,
            paidAt: new Date().toISOString(),
          },
          actor
        );
      }

      // Apply the plan change. The period is whatever the preview said:
      // mid-cycle upgrade keeps the existing period end, trial conversion
      // starts a fresh cycle.
      const result = applyImmediatePlanChange(
        merchant.id,
        targetPlan.code,
        targetPlan.name,
        displayCycle,
        {
          periodStart: preview.periodStart,
          periodEnd: preview.periodEnd,
        },
        actor
      );
      if (!result.ok) {
        showToast("error", result.error ?? "Could not update plan.");
        return;
      }
      setChangeOpen(false);
      showToast("success", "Plan updated.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoRenewToggle = (enabled: boolean) => {
    if (!merchant) return;
    const r = setAutoPayEnabled(enabled, actor);
    if (!r.ok) {
      showToast("error", r.error ?? "Could not update auto-renew.");
      return;
    }
    showToast("success", enabled ? "Auto-renew on." : "Auto-renew off.");
  };

  const handleAutoPaySource = async (
    source: "card" | "billing_wallet"
  ) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const r = setAutoPaySource(source, actor);
    return { ok: r.ok, error: r.error };
  };

  const handleUpdateCard = async (input: {
    cardRef: string;
    cardBrand: string;
    cardLast4: string;
  }) => {
    if (!merchant) return { ok: false, error: "No merchant session." };
    const r = updateAutoPayCard(input, actor);
    if (r.ok) {
      setUpdateCardOpen(false);
      showToast("success", "Card saved.");
    }
    return { ok: r.ok, error: r.error };
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Finance
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Billing and plan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          What you pay for, when it renews, and where it goes.
        </p>
      </div>

      <BillingCurrentPlanCard
        display={display}
        renewal={renewal}
        lifecycleSummary={subscription.lifecycleSummary}
        nowMs={nowMs}
        onPayNow={() => setAutoPayOpen(true)}
        onReactivate={() => {
          if (currentPlanDef) {
            setTargetPlan(currentPlanDef);
            setActionType("reactivate");
            setChangeOpen(true);
          }
        }}
      />

      <BillingCycleSwitch value={displayCycle} onChange={setDisplayCycle} />

      <BillingAutoRenewCard
        autoPay={wallet.autoPay}
        renewal={renewal}
        billingBalance={wallet.wallet?.billing.balance ?? 0}
        billingFrozen={wallet.wallet?.billingFrozen ?? false}
        onToggle={handleAutoRenewToggle}
        onConfigure={() => setAutoPayOpen(true)}
      />

      <section aria-labelledby="billing-plan-grid-heading">
        <h2
          id="billing-plan-grid-heading"
          className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Change plan
        </h2>
        <BillingPlanGrid
          plans={allPlans}
          currentPlanCode={sub.planCode}
          currentCycle={sub.billingCycle}
          displayCycle={displayCycle}
          loading={subscription.loading}
          onSelect={handlePlanSelect}
        />
      </section>

      <BillingSavedMethodsCard
        savedMethods={wallet.savedMethods}
        supportedMethodsCount={display.supportedPaymentMethods.length}
      />

      <BillingInvoicesSection
        rows={invoices.rows}
        visibleRows={invoices.visibleRows}
        filters={invoices.filters}
        availableYears={availableYears}
        hasMore={invoices.hasMore}
        loading={invoices.loading}
        onFilterChange={invoices.setFilters}
        onShowMore={invoices.showMore}
      />

      {targetPlan && preview && (
        <PlanChangeModal
          open={changeOpen}
          action={actionType}
          currentPlan={currentPlanDef}
          targetPlan={targetPlan}
          currentCycle={sub.billingCycle}
          targetCycle={displayCycle}
          currentPeriodStart={sub.periodStart}
          currentPeriodEnd={sub.periodEnd}
          preview={preview}
          wasTrialing={wasTrialing}
          submitting={submitting}
          onConfirm={handleConfirmChange}
          onCancel={() => setChangeOpen(false)}
        />
      )}

      <SalesContactModal
        open={salesOpen}
        onClose={() => setSalesOpen(false)}
      />

      <WalletAutoPayModal
        open={autoPayOpen}
        config={wallet.autoPay}
        billing={wallet.wallet?.billing ?? null}
        nextChargeAmount={renewal.nextChargeAmountGHS}
        onSetEnabled={async (enabled) => {
          const r = setAutoPayEnabled(enabled, actor);
          return { ok: r.ok, error: r.error };
        }}
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