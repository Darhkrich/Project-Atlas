"use client";

import Link from "next/link";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { WALLET_COPY } from "@/lib/reseller/overview/labels";
import type {
  ActionQueueItem,
  ActionQueueKind,
  ActionQueueTone,
} from "@/lib/reseller/overview/types";

interface ActionQueueProps {
  items: ActionQueueItem[];
}

function iconFor(kind: ActionQueueKind): AtlasIconName {
  if (kind === "verification") return "shield";
  if (kind === "failed_orders") return "x-circle";
  if (kind === "pending_withdrawals") return "clock";
  if (kind === "unpublished_storefront") return "store";
  return "settings";
}

function toneClasses(tone: ActionQueueTone): string {
  if (tone === "danger") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300";
  }
  if (tone === "warning") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
  }
  return "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300";
}

export function ActionQueue({ items }: ActionQueueProps) {
  if (items.length === 0) return null;
  return (
    <>
      {items.map((item) => (
        <ActionCard key={item.id} item={item} />
      ))}
    </>
  );
}

function ActionCard({ item }: { item: ActionQueueItem }) {
  return (
    <Link
      href={item.href}
      className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 sm:p-5"
    >
      <span
        aria-hidden="true"
        className={
          "flex h-10 w-10 items-center justify-center rounded-full " +
          toneClasses(item.tone)
        }
      >
        <AtlasIcon name={iconFor(item.kind)} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {item.headline}
      </p>
      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
        {item.body}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-300">
        {WALLET_COPY.reviewAction}
        <AtlasIcon
          name="arrow-right"
          className="h-3 w-3"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}