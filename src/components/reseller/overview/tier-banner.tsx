"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { SECTION_LABELS, TIER_BANNER_COPY } from "@/lib/reseller/overview/labels";
import type { ResellerTierView } from "@/lib/reseller/overview/types";

interface TierBannerProps {
  tier: ResellerTierView | null;
}

export function TierBanner({ tier }: TierBannerProps) {
  if (!tier) return null;

  const nextName = tier.nextTierName;
  const nextRate = tier.nextTierRate;
  const nextCut = tier.nextExtraCutPercent;
  const hasNext = nextName !== null && nextRate !== null;
  const rateBumped = nextRate !== null && nextRate > tier.currentTierRate;
  const cutImproved =
    nextCut !== null && nextCut < tier.currentExtraCutPercent;
  const hasPerks = hasNext && tier.nextTierPerks.length > 0;
  const hasUnlockSection = hasNext && (rateBumped || cutImproved || hasPerks);
  const remaining = hasNext
    ? Math.max(tier.thresholdValue - tier.currentValue, 0)
    : 0;
  const progress = Math.min(Math.max(tier.progressPercent, 0), 100);

  return (
    <section
      aria-labelledby="tier-banner-heading"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
        <h2
          id="tier-banner-heading"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          {SECTION_LABELS.tier}
        </h2>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
          >
            <AtlasIcon name="sparkles" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {TIER_BANNER_COPY.currentLabel}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {tier.currentTierName}
              <span className="ml-1.5 text-xs font-normal text-neutral-500">
                {String(tier.currentTierRate) +
                  TIER_BANNER_COPY.commissionSuffix}
              </span>
            </p>
          </div>
        </div>

        {hasNext ? (
          <>
            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={"Progress to " + (nextName ?? "")}
            >
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: String(progress) + "%" }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
              {TIER_BANNER_COPY.progressPrefix}
              {formatCurrency(remaining)}
              {TIER_BANNER_COPY.progressMiddle}
              {tier.metricLabel}
              {TIER_BANNER_COPY.progressSuffix}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {nextName}
              </span>
            </p>
          </>
        ) : (
          <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
            {TIER_BANNER_COPY.topTierMessage}
          </p>
        )}

        {hasUnlockSection ? (
          <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {TIER_BANNER_COPY.nextTierHeading}
            </p>
            <ul role="list" className="mt-3 space-y-2">
              {rateBumped && nextRate !== null ? (
                <UnlockRow
                  label={TIER_BANNER_COPY.rateRowLabel}
                  value={
                    String(tier.currentTierRate) +
                    "% " +
                    TIER_BANNER_COPY.rateRowArrow +
                    " " +
                    String(nextRate) +
                    "%"
                  }
                />
              ) : null}
              {cutImproved && nextCut !== null ? (
                <UnlockRow
                  label={TIER_BANNER_COPY.extraCutRowLabel}
                  value={
                    String(tier.currentExtraCutPercent) +
                    "% " +
                    TIER_BANNER_COPY.rateRowArrow +
                    " " +
                    String(nextCut) +
                    "%"
                  }
                />
              ) : null}
              {hasPerks
                ? tier.nextTierPerks.map((perk) => (
                    <UnlockRow key={perk} label={perk} value={null} />
                  ))
                : null}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function UnlockRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      >
        <AtlasIcon name="check" className="h-3 w-3" />
      </span>
      <span className="min-w-0 flex-1 text-xs text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      {value ? (
        <span className="ml-2 shrink-0 text-xs font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {value}
        </span>
      ) : null}
    </li>
  );
}