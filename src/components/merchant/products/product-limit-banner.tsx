"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  PRODUCT_LIMIT_AT_TITLE,
  PRODUCT_LIMIT_MANAGE_CTA,
  PRODUCT_LIMIT_NEAR_TITLE,
  PRODUCT_LIMIT_UNRESOLVED_BODY,
  PRODUCT_LIMIT_UNRESOLVED_TITLE,
  PRODUCT_LIMIT_UPGRADE_CTA,
} from "@/lib/merchant/products/labels";
import type { ProductLimitEvaluation } from "@/lib/merchant/products/limits";

interface ProductLimitBannerProps {
  evaluation: ProductLimitEvaluation;
}

type Variant = "none" | "warning" | "danger" | "info";

function variantFor(evaluation: ProductLimitEvaluation): Variant {
  if (!evaluation.isResolved) return "info";
  if (evaluation.isUnlimited) return "none";
  if (evaluation.atLimit) return "danger";
  if (evaluation.nearLimit) return "warning";
  return "none";
}

function bannerClass(variant: Variant): string {
  switch (variant) {
    case "warning":
      return "border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-100";
    case "danger":
      return "border-danger-200 bg-danger-50 text-danger-900 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-100";
    case "info":
      return "border-info-200 bg-info-50 text-info-900 dark:border-info-900 dark:bg-info-900/20 dark:text-info-100";
    default:
      return "";
  }
}

function iconClass(variant: Variant): string {
  if (variant === "danger") return "text-danger-600 dark:text-danger-400";
  if (variant === "warning") return "text-warning-600 dark:text-warning-400";
  return "text-info-600 dark:text-info-400";
}

export function ProductLimitBanner({
  evaluation,
}: ProductLimitBannerProps) {
  const variant = variantFor(evaluation);
  if (variant === "none") return null;

  const ctaLabel = evaluation.atLimit
    ? PRODUCT_LIMIT_UPGRADE_CTA
    : PRODUCT_LIMIT_MANAGE_CTA;

  return (
    <section
      role="status"
      aria-label="Product plan limit"
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        bannerClass(variant)
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AtlasIcon
          name="alert"
          className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass(variant))}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {!evaluation.isResolved
              ? PRODUCT_LIMIT_UNRESOLVED_TITLE
              : evaluation.atLimit
              ? PRODUCT_LIMIT_AT_TITLE
              : PRODUCT_LIMIT_NEAR_TITLE}
          </p>
          <p className="mt-0.5 text-xs opacity-90">
            {!evaluation.isResolved ? (
              PRODUCT_LIMIT_UNRESOLVED_BODY
            ) : (
              <>
                {evaluation.currentCount}
                {" of "}
                {evaluation.maxProducts === "unlimited"
                  ? "\u221E"
                  : evaluation.maxProducts}
                {" products on the "}
                {evaluation.planName ?? evaluation.planId}
                {" plan. "}
                {evaluation.remaining !== null && evaluation.remaining > 0
                  ? String(evaluation.remaining) + " more available."
                  : "Upgrade to add more."}
              </>
            )}
          </p>
        </div>
      </div>
      {evaluation.isResolved && (
        <Link
          href="/merchant/billing"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
            evaluation.atLimit
              ? "bg-danger-600 text-white hover:bg-danger-700"
              : "border border-current bg-transparent hover:bg-white/40 dark:hover:bg-black/20"
          )}
        >
          {ctaLabel}
          <AtlasIcon
            name="chevron-right"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </section>
  );
}