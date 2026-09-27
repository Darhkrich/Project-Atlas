"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { MOCK_BANNER_TEXT } from "@/lib/domains/treasury/constants";

export function TreasuryMockBanner() {
  return (
    <div
      role="alert"
      aria-label="Treasury mock warning"
      className="flex items-start gap-3 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3 dark:border-warning-800 dark:bg-warning-900/20"
    >
      <AtlasIcon
        name="alert"
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-warning-600 dark:text-warning-300"
      />
      <div>
        <p className="text-sm font-semibold text-warning-800 dark:text-warning-200">
          Mock treasury
        </p>
        <p className="text-xs text-warning-800/80 dark:text-warning-200/80">
          {MOCK_BANNER_TEXT}
        </p>
      </div>
    </div>
  );
}