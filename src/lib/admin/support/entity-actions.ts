// lib/admin/support/entity-actions.ts

import type {
  LinkedEntity,
  SupportUserType,
} from "@/lib/admin/types/support";

export type CompensationMethod =
  | "atlas_wallet"
  | "mobile_money"
  | "card"
  | "bank_transfer"
  | "atlas_points"
  | "subscription_credit"
  | "payout_queue";

export interface CompensationOption {
  method: CompensationMethod;
  label: string;
  description: string;
}

export const compensationOptionsByUserType: Record<
  SupportUserType,
  CompensationOption[]
> = {
  customer: [
    {
      method: "atlas_wallet",
      label: "Atlas Wallet credit",
      description: "Instant. Customer can spend immediately on any digital service.",
    },
    {
      method: "mobile_money",
      label: "Mobile money reversal",
      description: "Reverses to the original MoMo number. 1 to 24 hours.",
    },
    {
      method: "card",
      label: "Card refund",
      description: "Refunds the original card. 3 to 5 business days.",
    },
    {
      method: "atlas_points",
      label: "Atlas Points",
      description: "Redeemable on any service. Never expires.",
    },
  ],
  reseller: [
    {
      method: "atlas_wallet",
      label: "Reseller wallet credit",
      description: "Immediate. Available for downstream sales.",
    },
    {
      method: "payout_queue",
      label: "Payout queue adjustment",
      description: "Added to the next payout cycle. Tuesday or Friday.",
    },
    {
      method: "atlas_points",
      label: "Atlas Points",
      description: "Redeemable on any service.",
    },
  ],
  merchant: [
    {
      method: "subscription_credit",
      label: "Subscription credit",
      description: "Applies to the next billing cycle automatically.",
    },
    {
      method: "bank_transfer",
      label: "Bank transfer",
      description: "Refunds the original settlement account. 1 to 3 business days.",
    },
    {
      method: "atlas_points",
      label: "Atlas Points",
      description: "Redeemable on any service.",
    },
  ],
};

export function compensationOptionsFor(entity: LinkedEntity): CompensationOption[] {
  switch (entity.kind) {
    case "digital_transaction":
      return compensationOptionsByUserType.customer;
    case "reseller_order":
      return compensationOptionsByUserType.reseller;
    case "merchant_account":
      return compensationOptionsByUserType.merchant;
  }
}

export function suggestedAmountFor(entity: LinkedEntity): number {
  switch (entity.kind) {
    case "digital_transaction":
      return entity.amount;
    case "reseller_order":
      return entity.commission;
    case "merchant_account":
      return 0;
  }
}

export function compensationReasonFor(entity: LinkedEntity): string {
  switch (entity.kind) {
    case "digital_transaction":
      return `Refund for ${entity.transactionId} (${entity.service})`;
    case "reseller_order":
      return `Commission adjustment for ${entity.orderId}`;
    case "merchant_account":
      return `Credit for ${entity.merchantName} (${entity.plan})`;
  }
}