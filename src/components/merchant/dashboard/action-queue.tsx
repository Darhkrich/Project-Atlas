"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import type {
  DashboardAction,
  DashboardActionKind,
} from "@/lib/merchant/dashboard/types";

interface ActionQueueProps {
  actions: DashboardAction[];
  isOnboarding: boolean;
}

const ACTION_ICONS: Record<DashboardActionKind, AtlasIconName> = {
  unfulfilled_orders: "package",
  low_stock: "alert",
  action_required_notifications: "alert",
  billing_wallet_low: "wallet",
  pending_withdrawals: "wallet",
};

interface OnboardingStep {
  title: string;
  description: string;
  href: string;
  icon: AtlasIconName;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Add your first product",
    description: "Products are what customers see and buy.",
    href: "/merchant/products/new",
    icon: "add",
  },
  {
    title: "Customize your storefront",
    description: "Set your branding, colors, and layout.",
    href: "/merchant/storefront",
    icon: "store",
  },
  {
    title: "Publish your store",
    description: "Go live when you are ready.",
    href: "/merchant/storefront",
    icon: "external-link",
  },
];

export function ActionQueue({ actions, isOnboarding }: ActionQueueProps) {
  if (isOnboarding) {
    return (
      <section
        aria-labelledby="dashboard-action-queue"
        className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2
          id="dashboard-action-queue"
          className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Start here
        </h2>
        <ul
          role="list"
          className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800"
        >
          {ONBOARDING_STEPS.map((step) => (
            <li key={step.title}>
              <Link
                href={step.href}
                className="group flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  <AtlasIcon
                    name={step.icon}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-neutral-900 group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-200">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                    {step.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="dashboard-action-queue"
      className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2
        id="dashboard-action-queue"
        className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
      >
        What needs you now
      </h2>

      {actions.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4 text-brand-600"
            aria-hidden="true"
          />
          <span>You are all caught up.</span>
        </div>
      ) : (
        <ul
          role="list"
          className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800"
        >
          {actions.map((action) => (
            <li key={action.kind}>
              <Link
                href={action.href}
                className="group flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <AtlasIcon
                    name={ACTION_ICONS[action.kind]}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-neutral-900 group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-200">
                      {action.title}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      {action.count}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                    {action.description}
                  </span>
                </span>
                <AtlasIcon
                  name="chevron-right"
                  className="mt-1 h-4 w-4 shrink-0 text-neutral-300 group-hover:text-neutral-500 dark:text-neutral-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}