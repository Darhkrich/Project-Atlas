// lib/merchant/transactions/labels.ts

import type {
  TransactionKind,
  TransactionKindVariant,
  MerchantTransaction,
} from "./types";
import type { AtlasIconName } from "@/components/atlas/icons";

export const TRANSACTION_KIND_LABEL: Record<TransactionKind, string> = {
  funding: "Wallet funding",
  customer_payment: "Customer payment",
  plan_charge: "Plan charge",
  refund: "Refund",
  withdrawal: "Withdrawal",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  adjustment: "Adjustment",
};

export const TRANSACTION_KIND_VARIANT: Record<
  TransactionKind,
  TransactionKindVariant
> = {
  funding: "brand",
  customer_payment: "success",
  plan_charge: "warning",
  refund: "danger",
  withdrawal: "info",
  transfer_in: "success",
  transfer_out: "neutral",
  adjustment: "info",
};

export const TRANSACTION_KIND_ICON: Record<TransactionKind, AtlasIconName> = {
  funding: "wallet",
  customer_payment: "cart",
  plan_charge: "repeat",
  refund: "repeat",
  withdrawal: "bank",
  transfer_in: "arrow-down",
  transfer_out: "arrow-up",
  adjustment: "settings",
};

const WALLET_LABEL = {
  main: "Main wallet",
  billing: "Billing wallet",
} as const;

export function describeWalletType(
  walletType: "main" | "billing"
): string {
  return WALLET_LABEL[walletType];
}

export function describeTransferWallet(
  walletType: "main" | "billing",
  counterparty: "main" | "billing"
): string {
  return WALLET_LABEL[walletType] + " to " + WALLET_LABEL[counterparty];
}

export function describeTransaction(tx: MerchantTransaction): string {
  return tx.description;
}

export function describeTransactionSource(tx: MerchantTransaction): string {
  if (tx.sourceType === "wallet_ledger") {
    return (
      "Recorded from merchant " +
      tx.walletType +
      " wallet ledger."
    );
  }
  return "Recorded from subscription invoice.";
}