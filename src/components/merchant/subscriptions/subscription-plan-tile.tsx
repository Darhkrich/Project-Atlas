"use client";

import type { ReactNode } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import { projectPlanRowSummary } from "@/lib/domains/subscriptions";

type TileBadge = "most_chosen" | "selected" | "current" | "trial_recommended" | null;

interface Props {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "annual";
  badge: TileBadge;
  trialBadge?: string | null;
  emphasized?: boolean;
  secondaryPriceLine?: string | null;
  savingsLine?: string | null;
  contextBox?: ReactNode;
  comparisonLines?: string[];
  actionLabel: string;
  actionHelper?: string | null;
  actionDisabled?: boolean;
  onAction: () => void;
}

function priceLabel(
  plan: SubscriptionPlan,
  cycle: "monthly" | "annual"
): string {
  const summary = projectPlanRowSummary(plan);
  return cycle === "monthly" ? summary.monthlyLabel : summary.annualLabel;
}

function periodLabel(cycle: "monthly" | "annual"): string {
  return cycle === "monthly" ? "per month" : "per year";
}

function badgeLabel(badge: Exclude<TileBadge, null>): string {
  if (badge === "most_chosen") return "Most chosen";
  if (badge === "selected") return "Selected";
  if (badge === "trial_recommended") return "Best during trial";
  return "Current plan";
}

function badgeClass(badge: Exclude<TileBadge, null>): string {
  if (badge === "most_chosen") return "bg-brand-600 text-white";
  if (badge === "trial_recommended")
    return "bg-accent-500 text-neutral-950";
  return "bg-brand-100 text-brand-800 ring-1 ring-brand-300 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-800";
}

function featureList(plan: SubscriptionPlan): string[] {
  const summary = projectPlanRowSummary(plan);

  const productsLabel =
    plan.maxProducts === "unlimited"
      ? "Unlimited products"
      : "Up to " + plan.maxProducts + " products";

  const themesLabel =
    plan.themes.length +
    " theme" +
    (plan.themes.length === 1 ? "" : "s");

  const methodsLabel =
    plan.paymentMethods.length +
    " payment method" +
    (plan.paymentMethods.length === 1 ? "" : "s");

  const items: string[] = [
    productsLabel,
    summary.supportLabel,
    summary.domainLabel,
    themesLabel,
    methodsLabel,
  ];
  if (plan.aiAssistant) items.push("AI storefront assistant");
  return items;
}

export function SubscriptionPlanTile({
  plan,
  billingCycle,
  badge,
  trialBadge = null,
  emphasized = false,
  secondaryPriceLine = null,
  savingsLine = null,
  contextBox = null,
  comparisonLines,
  actionLabel,
  actionHelper = null,
  actionDisabled = false,
  onAction,
}: Props) {
  const price = priceLabel(plan, billingCycle);
  const period = periodLabel(billingCycle);
  const isCustom = typeof plan.monthlyPriceGHS !== "number";
  const features = featureList(plan);

  const cardClass =
    "relative flex h-full flex-col rounded-2xl border p-5 transition-colors " +
    (emphasized
      ? "border-brand-300 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/20"
      : badge === "trial_recommended"
      ? "border-accent-500/60 bg-accent-500/5 dark:border-accent-500/40"
      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700");

  const buttonClass =
    "mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
    (emphasized
      ? "border border-brand-300 bg-brand-100 text-brand-800 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
      : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50");

  return (
    <div className={cardClass}>
      {badge && (
        <span
          className={
            "absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm " +
            badgeClass(badge)
          }
        >
          {badgeLabel(badge)}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
          {plan.name}
        </h3>
        {trialBadge && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-success-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success-700 ring-1 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800">
            {trialBadge}
          </span>
        )}
      </div>

      {plan.description && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {plan.description}
        </p>
      )}

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <p className="whitespace-nowrap text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            {price}
          </p>
          {!isCustom && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {period}
            </p>
          )}
        </div>
        {secondaryPriceLine && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {secondaryPriceLine}
          </p>
        )}
        {savingsLine && (
          <p className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-300">
            {savingsLine}
          </p>
        )}
      </div>

      {contextBox && <div className="mt-4">{contextBox}</div>}

      <ul
        role="list"
        className="mt-4 flex-1 space-y-2 text-sm text-neutral-600 dark:text-neutral-400"
      >
        {features.map((label, i) => (
          <li key={i} className="flex items-start">
            <AtlasIcon
              name="check"
              aria-hidden="true"
              className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand-500"
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {comparisonLines && comparisonLines.length > 0 && (
        <div className="mt-4 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          {comparisonLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {actionHelper && (
        <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
          {actionHelper}
        </p>
      )}

      <button
        type="button"
        disabled={actionDisabled}
        onClick={onAction}
        aria-label={actionLabel}
        className={buttonClass}
      >
        {actionLabel}
      </button>
    </div>
  );
}