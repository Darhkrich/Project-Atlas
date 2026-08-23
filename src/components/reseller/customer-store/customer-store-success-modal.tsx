"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";

type Props = {
  open: boolean;
  orderNumber: string;
  onClose: () => void;
};

export function CustomerStoreSuccessModal({
  open,
  orderNumber,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close success dialog"
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-success-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-neutral-950"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-300">
          <AtlasIcon name="check" className="h-7 w-7" />
        </div>

        <h2
          id="purchase-success-title"
          className="mt-5 text-xl font-bold text-neutral-950 dark:text-white"
        >
          Purchase successful
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          Your order has been received successfully. Your service will be
          delivered according to the selected product.
        </p>

        <div className="mt-5 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Order Number
          </p>

          <p className="mt-1 font-mono text-sm font-bold text-neutral-950 dark:text-white">
            {orderNumber}
          </p>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Continue Shopping
          </button>

          <Link
            href="/reseller/customer-store"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
          >
            Done
            <AtlasIcon name="check" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}