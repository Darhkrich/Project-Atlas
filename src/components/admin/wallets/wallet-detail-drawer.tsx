/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  REGISTRY_POOL_LABELS,
  REGISTRY_POOL_VARIANTS,
  WALLET_STATUS_LABELS,
  WALLET_STATUS_VARIANTS,
} from "@/lib/admin/wallets/registry-labels";
import type { RegistryRow } from "@/lib/admin/wallets/registry-types";

interface Props {
  wallet: RegistryRow | null;
  nowMs: number | null;
  onClose: () => void;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-right text-sm text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}

function crossLinkFor(wallet: RegistryRow): { href: string; label: string } {
  if (wallet.pool === "customer") {
    return {
      href: "/admin/customers?q=" + encodeURIComponent(wallet.ownerId),
      label: "Open customer record",
    };
  }
  if (wallet.pool === "storefront_user") {
    return {
      href: "/admin/resellers/storefront-users?q=" + encodeURIComponent(wallet.ownerId),
      label: "Open storefront user",
    };
  }
  if (wallet.pool === "reseller") {
    return {
      href: "/admin/resellers?q=" + encodeURIComponent(wallet.ownerId),
      label: "Open reseller record",
    };
  }
  return {
    href: "/admin/ecommerce/merchants?q=" + encodeURIComponent(wallet.ownerId),
    label: "Open merchant record",
  };
}

export function WalletDetailDrawer({ wallet, nowMs, onClose }: Props) {
  if (!wallet) return null;

  const crossLink = crossLinkFor(wallet);

  return (
    <ModalShell
      open={wallet !== null}
      onClose={onClose}
      title="Wallet detail"
    >
      <div className="space-y-5">
        <section aria-label="Wallet">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={REGISTRY_POOL_VARIANTS[wallet.pool]}>
              {REGISTRY_POOL_LABELS[wallet.pool]}
            </Badge>
            <Badge variant={WALLET_STATUS_VARIANTS[wallet.status]}>
              {WALLET_STATUS_LABELS[wallet.status]}
            </Badge>
          </div>

          <div className="mt-3">
            <Row label="Owner" value={wallet.ownerName} />
            <Row
              label="Owner ID"
              value={
                <span className="font-mono text-xs">{wallet.ownerId}</span>
              }
            />
            <Row
              label="Wallet ID"
              value={<span className="font-mono text-xs">{wallet.id}</span>}
            />
            {wallet.storefrontName && (
              <Row label="Storefront" value={wallet.storefrontName} />
            )}
          </div>
        </section>

        <section aria-label="Balance">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Balance
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatCurrency(wallet.balance)}
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            This is a liability Atlas holds on behalf of the owner. Every
            movement is recorded in the owning pool's ledger.
          </p>
        </section>

        <section aria-label="Activity">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Activity
          </p>
          <div className="mt-2">
            <Row
              label="Last activity"
              value={
                wallet.lastActivityAt && nowMs
                  ? formatRelative(wallet.lastActivityAt, nowMs)
                  : wallet.lastActivityAt
                  ? formatAbsolute(wallet.lastActivityAt)
                  : "No activity recorded"
              }
            />
          </div>
        </section>

        <section
          aria-label="Cross links"
          className="flex flex-wrap gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
        >
          <Link href={crossLink.href} className="inline-flex">
            <Button variant="outline" size="sm">
              {crossLink.label}
            </Button>
          </Link>
          <Link
            href={"/admin/transactions?q=" + encodeURIComponent(wallet.ownerId)}
            className="inline-flex"
          >
            <Button variant="outline" size="sm">
              Wallet movements
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={onClose}
          >
            Close
          </Button>
        </section>

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Freeze, unfreeze, and balance adjustments live on the owning
          account's own drawer.
        </p>
      </div>
    </ModalShell>
  );
}