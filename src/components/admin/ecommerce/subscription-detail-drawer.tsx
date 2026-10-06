/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  Invoice,
  MerchantSubscription,
} from "@/lib/admin/types/ecommerce";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  BILLING_CYCLE_LABEL,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  SUBSCRIPTION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_VARIANT,
} from "@/lib/admin/ecommerce/subscription-labels";

interface SubscriptionDetailDrawerProps {
  subscription: MerchantSubscription | null;
  invoices: Invoice[];
  onClose: () => void;
  onChangePlan: (subscription: MerchantSubscription) => void;
  onApplyDiscount: (subscription: MerchantSubscription) => void;
  onCancel: (subscription: MerchantSubscription) => void;
  onReactivate: (subscription: MerchantSubscription) => void;
}

export function SubscriptionDetailDrawer({
  subscription,
  invoices,
  onClose,
  onChangePlan,
  onApplyDiscount,
  onCancel,
  onReactivate,
}: SubscriptionDetailDrawerProps) {
  const now = useNow();
  const isOpen = subscription !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!subscription) return null;

  const isCancelled = subscription.status === "cancelled";
  const isActive = subscription.status === "active";

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={
        "Subscription details for " + subscription.merchantName
      }
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close subscription detail"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">
              {subscription.merchantName}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {subscription.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close drawer"
          >
            Close
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={SUBSCRIPTION_STATUS_VARIANT[subscription.status]}>
            {SUBSCRIPTION_STATUS_LABEL[subscription.status]}
          </Badge>
          <Badge variant="brand" size="sm">
            {subscription.planName}
          </Badge>
          <Badge variant="neutral" size="sm">
            {BILLING_CYCLE_LABEL[subscription.billingCycle]}
          </Badge>
          {subscription.discountPercent !== undefined && (
            <Badge variant="success" size="sm">
              {subscription.discountPercent}% off
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            {/* Overview */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Overview
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Amount paid
                  </dt>
                  <dd className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(subscription.amountPaid)}
                  </dd>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Last payment
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {now
                      ? formatRelative(subscription.lastPaymentDate, now)
                      : formatDate(subscription.lastPaymentDate)}
                  </dd>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Started
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(subscription.startDate)}
                  </dd>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Next billing
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {now
                      ? formatRelative(subscription.nextBillingDate, now)
                      : formatDate(subscription.nextBillingDate)}
                  </dd>
                </div>
              </dl>
              <Link
                href={"/admin/ecommerce/merchants/" + subscription.merchantId}
                className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <AtlasIcon
                  name="external-link"
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5"
                />
                View merchant account
              </Link>
            </section>

            {/* Invoices */}
            <section className="space-y-3 border-t border-neutral-200 pt-5 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Invoices
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {invoices.length} total
                </span>
              </div>
              {invoices.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  No invoices on record.
                </p>
              ) : (
                <ul role="list" className="space-y-1.5">
                  {invoices.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-900"
                    >
                      <span className="font-mono text-neutral-500 dark:text-neutral-400">
                        {inv.id}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(inv.amount)}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {formatDate(inv.date)}
                      </span>
                      <Badge
                        variant={INVOICE_STATUS_VARIANT[inv.status]}
                        size="sm"
                      >
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <Can permission={PERMISSIONS.SUBSCRIPTIONS_MANAGE}>
          <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
            {isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangePlan(subscription)}
                >
                  Change plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyDiscount(subscription)}
                >
                  {subscription.discountPercent !== undefined
                    ? "Edit discount"
                    : "Apply discount"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("ml-auto text-danger-600")}
                  onClick={() => onCancel(subscription)}
                >
                  Cancel subscription
                </Button>
              </>
            )}
            {isCancelled && (
              <Button
                size="sm"
                onClick={() => onReactivate(subscription)}
              >
                Reactivate subscription
              </Button>
            )}
            {!isActive && !isCancelled && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No actions available for{" "}
                <span className="capitalize">{subscription.status}</span>{" "}
                subscriptions.
              </p>
            )}
          </div>
        </Can>
      </div>
    </div>
  );
}