"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantSavedPaymentMethod } from "@/lib/merchant/types/wallet";

interface Props {
  savedMethods: MerchantSavedPaymentMethod[];
  supportedMethodsCount: number;
}

const METHOD_ICON: Record<string, "mobile" | "card" | "bank" | "wallet"> = {
  momo: "mobile",
  card: "card",
  bank: "bank",
  wallet: "wallet",
};

export function BillingSavedMethodsCard({
  savedMethods,
  supportedMethodsCount,
}: Props) {
  return (
    <AtlasCard>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
            Payment methods
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Methods Atlas can charge at renewal.
          </p>
        </div>
        <Link
          href="/merchant/wallet"
          className="shrink-0 text-xs font-semibold text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
        >
          Manage in wallet
        </Link>
      </div>

      {savedMethods.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-neutral-200 p-4 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No saved methods yet. Add one from the wallet page.
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            Your plan supports {supportedMethodsCount} method
            {supportedMethodsCount === 1 ? "" : "s"}.
          </p>
        </div>
      ) : (
        <ul role="list" className="mt-4 space-y-2">
          {savedMethods.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <AtlasIcon
                  name={METHOD_ICON[m.methodId] ?? "wallet"}
                  className="h-4 w-4 text-neutral-600 dark:text-neutral-300"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {m.label}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {m.provider} {m.maskedLabel}
                </p>
              </div>
              {m.isDefault && (
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-800">
                  Default
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[11px] text-neutral-500 dark:text-neutral-500">
        Plan supports {supportedMethodsCount} method
        {supportedMethodsCount === 1 ? "" : "s"}.
      </p>
    </AtlasCard>
  );
}