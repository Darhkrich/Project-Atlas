/* eslint-disable react-hooks/purity */
"use client";

import type { CurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { OVERVIEW_COPY } from "@/lib/reseller/overview/labels";

interface GreetingRibbonProps {
  reseller: CurrentReseller;
  subtitle: string;
}

function greetingFor(nowMs: number): string {
  const hour = new Date(nowMs).getHours();
  if (hour < 12) return OVERVIEW_COPY.greetingMorning;
  if (hour < 17) return OVERVIEW_COPY.greetingAfternoon;
  return OVERVIEW_COPY.greetingEvening;
}

export function GreetingRibbon({ reseller, subtitle }: GreetingRibbonProps) {
  const nowMs = Date.now();
  const firstName = reseller.name.trim().split(/\s+/)[0] || reseller.name;
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {greetingFor(nowMs)}, {firstName}
      </h1>
      <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
        {subtitle}
      </p>
    </header>
  );
}