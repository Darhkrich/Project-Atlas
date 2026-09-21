"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { PaymentMethod } from "@/lib/payment-methods";

interface Props {
  methods: PaymentMethod[];
  disabled?: boolean;
  onSelect: (method: PaymentMethod) => void;
}

export function WalletFundingMethods({
  methods,
  disabled,
  onSelect,
}: Props) {
  return (
    <section aria-labelledby="funding-methods-heading">
      <h2
        id="funding-methods-heading"
        className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Add money to your wallet
      </h2>
      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {methods.map((method) => (
          <li key={method.id}>
            <button
              type="button"
              onClick={() => onSelect(method)}
              disabled={disabled}
              aria-label={"Fund with " + method.name}
              className="group h-full w-full rounded-xl border border-neutral-200 bg-white p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div
                className={
                  "mb-3 flex h-12 w-12 items-center justify-center rounded-full " +
                  method.bgClass
                }
              >
                <AtlasIcon
                  name={method.icon}
                  className="h-6 w-6 text-neutral-700 dark:text-neutral-200"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {method.name}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {method.description}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}