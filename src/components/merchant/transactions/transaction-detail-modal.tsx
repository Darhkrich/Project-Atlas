"use client";

import Link from "next/link";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { AtlasBadge } from "@/components/atlas/badge";
import {
  formatAbsolute,
  formatCurrency,
  formatRelative,
} from "@/lib/shared/format";
import {
  describeTransactionSource,
  describeWalletType,
  describeTransferWallet,
} from "@/lib/merchant/transactions/labels";
import type { MerchantTransaction } from "@/lib/merchant/transactions/types";

interface Props {
  row: MerchantTransaction | null;
  nowMs: number | null;
  onClose: () => void;
}

function amountTone(row: MerchantTransaction): string {
  if (row.direction === "internal") {
    return "text-neutral-700 dark:text-neutral-300";
  }
  if (row.direction === "credit") {
    return "text-success-700 dark:text-success-300";
  }
  return "text-neutral-950 dark:text-white";
}

function amountPrefix(row: MerchantTransaction): string {
  if (row.direction === "internal") return "";
  return row.direction === "credit" ? "+" : "\u2212";
}

function walletLine(row: MerchantTransaction): string {
  if (
    (row.kind === "transfer_in" || row.kind === "transfer_out") &&
    row.counterpartyWalletType
  ) {
    return describeTransferWallet(row.walletType, row.counterpartyWalletType);
  }
  return describeWalletType(row.walletType);
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-right text-sm text-neutral-900 dark:text-neutral-100">
        {children}
      </span>
    </div>
  );
}

export function TransactionDetailModal({ row, nowMs, onClose }: Props) {
  if (!row) return null;

  return (
    <AtlasModalShell
      open={row !== null}
      onClose={onClose}
      title={row.description}
      description={row.kindLabel}
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
          <p
            className={
              "text-3xl font-semibold tracking-tight tabular-nums " +
              amountTone(row)
            }
          >
            {amountPrefix(row)}
            {formatCurrency(row.total ?? row.amount)}
          </p>
          {row.fee !== undefined && row.fee > 0 && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              incl. {formatCurrency(row.fee)} fee
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AtlasBadge variant={row.kindVariant}>{row.kindLabel}</AtlasBadge>
            {row.statusLabel && row.statusVariant && (
              <AtlasBadge variant={row.statusVariant}>
                {row.statusLabel}
              </AtlasBadge>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          <DetailRow label="When">
            <span className="block">
              {formatAbsolute(row.occurredAt)}
            </span>
            {nowMs && (
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                {formatRelative(row.occurredAt, nowMs)}
              </span>
            )}
          </DetailRow>
          <DetailRow label="Wallet">{walletLine(row)}</DetailRow>
          {row.detail && <DetailRow label="Detail">{row.detail}</DetailRow>}
          {row.relatedOrderNumber && (
            <DetailRow label="Order">
              <Link
                href={"/merchant/orders/" + row.relatedOrderId}
                className="text-brand-700 hover:underline dark:text-brand-300"
              >
                {row.relatedOrderNumber}
              </Link>
            </DetailRow>
          )}
          {row.relatedInvoiceNumber && (
            <DetailRow label="Invoice">{row.relatedInvoiceNumber}</DetailRow>
          )}
          {row.relatedSubscriptionId && (
            <DetailRow label="Subscription">
              {row.relatedSubscriptionId}
            </DetailRow>
          )}
          {row.ledgerEntryId && (
            <DetailRow label="Ledger entry">
              <span className="break-all font-mono text-xs">
                {row.ledgerEntryId}
              </span>
            </DetailRow>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {describeTransactionSource(row)}
          </p>
          <p className="mt-1 break-all font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            Source id: {row.sourceId}
          </p>
        </div>
      </div>
    </AtlasModalShell>
  );
}