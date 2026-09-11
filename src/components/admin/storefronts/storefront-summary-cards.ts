"use client";

import * as React from "react";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { UnifiedStorefront } from "@/lib/admin/types/storefront";

interface StorefrontSummaryCardsProps {
  storefronts: UnifiedStorefront[];
  onFilterAll?: () => void;
  onFilterReseller?: () => void;
  onFilterMerchant?: () => void;
  onFilterDisabled?: () => void;
}

export function StorefrontSummaryCards({
  storefronts,
  onFilterAll,
  onFilterReseller,
  onFilterMerchant,
  onFilterDisabled,
}: StorefrontSummaryCardsProps) {
  const total = storefronts.length;
  const resellers = storefronts.filter((s) => s.type === "reseller").length;
  const merchants = storefronts.filter((s) => s.type === "merchant").length;
  const disabled = storefronts.filter((s) => s.status === "disabled").length;
  const totalUsers = storefronts.reduce((sum, s) => sum + s.usersCount, 0);

  const cards: {
    label: string;
    value: number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Storefronts",
      value: total,
      sub: `${totalUsers.toLocaleString()} total users`,
      icon: "store",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Reseller Storefronts",
      value: resellers,
      sub: "Digital services",
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterReseller,
    },
    {
      label: "Merchant Storefronts",
      value: merchants,
      sub: "E‑commerce",
      icon: "briefcase",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterMerchant,
    },
    {
      label: "Disabled",
      value: disabled,
      sub: "Not live",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      onClick: onFilterDisabled,
    },
  ];

  return React.createElement(
    "div",
    { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" },
    cards.map((card) =>
      React.createElement(
        Card,
        {
          key: card.label,
          onClick: card.onClick,
          className: cn(
            "border-0 shadow-sm transition-all hover:shadow-md",
            card.bg,
            card.onClick && "cursor-pointer"
          ),
        },
        React.createElement(
          "div",
          { className: "p-4" },
          React.createElement(
            "div",
            { className: "flex items-center justify-between" },
            React.createElement(
              "p",
              { className: "text-xs font-medium text-neutral-500 dark:text-neutral-400" },
              card.label
            ),
            React.createElement(AtlasIcon, {
              name: card.icon,
              className: cn("h-4 w-4", card.color),
            })
          ),
          React.createElement(
            "p",
            { className: "mt-2 text-2xl font-bold" },
            card.value
          ),
          React.createElement("p", { className: "text-xs text-neutral-500" }, card.sub)
        )
      )
    )
  );
}