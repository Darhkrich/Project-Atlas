/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import type {
  PromotionStatus,
  ResellerPromotion,
} from "@/lib/admin/types/reseller-promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import type { Reseller } from "@/lib/admin/types/reseller";
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
  PROMOTION_SCOPE_LABEL,
  PROMOTION_STATUS_LABEL,
  PROMOTION_STATUS_VARIANT,
  SERVICE_CATEGORY_LABEL,
} from "@/lib/admin/resellers/promotion-labels";
import {
  affectedServices,
  promotionStatus,
} from "@/lib/admin/resellers/promotion-projection";

interface PromotionCardProps {
  promotion: ResellerPromotion;
  tiers: ResellerTier[];
  resellers: Reseller[];
  onEdit: () => void;
  onEnd: () => void;
  onDelete: () => void;
}

export function PromotionCard({
  promotion,
  tiers,
  resellers,
  onEdit,
  onEnd,
  onDelete,
}: PromotionCardProps) {
  const now = useNow();
  const nowMs = now ?? Date.now();
  const status: PromotionStatus = promotionStatus(promotion, nowMs);
  const services = affectedServices(promotion);

  const targetTier =
    promotion.scope === "tier" && promotion.tierId
      ? tiers.find((t) => t.id === promotion.tierId)
      : undefined;

  const affectedResellerCount =
    promotion.scope === "resellers"
      ? (promotion.resellerIds ?? []).length
      : promotion.scope === "all" || promotion.scope === "service"
      ? resellers.length
      : promotion.scope === "tier"
      ? resellers.filter((r) => r.tierId === promotion.tierId).length
      : 0;

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

        <div className="rounded-md border border-neutral-100 p-2 text-sm dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Boost
            </span>
            <span className="font-semibold">
              +{promotion.boostPercentPoints}pp
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
            Percentage-point addition to base rate
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Scope</dt>
            <dd className="font-medium">
              {PROMOTION_SCOPE_LABEL[promotion.scope]}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">
              Resellers
            </dt>
            <dd className="font-medium">{affectedResellerCount}</dd>
          </div>
          <div className="col-span-2 flex items-center justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">
              Services
            </dt>
            <dd className="text-right text-xs">
              {services.length === 6
                ? "All"
                : services
                    .map((s) => SERVICE_CATEGORY_LABEL[s])
                    .join(", ")}
            </dd>
          </div>
          {targetTier && (
            <div className="col-span-2 flex items-center justify-between">
              <dt className="text-neutral-500 dark:text-neutral-400">Tier</dt>
              <dd>
                <Link
                  href={"/admin/resellers/tiers"}
                  className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                >
                  {targetTier.name}
                </Link>
              </dd>
            </div>
          )}
        </dl>

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

        <Can permission={PERMISSIONS.RESELLERS_PROMOTIONS_MANAGE}>
          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            {!isClosed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                aria-label={"Edit " + promotion.name}
              >
                Edit
              </Button>
            )}
            {isActive && (
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
            {isClosed && (
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