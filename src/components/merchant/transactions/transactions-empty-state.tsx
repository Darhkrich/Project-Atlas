"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";

interface Props {
  variant: "no_data" | "no_match";
  onClear?: () => void;
}

export function TransactionsEmptyState({ variant, onClear }: Props) {
  if (variant === "no_match") {
    return (
      <AtlasCard>
        <div className="px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <AtlasIcon
              name="search"
              className="h-5 w-5 text-neutral-500"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No transactions match these filters
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Try a different wallet, kind, or date range.
          </p>
          {onClear && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </AtlasCard>
    );
  }

  return (
    <AtlasCard>
      <div className="px-6 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="transactions"
            className="h-5 w-5 text-neutral-500"
            aria-hidden="true"
          />
        </div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Nothing has moved yet
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Funding, customer payments, plan charges, refunds, and payouts will
          show up here.
        </p>
      </div>
    </AtlasCard>
  );
}