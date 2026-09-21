import type { ResellerWalletLedgerEntry } from "@/lib/reseller/types/wallet";
import type { ResellerOrderRow } from "@/lib/domains/orders/use-reseller-orders";
import type {
  ResellerTransactionDirection,
  ResellerTransactionKind,
  ResellerTransactionRow,
} from "@/lib/reseller/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KIND_VARIANTS,
  WITHDRAWAL_STATUS_LABELS,
  WITHDRAWAL_STATUS_VARIANTS,
} from "./transaction-labels";

function walletEntryToRow(
  entry: ResellerWalletLedgerEntry
): ResellerTransactionRow {
  if (entry.kind === "funding") {
    return {
      id: entry.id,
      kind: "wallet_funding",
      direction: "credit",
      amount: entry.amount,
      description: entry.provider + " " + entry.maskedLabel,
      detail: entry.reference,
      createdAt: entry.createdAt,
      source: { type: "wallet", entry },
    };
  }

  if (entry.kind === "commission") {
    return {
      id: entry.id,
      kind: "commission",
      direction: "credit",
      amount: entry.amount,
      description: entry.relatedOrderId,
      detail: entry.service,
      createdAt: entry.createdAt,
      source: { type: "wallet", entry },
    };
  }

  if (entry.kind === "purchase") {
    return {
      id: entry.id,
      kind: "wallet_purchase",
      direction: "debit",
      amount: entry.amount,
      description: entry.service,
      detail: entry.relatedOrderId,
      createdAt: entry.createdAt,
      source: { type: "wallet", entry },
    };
  }

  if (entry.kind === "adjustment") {
    const direction: ResellerTransactionDirection =
      entry.amount >= 0 ? "credit" : "debit";
    return {
      id: entry.id,
      kind: "adjustment",
      direction,
      amount: Math.abs(entry.amount),
      description: entry.actor.name,
      detail: entry.reason,
      createdAt: entry.createdAt,
      source: { type: "wallet", entry },
    };
  }

  return {
    id: entry.id,
    kind: "withdrawal",
    direction: "debit",
    amount: entry.amount,
    fee: entry.fee,
    total: entry.total,
    description: TRANSACTION_KIND_LABELS.withdrawal,
    detail:
      entry.withdrawalKind === "refund_to_source"
        ? "Refund to source"
        : "Withdraw to account",
    status: entry.status,
    statusLabel: WITHDRAWAL_STATUS_LABELS[entry.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANTS[entry.status],
    createdAt: entry.createdAt,
    source: { type: "wallet", entry },
  };
}

function orderToRow(order: ResellerOrderRow): ResellerTransactionRow {
  return {
    id: order.id,
    kind: "external_purchase",
    direction: "debit",
    amount: order.amount,
    description: order.serviceId,
    detail: order.customerName,
    createdAt: order.createdAt,
    source: { type: "order", order },
  };
}

export function projectResellerTransactions(
  ledgerEntries: ResellerWalletLedgerEntry[],
  nonWalletOrders: ResellerOrderRow[]
): ResellerTransactionRow[] {
  const rows: ResellerTransactionRow[] = [];

  for (const entry of ledgerEntries) {
    rows.push(walletEntryToRow(entry));
  }
  for (const order of nonWalletOrders) {
    rows.push(orderToRow(order));
  }

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rows;
}

export function filterResellerTransactions(
  rows: ResellerTransactionRow[],
  filterId: string,
  searchQuery: string
): ResellerTransactionRow[] {
  const normalized = searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (filterId !== "all") {
      if (filterId === "purchases") {
        if (row.kind !== "wallet_purchase" && row.kind !== "external_purchase") {
          return false;
        }
      } else if (filterId === "commissions") {
        if (row.kind !== "commission") return false;
      } else if (filterId === "funding") {
        if (row.kind !== "wallet_funding") return false;
      } else if (filterId === "withdrawals") {
        if (row.kind !== "withdrawal") return false;
      } else if (filterId === "adjustments") {
        if (row.kind !== "adjustment") return false;
      }
    }

    if (!normalized) return true;

    const haystack = [
      row.description,
      row.detail,
      TRANSACTION_KIND_LABELS[row.kind],
      row.statusLabel ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function transactionKindLabel(kind: ResellerTransactionKind): string {
  return TRANSACTION_KIND_LABELS[kind];
}

export function transactionKindVariant(kind: ResellerTransactionKind): string {
  return TRANSACTION_KIND_VARIANTS[kind];
}