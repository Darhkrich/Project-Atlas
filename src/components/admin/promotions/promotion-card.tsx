/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import type {
  Promotion,
  PromotionStatus,
} from "@/lib/admin/types/promotion";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  MECHANIC_KIND_LABEL,
  MECHANIC_KIND_VARIANT,
  PROMOTION_AUDIENCE_HREF,
  PROMOTION_AUDIENCE_LABEL,
  PROMOTION_AUDIENCE_VARIANT,
  PROMOTION_SERVICE_LABEL,
  PROMOTION_STATUS_LABEL,
  PROMOTION_STATUS_VARIANT,
  PROMOTION_SURFACE_LABEL,
  mechanicSummary,
} from "@/lib/admin/promotions/promotion-labels";
import {
  conditionSummary,
  promotionStatus,
} from "@/lib/admin/promotions/promotion-projection";
import { promotionStatus as resellerBoostStatus } from "@/lib/admin/resellers/promotion-projection";

type PromotionCardSource =
  | { source: "general"; promotion: Promotion }
  | { source: "reseller"; promotion: ResellerPromotion };

interface PromotionCardProps {
  item: PromotionCardSource;
  onEdit?: () => void;
  onEnd?: () => void;
  onDelete?: () => void;
}

export function PromotionCard({
  item,
  onEdit,
  onEnd,
  onDelete,
}: PromotionCardProps) {
  if (item.source === "reseller") {
    return <ResellerBoostCard promotion={item.promotion} />;
  }
  return (
    <GeneralPromotionCard
      promotion={item.promotion}
      onEdit={onEdit}
      onEnd={onEnd}
      onDelete={onDelete}
    />
  );
}

/* ======================================================================
   General promotion
   ====================================================================== */

interface GeneralPromotionCardProps {
  promotion: Promotion;
  onEdit?: () => void;
  onEnd?: () => void;
  onDelete?: () => void;
}

function GeneralPromotionCard({
  promotion,
  onEdit,
  onEnd,
  onDelete,
}: GeneralPromotionCardProps) {
  const now = useNow();
  const nowMs = now ?? Date.now();
  const status: PromotionStatus = promotionStatus(promotion, nowMs);
  const isActive = status === "active";
  const isClosed = status === "expired" || status === "ended";

  const timeLabel = !now
    ? "—"
    : status === "scheduled"
    ? "Starts " + formatRelative(promotion.startDate, now)
    : status === "active"
    ? "Ends " + formatRelative(promotion.endDate, now)
    : status === "expired"
    ? "Ended " + formatRelative(promotion.endDate, now)
    : promotion.endedAt
    ? "Ended by admin " + formatRelative(promotion.endedAt, now)
    : "—";

  return (
    <Card className={cn(isClosed && "opacity-80")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">
            <span className="truncate">{promotion.name}</span>
          </CardTitle>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {promotion.id}
            {" · "}
            {timeLabel}
          </p>
        </div>
        <Badge
          variant={PROMOTION_STATUS_VARIANT[status]}
          size="sm"
          className="shrink-0"
        >
          {PROMOTION_STATUS_LABEL[status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {promotion.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={PROMOTION_AUDIENCE_HREF[promotion.audience]}
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={"View " + PROMOTION_AUDIENCE_LABEL[promotion.audience]}
          >
            <Badge
              variant={PROMOTION_AUDIENCE_VARIANT[promotion.audience]}
              size="sm"
            >
              {PROMOTION_AUDIENCE_LABEL[promotion.audience]}
            </Badge>
          </Link>
          <Badge
            variant={MECHANIC_KIND_VARIANT[promotion.mechanic.kind]}
            size="sm"
          >
            {MECHANIC_KIND_LABEL[promotion.mechanic.kind]}
          </Badge>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {mechanicSummary(promotion.mechanic)}
          </span>
        </div>

        <div className="rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">Conditions</p>
          <p className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
            {conditionSummary(promotion.conditions)}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
            Surfaces
          </p>
          <ul role="list" className="flex flex-wrap gap-1">
            {promotion.surfaces.map((s) => (
              <li key={s}>
                <Badge variant="neutral" size="sm">
                  {PROMOTION_SURFACE_LABEL[s]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {promotion.conditions.serviceScope &&
          promotion.conditions.serviceScope.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                Applies to services
              </p>
              <ul role="list" className="flex flex-wrap gap-1">
                {promotion.conditions.serviceScope.map((s) => (
                  <li key={s}>
                    <Badge variant="neutral" size="sm">
                      {PROMOTION_SERVICE_LABEL[s]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <p title={formatDateTime(promotion.startDate)}>
            {formatDate(promotion.startDate)} →{" "}
            {formatDate(promotion.endDate)}
          </p>
          <p className="mt-0.5">Created by {promotion.createdBy}</p>
        </div>

        {promotion.endedReason && (
          <p className="rounded-md bg-neutral-100 p-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            End reason: {promotion.endedReason}
          </p>
        )}

        <Can permission={PERMISSIONS.PROMOTIONS_MANAGE}>
          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            {!isClosed && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                aria-label={"Edit " + promotion.name}
              >
                Edit
              </Button>
            )}
            {isActive && onEnd && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEnd}
                aria-label={"End " + promotion.name}
              >
                <AtlasIcon
                  name="x-circle"
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5"
                />
                End early
              </Button>
            )}
            {isClosed && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger-600"
                onClick={onDelete}
                aria-label={"Delete " + promotion.name}
              >
                Delete
              </Button>
            )}
          </div>
        </Can>
      </CardContent>
    </Card>
  );
}

/* ======================================================================
   Reseller boost (read-only)
   ====================================================================== */

function ResellerBoostCard({
  promotion,
}: {
  promotion: ResellerPromotion;
}) {
  const now = useNow();
  const nowMs = now ?? Date.now();
  const status = resellerBoostStatus(promotion, nowMs);
  const isClosed = status === "expired" || status === "ended";

  const timeLabel = !now
    ? "—"
    : status === "scheduled"
    ? "Starts " + formatRelative(promotion.startDate, now)
    : status === "active"
    ? "Ends " + formatRelative(promotion.endDate, now)
    : status === "expired"
    ? "Ended " + formatRelative(promotion.endDate, now)
    : "—";

  return (
    <Card className={cn("opacity-90", isClosed && "opacity-70")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">
            <span className="truncate">{promotion.name}</span>
          </CardTitle>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {promotion.id}
            {" · "}
            {timeLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <Badge variant="info" size="sm">
            Reseller boost
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {promotion.description}
        </p>

        <div className="rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">Boost</p>
          <p className="mt-0.5 font-semibold text-neutral-800 dark:text-neutral-200">
            +{promotion.boostPercentPoints}pp to base commission rate
          </p>
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <p title={formatDateTime(promotion.startDate)}>
            {formatDate(promotion.startDate)} →{" "}
            {formatDate(promotion.endDate)}
          </p>
          <p className="mt-0.5">Created by {promotion.createdBy}</p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <Link
            href="/admin/resellers/promotions"
            className={cn(
              "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium",
              "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              "dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            )}
          >
            <AtlasIcon
              name="edit"
              aria-hidden="true"
              className="mr-1 h-3.5 w-3.5"
            />
            Edit on reseller promotions
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}