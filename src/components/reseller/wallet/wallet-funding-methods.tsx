"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { PaymentMethod } from "@/lib/payment-methods";

interface Props {
  methods: PaymentMethod[];
  disabled?: boolean;
  onSelect: (method: PaymentMethod) => void;
}

export function WalletFundingMethods({ methods, disabled, onSelect }: Props) {
  return (
    <section aria-labelledby="reseller-funding-methods-heading">
      <h2
        id="reseller-funding-methods-heading"
        className="mb-4 text-lg font-semibold text-neutral-950 dark:text-white"
      >
        Fund your wallet
      </h2>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => (
          <li key={method.id}>
            <button
              type="button"
              onClick={() => onSelect(method)}
              disabled={disabled}
              aria-label={"Fund with " + method.name}
              className="group h-full w-full rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
            >
              <div
                className={
                  "mb-4 flex h-11 w-11 items-center justify-center rounded-xl " +
                  method.bgClass
                }
              >
                <AtlasIcon
                  name={method.icon}
                  className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                  {method.name}
                </h3>
                <AtlasIcon
                  name="arrow-right"
                  className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700 dark:text-neutral-500"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {method.description}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}