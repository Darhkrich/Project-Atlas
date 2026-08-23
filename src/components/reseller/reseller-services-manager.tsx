"use client";

import { useEffect, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasAlert } from "@/components/atlas/alert";
import {
  mockResellerServices,
  type ResellerService,
} from "@/lib/mock-data";

export function ResellerServicesManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState<ResellerService[]>([]);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [saveAlert, setSaveAlert] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      setError(false);

      setTimeout(() => {
        setServices(mockResellerServices);
        setLoading(false);
      }, 700);
    };

    loadData();
  }, []);

  const toggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, enabled: !service.enabled }
          : service,
      ),
    );
    setSaveAlert(null);
  };

  const toggleProduct = (serviceId: string, productId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              products: service.products.map((product) =>
                product.id === productId
                  ? { ...product, enabled: !product.enabled }
                  : product,
              ),
            }
          : service,
      ),
    );
    setSaveAlert(null);
  };

  const updateSellingPrice = (
    serviceId: string,
    productId: string,
    value: string,
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              products: service.products.map((product) =>
                product.id === productId
                  ? { ...product, sellingPrice: value }
                  : product,
              ),
            }
          : service,
      ),
    );
    setSaveAlert(null);
  };

  const saveService = (serviceId: string) => {
    setSavingServiceId(serviceId);
    setTimeout(() => {
      setSavingServiceId(null);
      setSaveAlert({
        type: "success",
        message: "Service changes saved successfully.",
      });
    }, 800);
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
    return (
      <AtlasErrorState onRetry={() => setLoading(true)} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Save alert */}
      {saveAlert && (
        <AtlasAlert variant={saveAlert.type}>
          {saveAlert.message}
        </AtlasAlert>
      )}

      {/* Services list */}
      <div className="grid gap-4">
        {services.map((service) => (
          <AtlasCard key={service.id} className="overflow-hidden">
            {/* Service header */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setExpandedServiceId((prev) =>
                    prev === service.id ? null : service.id,
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  <AtlasIcon name={service.icon} className="h-5 w-5" />
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
                <AtlasBadge variant={service.enabled ? "success" : "neutral"}>
                  {service.enabled ? "ON" : "OFF"}
                </AtlasBadge>
                <button
                  onClick={() => toggleService(service.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    service.enabled ? "bg-brand-800" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  aria-label={`Toggle ${service.name}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      service.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded product list */}
            {expandedServiceId === service.id && (
              <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Products
                </h4>
                <div className="space-y-3">
                  {service.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            Atlas Price: {product.atlasPrice} • Margin: {product.margin}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleProduct(service.id, product.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.enabled ? "bg-brand-800" : "bg-neutral-300 dark:bg-neutral-700"
                          }`}
                          aria-label={`Toggle ${product.name}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1">
                          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Selling Price
                          </label>
                          <input
                            type="text"
                            value={product.sellingPrice}
                            onChange={(e) =>
                              updateSellingPrice(
                                service.id,
                                product.id,
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => saveService(service.id)}
                    loading={savingServiceId === service.id}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </AtlasCard>
        ))}
      </div>
    </div>
  );
}