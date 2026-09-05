/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasAlert } from "@/components/atlas/alert";
import { servicesCategories } from "@/lib/services-page-data";
import { useStorefront } from "@/contexts/storefront-context";
import { getSellingPrice } from "@/lib/storefront/utils";

export function ResellerServicesManager() {
  const { config, updateConfig, saveConfig } = useStorefront();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [saveAlert, setSaveAlert] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const services = useMemo(() => {
    return servicesCategories.filter((cat) => cat.available);
  }, []);

  const toggleService = (serviceId: string) => {
    const currentFeatured = config.services.featured;
    const isEnabled = currentFeatured.includes(serviceId);
    const updated = isEnabled
      ? currentFeatured.filter((id) => id !== serviceId)
      : [...currentFeatured, serviceId];

    updateConfig({
      services: { ...config.services, featured: updated },
    });
    setSaveAlert(null);
  };

  const updateMarkup = (serviceId: string, value: string) => {
    const markup = parseFloat(value);
    if (isNaN(markup) || markup < 0 || markup > config.pricing.maxMarkupPercent) {
      return;
    }
    const overrides = {
      ...(config.pricing.serviceOverrides || {}),
      [serviceId]: markup,
    };
    updateConfig({
      pricing: { ...config.pricing, serviceOverrides: overrides },
    });
    setSaveAlert(null);
  };

  const resetMarkup = (serviceId: string) => {
    const overrides = { ...(config.pricing.serviceOverrides || {}) };
    delete overrides[serviceId];
    updateConfig({
      pricing: { ...config.pricing, serviceOverrides: overrides },
    });
    setSaveAlert(null);
  };

  const handleSave = (serviceId?: string) => {
    setSavingServiceId(serviceId || "all");
    const result = saveConfig();
    setTimeout(() => {
      setSavingServiceId(null);
      setSaveAlert({
        type: result.success ? "success" : "danger",
        message: result.success
          ? "Service changes saved successfully."
          : "Could not save changes. Please review and try again.",
      });
    }, 600);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <AtlasSkeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={() => setLoading(true)} />;
  }

  return (
    <div className="space-y-6">
      {saveAlert && <AtlasAlert variant={saveAlert.type}>{saveAlert.message}</AtlasAlert>}

      <div className="grid gap-4">
        {services.map((service) => {
          const isEnabled = config.services.featured.includes(service.id);
          const markup =
            config.pricing.serviceOverrides?.[service.id] ??
            config.pricing.markupPercent;

          return (
            <AtlasCard key={service.id} className="overflow-hidden">
              {/* Service header */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedServiceId((prev) =>
                      prev === service.id ? null : service.id
                    )
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                    <AtlasIcon name={service.icon as AtlasIconName} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-neutral-950 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {service.description}
                    </p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <AtlasBadge variant={isEnabled ? "success" : "neutral"}>
                    {isEnabled ? "ON" : "OFF"}
                  </AtlasBadge>
                  <button
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? "bg-brand-800" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                    aria-label={`Toggle ${service.name}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedServiceId === service.id && (
                <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Pricing Markup
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Markup Percentage (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={config.pricing.maxMarkupPercent}
                          value={markup}
                          onChange={(e) => updateMarkup(service.id, e.target.value)}
                          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                      {config.pricing.serviceOverrides?.[service.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetMarkup(service.id)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Example: If {service.name} base price is GH₵5.00, with{" "}
                        {markup}% markup, customer pays GH₵
                        {(5 * (1 + markup / 100)).toFixed(2)}.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => handleSave(service.id)}
                      loading={savingServiceId === service.id}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </AtlasCard>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave()} loading={savingServiceId === "all"}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
}