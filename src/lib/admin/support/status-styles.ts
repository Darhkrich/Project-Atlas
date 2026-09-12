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

/**
 * Dot background classes. Uses the -500 shade across all tones so dots
 * read with equal visual weight against neutral backgrounds.
 */
export const dotClassByTone: Record<StatusTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  neutral: "bg-neutral-400",
};

/**
 * Inline text classes for status values shown inside field lists.
 */
export const textClassByTone: Record<StatusTone, string> = {
  success: "text-success-700 dark:text-success-300",
  warning: "text-warning-700 dark:text-warning-300",
  danger: "text-danger-700 dark:text-danger-300",
  info: "text-info-700 dark:text-info-300",
  neutral: "text-neutral-600 dark:text-neutral-400",
};

export interface EntitySummary {
  dotClass: string;
  label: string;
}

export function summarizeEntity(entity: LinkedEntity): EntitySummary {
  switch (entity.kind) {
    case "digital_transaction":
      return {
        dotClass: dotClassByTone[digitalStatusTone(entity.status)],
        label: `${entity.service} · GHS ${entity.amount}`,
      };
    case "reseller_order":
      return {
        dotClass: dotClassByTone[payoutStateTone(entity.payoutState)],
        label: `${entity.orderId} · GHS ${entity.commission} commission`,
      };
    case "merchant_account":
      return {
        dotClass:
          dotClassByTone[subscriptionStateTone(entity.subscriptionState)],
        label: `${entity.merchantName} · ${entity.plan}`,
      };
  }
}