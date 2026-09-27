"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useSubscriptionPlans } from "@/lib/admin/hooks/use-subscription-plans";
import { useMerchants } from "@/lib/admin/hooks/use-merchants";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  derivePlanDisplayPrices,
  reorderSubscriptionPlan,
  toggleSubscriptionPlanVisibility,
  updateSubscriptionPlan,
  PAYMENT_METHOD_LABEL,
  PLAN_VISIBILITY_HELP,
  PLAN_VISIBILITY_LABEL,
  PLAN_VISIBILITY_VARIANT,
  SUPPORT_TIER_LABEL,
  THEME_LABEL,
} from "@/lib/domains/subscriptions";
import type {
  CreatePlanInput,
  SubscriptionPlan,
  SubscriptionPlanActor,
  UpdatePlanInput,
} from "@/lib/domains/subscriptions";
import type { Merchant } from "@/lib/admin/types/merchant";
import { PlanEditorModal } from "./plan-editor-modal";
import { PlanDeleteModal } from "./plan-delete-modal";

interface Toast {
  kind: "success" | "error";
  text: string;
}

export function PlanEditorView() {
  const admin = useCurrentAdmin();
  const { plans, loading } = useSubscriptionPlans();
  const { merchants } = useMerchants();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: SubscriptionPlanActor = useMemo(
    () =>
      admin
        ? {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          }
        : { id: "system", name: "System", email: "system@atlas.com" },
    [admin]
  );

  const merchantCountByPlan = useMemo(() => {
    const map = new Map<string, number>();
    const list = merchants as Merchant[];
    for (const m of list) {
      const code = m.subscription.planId;
      map.set(code, (map.get(code) ?? 0) + 1);
    }
    return map;
  }, [merchants]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 6000);
  };

  const handleCreate = (
    input: CreatePlanInput
  ): { ok: boolean; error?: string } => {
    const result = createSubscriptionPlan(input, actor);
    if (!result.ok) return { ok: false, error: result.error };
    showToast("success", "Plan " + input.name + " created.");
    return { ok: true };
  };

  const handleUpdate = (
    code: string,
    patch: UpdatePlanInput
  ): { ok: boolean; error?: string } => {
    const result = updateSubscriptionPlan(code, patch, actor);
    if (!result.ok) return { ok: false, error: result.error };
    showToast("success", "Plan updated.");
    return { ok: true };
  };

  const handleToggle = (plan: SubscriptionPlan) => {
    const result = toggleSubscriptionPlanVisibility(plan.code, actor);
    if (!result.ok) {
      showToast("error", result.error ?? "Could not toggle visibility.");
      return;
    }
    const nextVisibility = result.plan?.visibility;
    showToast(
      "success",
      nextVisibility === "public" ? "Plan published." : "Plan hidden."
    );
  };

  const handleReorder = (
    plan: SubscriptionPlan,
    direction: "up" | "down"
  ) => {
    const result = reorderSubscriptionPlan(plan.code, direction, actor);
    if (!result.ok) {
      showToast("error", result.error ?? "Could not reorder.");
    }
  };

  const handleDeleteConfirm = (): { ok: boolean; error?: string } => {
    if (!deletingPlan) return { ok: true };
    const count = merchantCountByPlan.get(deletingPlan.code) ?? 0;
    const result = deleteSubscriptionPlan(deletingPlan.code, count, actor);
    if (!result.ok) return { ok: false, error: result.error };
    showToast("success", "Plan " + deletingPlan.name + " deleted.");
    return { ok: true };
  };

  const openCreate = () => {
    setEditingPlan(null);
    setEditorOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditorOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {plans.length} plan{plans.length === 1 ? "" : "s"}. Reordering changes
          which plan changes count as upgrades.
        </p>
        <Can permission={PERMISSIONS.PRICING_MANAGE}>
          <Button size="sm" onClick={openCreate}>
            New plan
          </Button>
        </Can>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No subscription plans"
            description="Create the first plan to give merchants something to subscribe to."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const prices = derivePlanDisplayPrices(plan);
            const merchantCount = merchantCountByPlan.get(plan.code) ?? 0;
            return (
              <div
                key={plan.code}
                className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {plan.name}
                      </h3>
                      {plan.highlighted && (
                        <Badge variant="brand" size="sm">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {plan.code}
                    </p>
                  </div>
                  <Badge
                    variant={PLAN_VISIBILITY_VARIANT[plan.visibility]}
                    size="sm"
                  >
                    {PLAN_VISIBILITY_LABEL[plan.visibility]}
                  </Badge>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {prices.monthly}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    or {prices.annual}
                  </p>
                </div>

                <dl className="mt-4 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between gap-2">
                    <dt>Products</dt>
                    <dd className="text-neutral-900 dark:text-neutral-100">
                      {plan.maxProducts === "unlimited"
                        ? "Unlimited"
                        : plan.maxProducts.toLocaleString("en-GH")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Themes</dt>
                    <dd className="text-right text-neutral-900 dark:text-neutral-100">
                      {plan.themes.map((t) => THEME_LABEL[t]).join(", ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Payment methods</dt>
                    <dd className="text-right text-neutral-900 dark:text-neutral-100">
                      {plan.paymentMethods
                        .map((m) => PAYMENT_METHOD_LABEL[m])
                        .join(", ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Domain</dt>
                    <dd className="text-right text-neutral-900 dark:text-neutral-100">
                      {plan.customDomain
                        ? "Subdomain + Custom"
                        : plan.subdomain
                        ? "Subdomain only"
                        : "None"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Support</dt>
                    <dd className="text-right text-neutral-900 dark:text-neutral-100">
                      {SUPPORT_TIER_LABEL[plan.supportTier]}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Merchants</dt>
                    <dd className="text-right text-neutral-900 dark:text-neutral-100">
                      {merchantCount.toLocaleString("en-GH")}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
                  {PLAN_VISIBILITY_HELP[plan.visibility]}
                </p>

                <Can permission={PERMISSIONS.PRICING_MANAGE}>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(plan)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(plan)}
                    >
                      {plan.visibility === "public" ? "Hide" : "Publish"}
                    </Button>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={"Move " + plan.name + " up"}
                        onClick={() => handleReorder(plan, "up")}
                        className="rounded border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        aria-label={"Move " + plan.name + " down"}
                        onClick={() => handleReorder(plan, "down")}
                        className="rounded border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      >
                        Down
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-600"
                        onClick={() => setDeletingPlan(plan)}
                        disabled={merchantCount > 0}
                        title={
                          merchantCount > 0
                            ? merchantCount + " merchant(s) on this plan"
                            : "Delete plan"
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Can>
              </div>
            );
          })}
        </div>
      )}

      <PlanEditorModal
        open={editorOpen}
        mode={editingPlan ? "edit" : "create"}
        plan={editingPlan}
        existingPlans={plans}
        onClose={() => {
          setEditorOpen(false);
          setEditingPlan(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <PlanDeleteModal
        open={deletingPlan !== null}
        plan={deletingPlan}
        merchantCount={
          deletingPlan ? merchantCountByPlan.get(deletingPlan.code) ?? 0 : 0
        }
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleDeleteConfirm}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}