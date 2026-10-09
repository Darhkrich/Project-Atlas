"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { SECTION_LABELS } from "@/lib/reseller/overview/labels";

interface QuickSellStripProps {
  onSelect: (serviceId: string) => void;
}

interface QuickSellOption {
  serviceId: string;
  label: string;
  icon: AtlasIconName;
}

const OPTIONS: QuickSellOption[] = [
  { serviceId: "airtime", label: "Airtime", icon: "phone" },
  { serviceId: "data", label: "Data", icon: "globe" },
  { serviceId: "electricity", label: "Electricity", icon: "zap" },
  { serviceId: "cabletv", label: "Cable TV", icon: "tv" },
  { serviceId: "internet", label: "Internet", icon: "home" },
  { serviceId: "exampins", label: "Exam pins", icon: "graduation" },
  { serviceId: "billpayments", label: "Bills", icon: "receipt" },
  { serviceId: "giftcards", label: "Gift cards", icon: "sparkles" },
];

export function QuickSellStrip({ onSelect }: QuickSellStripProps) {
  return (
    <section aria-labelledby="quick-sell-heading">
      <h2
        id="quick-sell-heading"
        className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500"
      >
        {SECTION_LABELS.quickSell}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {OPTIONS.map((option) => (
          <button
            key={option.serviceId}
            type="button"
            onClick={() => onSelect(option.serviceId)}
            className="group flex flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <AtlasIcon name={option.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}