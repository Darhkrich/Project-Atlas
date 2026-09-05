/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { resolveFeaturedServices, getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";
import { StorefrontServiceCard } from "./storefront-service-card";
import { StorefrontPartnerLogos } from "./storefront-partner-logos";

import { StorefrontQuickBuy } from "./storefront-quick-buy";
import { StorefrontPurchaseFlow } from "./storefront-purchase-flow";

interface StorefrontServicesProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontServices({ config, mode }: StorefrontServicesProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [showPurchase, setShowPurchase] = useState(false);

  const featuredServices = resolveFeaturedServices(config);
  const theme = getThemeClasses(config.appearance.themeId);

  const handleServiceClick = (serviceId: string, network?: string) => {
    setSelectedServiceId(serviceId);
    setSelectedNetwork(network);
    setSelectedPlanId(undefined);
    setShowPurchase(true);
  };

  const handleQuickBuySelect = (network: string, planId: string) => {
    setSelectedServiceId("data");
    setSelectedNetwork(network);
    setSelectedPlanId(planId);
    setShowPurchase(true);
  };

  const handleClosePurchase = () => {
    setShowPurchase(false);
    setSelectedServiceId(null);
    setSelectedNetwork(undefined);
    setSelectedPlanId(undefined);
  };

  if (!config.services.enabled) return null;

  return (
    <div id="services">
      <StorefrontPartnerLogos config={config} onServiceClick={handleServiceClick} />
      <StorefrontQuickBuy config={config} onSelectPlan={handleQuickBuySelect} />

      {featuredServices.length > 0 && (
        <section className={`py-12 ${theme.sectionBg}`}>
          <div className={`${theme.container} mx-auto px-4`}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-neutral-900">Popular Services</h2>
              <p className="mt-2 text-neutral-600">Select a service to get started</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredServices.map((service) => (
                <StorefrontServiceCard
                  key={service.id}
                  service={service}
                  config={config}
                  onClick={() => handleServiceClick(service.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {showPurchase && selectedServiceId && (
        <StorefrontPurchaseFlow
          serviceId={selectedServiceId}
          initialNetwork={selectedNetwork}
          initialPlanId={selectedPlanId}
          config={config}
          onClose={handleClosePurchase}
          onComplete={(order) => console.log("Storefront order:", order)}
        />
      )}
    </div>
  );
}