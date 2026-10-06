// lib/admin/support/status-styles.ts

import type {
  DigitalTransactionStatus,
  LinkedEntity,
  PayoutState,
  SubscriptionState,
  StorefrontState,
} from "@/lib/admin/types/support";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export function digitalStatusTone(
  status: DigitalTransactionStatus
): StatusTone {
  switch (status) {
    case "successful":
      return "success";
    case "pending":
      return "info";
    case "failed":
      return "danger";
    case "refunded":
      return "neutral";
  }
}

export function payoutStateTone(state: PayoutState): StatusTone {
  switch (state) {
    case "settled":
      return "success";
    case "pending":
      return "warning";
    case "on_hold":
      return "warning";
    case "failed":
      return "danger";
  }
}

export function subscriptionStateTone(state: SubscriptionState): StatusTone {
  switch (state) {
    case "active":
      return "success";
    case "trial":
      return "info";
    case "past_due":
      return "warning";
    case "suspended":
      return "danger";
    case "cancelled":
      return "neutral";
  }
}

export function storefrontStateTone(state: StorefrontState): StatusTone {
  switch (state) {
    case "live":
      return "success";
    case "draft":
      return "neutral";
    case "suspended":
      return "danger";
  }
}

export const dotClassByTone: Record<StatusTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  neutral: "bg-neutral-400",
};

export const textClassByTone: Record<StatusTone, string> = {
  success: "text-success-700 dark:text-success-300",
  warning: "text-warning-700 dark:text-warning-300",
  danger: "text-danger-700 dark:text-danger-300",
  info: "text-info-700 dark:text-info-300",
  neutral: "text-neutral-600 dark:text-neutral-400",
};

export interface EntitySummary {
  tone: StatusTone;
  label: string;
}

export function summarizeEntity(entity: LinkedEntity): EntitySummary {
  switch (entity.kind) {
    case "digital_transaction":
      return {
        tone: digitalStatusTone(entity.status),
        label: entity.service + " \u00B7 GHS " + entity.amount,
      };
    case "reseller_order":
      return {
        tone: payoutStateTone(entity.payoutState),
        label:
          entity.orderId +
          " \u00B7 GHS " +
          entity.commission +
          " commission",
      };
    case "merchant_account":
      return {
        tone: subscriptionStateTone(entity.subscriptionState),
        label: entity.merchantName + " \u00B7 " + entity.plan,
      };
    case "merchant_storefront":
      return { tone: "info", label: entity.label };
    case "merchant_order":
      return { tone: "info", label: entity.label };
    case "merchant_subscription":
      return { tone: "info", label: entity.label };
    case "merchant_template":
      return { tone: "neutral", label: entity.label };
  }
}