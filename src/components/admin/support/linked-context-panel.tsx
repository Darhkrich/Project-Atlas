// components/admin/support/linked-context-panel.tsx
"use client";

import { useState, type ReactNode } from "react";
import type { LinkedEntity } from "@/lib/admin/types/support";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { cn } from "@/lib/utils";
import {
  digitalStatusTone,
  payoutStateTone,
  storefrontStateTone,
  subscriptionStateTone,
  summarizeEntity,
  textClassByTone,
  type StatusTone,
} from "@/lib/admin/support/status-styles";
import { formatAbsolute } from "@/lib/admin/support/format";
import {
  getProviderHealth,
  providerHealthTone,
} from "@/lib/admin/support/provider-health";

export interface LinkedContextActions {
  onRetry?: (transactionId: string) => void;
  onRefund?: (transactionId: string) => void;
  onEscalate?: (transactionId: string) => void;
  onCreditCommission?: (orderId: string) => void;
  onHoldPayout?: (orderId: string) => void;
  onChangePlan?: (merchantId: string) => void;
  onExtendTrial?: (merchantId: string) => void;
  onResetTemplate?: (merchantId: string) => void;
  onViewProvider?: (providerId: string) => void;
}

interface LinkedContextPanelProps extends LinkedContextActions {
  entity: LinkedEntity;
  defaultExpanded?: boolean;
  relatedTicketCount?: number;
}

const panelTitleMap = {
  digital_transaction: "Linked transaction",
  reseller_order: "Linked order",
  merchant_account: "Linked merchant",
  merchant_storefront: "Linked storefront",
  merchant_order: "Linked order",
  merchant_subscription: "Linked subscription",
  merchant_template: "Linked template",
} as const;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-neutral-500 dark:text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-800 dark:text-neutral-200">
        {children}
      </dd>
    </>
  );
}

function StatusValue({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", textClassByTone[tone])}
    >
      <StatusDot tone={tone} size="sm" />
      {label}
    </span>
  );
}

export function LinkedContextPanel({
  entity,
  defaultExpanded = true,
  relatedTicketCount,
  onRetry,
  onRefund,
  onEscalate,
  onCreditCommission,
  onHoldPayout,
  onChangePlan,
  onExtendTrial,
  onResetTemplate,
  onViewProvider,
}: LinkedContextPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const summary = summarizeEntity(entity);

  const providerHealth =
    entity.kind === "digital_transaction"
      ? getProviderHealth(entity.providerId)
      : null;

  const actions: ReactNode[] = [];

  if (entity.kind === "digital_transaction") {
    if (onRetry) {
      actions.push(
        <Button
          key="retry"
          variant="outline"
          size="sm"
          onClick={() => onRetry(entity.transactionId)}
        >
          Retry fulfillment
        </Button>
      );
    }
    if (onRefund) {
      actions.push(
        <Button
          key="refund"
          variant="outline"
          size="sm"
          onClick={() => onRefund(entity.transactionId)}
        >
          Issue refund
        </Button>
      );
    }
    if (onEscalate) {
      actions.push(
        <Button
          key="escalate"
          variant="outline"
          size="sm"
          onClick={() => onEscalate(entity.transactionId)}
        >
          Escalate to provider
        </Button>
      );
    }
    if (onViewProvider) {
      actions.push(
        <Button
          key="provider"
          variant="ghost"
          size="sm"
          onClick={() => onViewProvider(entity.providerId)}
        >
          View provider
        </Button>
      );
    }
  } else if (entity.kind === "reseller_order") {
    if (onCreditCommission) {
      actions.push(
        <Button
          key="credit"
          variant="outline"
          size="sm"
          onClick={() => onCreditCommission(entity.orderId)}
        >
          Credit commission
        </Button>
      );
    }
    if (onHoldPayout) {
      actions.push(
        <Button
          key="hold"
          variant="outline"
          size="sm"
          onClick={() => onHoldPayout(entity.orderId)}
        >
          Hold payout
        </Button>
      );
    }
  } else if (entity.kind === "merchant_account") {
    if (onExtendTrial) {
      actions.push(
        <Button
          key="trial"
          variant="outline"
          size="sm"
          onClick={() => onExtendTrial(entity.merchantId)}
        >
          Extend trial
        </Button>
      );
    }
    if (onChangePlan) {
      actions.push(
        <Button
          key="plan"
          variant="outline"
          size="sm"
          onClick={() => onChangePlan(entity.merchantId)}
        >
          Change plan
        </Button>
      );
    }
    if (onResetTemplate) {
      actions.push(
        <Button
          key="template"
          variant="outline"
          size="sm"
          onClick={() => onResetTemplate(entity.merchantId)}
        >
          Reset template
        </Button>
      );
    }
  }

  return (
    <section
      aria-label={panelTitleMap[entity.kind]}
      className="rounded-lg border border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <StatusDot tone={summary.tone} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {panelTitleMap[entity.kind]}
            </p>
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {summary.label}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide" : "Show"}
        </Button>
      </div>

      {providerHealth && entity.kind === "digital_transaction" && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-neutral-200 px-3 py-2 text-[11px] dark:border-neutral-800">
          <span className="flex items-center gap-1.5">
            <StatusDot
              tone={providerHealthTone(providerHealth.healthStatus)}
              size="sm"
            />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {providerHealth.name}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {providerHealth.healthStatus}
            </span>
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">
            {providerHealth.successRate.toFixed(1)}% success
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">
            {providerHealth.averageResponseTime}ms avg
          </span>
          {typeof relatedTicketCount === "number" && relatedTicketCount > 1 && (
            <span className="text-warning-700 dark:text-warning-300">
              {relatedTicketCount} related open tickets
            </span>
          )}
        </div>
      )}

      {expanded && (
        <div className="border-t border-neutral-200 px-3 py-3 dark:border-neutral-800">
          <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1.5 text-xs">
            {entity.kind === "digital_transaction" && (
              <>
                <Field label="Reference">{entity.transactionId}</Field>
                <Field label="Provider">{entity.providerName}</Field>
                {entity.providerTransactionId && (
                  <Field label="Provider ref">
                    {entity.providerTransactionId}
                  </Field>
                )}
                <Field label="Service">{entity.service}</Field>
                <Field label="Amount">GHS {entity.amount}</Field>
                <Field label="Recipient">{entity.recipient}</Field>
                <Field label="Status">
                  <StatusValue
                    tone={digitalStatusTone(entity.status)}
                    label={entity.status}
                  />
                </Field>
                {entity.failureReason && (
                  <Field label="Reason">{entity.failureReason}</Field>
                )}
                <Field label="Retries">{entity.retryCount}</Field>
                {entity.lastProviderResponse && (
                  <Field label="Last response">
                    {entity.lastProviderResponse.providerCode
                      ? entity.lastProviderResponse.providerCode + ": "
                      : ""}
                    {entity.lastProviderResponse.message}
                  </Field>
                )}
              </>
            )}

            {entity.kind === "reseller_order" && (
              <>
                <Field label="Order">{entity.orderId}</Field>
                <Field label="Reseller">{entity.resellerName}</Field>
                {entity.tier && <Field label="Tier">{entity.tier}</Field>}
                <Field label="Customer paid">GHS {entity.downstreamPrice}</Field>
                <Field label="Commission">GHS {entity.commission}</Field>
                <Field label="Payout">
                  <StatusValue
                    tone={payoutStateTone(entity.payoutState)}
                    label={entity.payoutState}
                  />
                </Field>
                {entity.settledAt && (
                  <Field label="Settled">
                    {formatAbsolute(entity.settledAt)}
                  </Field>
                )}
              </>
            )}

            {entity.kind === "merchant_account" && (
              <>
                <Field label="Merchant">{entity.merchantName}</Field>
                <Field label="Plan">
                  <Badge variant="brand" size="sm">
                    {entity.plan}
                  </Badge>
                </Field>
                <Field label="Subscription">
                  <StatusValue
                    tone={subscriptionStateTone(entity.subscriptionState)}
                    label={entity.subscriptionState}
                  />
                </Field>
                <Field label="Template">
                  {entity.templateId} {"\u00B7"} {entity.templateVersion}
                </Field>
                <Field label="Storefront">
                  <StatusValue
                    tone={storefrontStateTone(entity.storefrontState)}
                    label={entity.storefrontState}
                  />
                </Field>
              </>
            )}
          </dl>

          {actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
              {actions}
            </div>
          )}
        </div>
      )}
    </section>
  );
}