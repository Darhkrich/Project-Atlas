"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface PlanFeatureProps {
  label: string;
}

export function PlanFeature({ label }: PlanFeatureProps) {
  return (
    <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
      <AtlasIcon
        name="check"
        aria-hidden="true"
        className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500"
      />
      <span>{label}</span>
    </li>
  );
}