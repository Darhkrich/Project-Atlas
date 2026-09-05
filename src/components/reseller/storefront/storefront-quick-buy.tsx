"use client";

import { useState } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { servicesCategories } from "@/lib/services-page-data";
import {
  getBrandingStyle,
  getThemeClasses,
  getSellingPrice,
  networkMeta,
} from "@/lib/storefront/utils";

interface StorefrontQuickBuyProps {
  config: StorefrontConfig;
  onSelectPlan: (network: string, planId: string) => void;
}

const networks = ["MTN", "Telecel", "AirtelTigo"];

export function StorefrontQuickBuy({ config, onSelectPlan }: StorefrontQuickBuyProps) {
  const [activeNetwork, setActiveNetwork] = useState("MTN");
  const [visiblePlans, setVisiblePlans] = useState(6);

  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  const dataCategory = servicesCategories.find((cat) => cat.id === "data");
  if (!dataCategory?.formConfig?.networkPlanCategories) return null;

  const networkPlans = dataCategory.formConfig.networkPlanCategories[activeNetwork] || [];
  const allPlans = networkPlans.flatMap((cat) => cat.plans);
  const displayedPlans = allPlans.slice(0, visiblePlans);
  const hasMore = visiblePlans < allPlans.length;

  return (
    <section className={`py-10 ${theme.quickBuyBg}`}>
      <div className={`${theme.container} mx-auto px-4`} style={brandingStyle}>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quick Buy Data</h2>
        <p className="text-neutral-600 mb-6">Choose your network and select a bundle</p>

        {/* Network tabs */}
        <div className="flex gap-3 mb-6">
          {networks.map((network) => {
            const isActive = activeNetwork === network;
            return (
              <button
                key={network}
                onClick={() => {
                  setActiveNetwork(network);
                  setVisiblePlans(6);
                }}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition ${
                  isActive
                    ? "text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
                style={isActive ? { backgroundColor: "var(--primary)" } : undefined}
              >
                {network} Data
              </button>
            );
          })}
        </div>

        {/* Plans grid: 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {displayedPlans.map((plan) => {
            const meta = networkMeta[activeNetwork];
            const price = getSellingPrice(plan.price, config, "data");
            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(activeNetwork, plan.id)}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-sm text-left"
              >
                <div className={`flex items-center justify-between px-2 py-1.5 ${meta.color} ${meta.headerText}`}>
                  <span className="text-[10px] font-semibold truncate">Data Bundle</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[9px] font-medium text-white">
                    {plan.description || "Bundle"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-2.5">
                  <div>
                    <span className="text-[10px] text-neutral-500">Data</span>
                    <span className="block text-sm sm:text-base font-bold text-neutral-900">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500">Cost</span>
                    <span className="block text-sm sm:text-base font-bold text-neutral-900">
                      GH₵{price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisiblePlans((prev) => prev + 6)}
              className="px-6 py-2 rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}