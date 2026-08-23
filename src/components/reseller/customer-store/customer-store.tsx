"use client";

import { useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { CustomerStoreProductCard } from "./customer-store-product-card";
import { CustomerStorePurchaseModal } from "./customer-store-purchase-modal";
import { CustomerStoreSuccessModal } from "./customer-store-success-modal";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CustomerStoreProduct = {
  id: string;
  serviceId: string;
  serviceName: string;
  category: "data" | "airtime" | "electricity" | "tv" | "other";
  name: string;
  description: string;
  price: number;
  network?: string;
  validity?: string;
  popular?: boolean;
  icon: AtlasIconName;
};

export type CustomerStoreService = {
  id: string;
  name: string;
  description: string;
  icon: AtlasIconName;
};

type StoreConfig = {
  storeName: string;
  ownerName: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
};

/* -------------------------------------------------------------------------- */
/* Mock Store Data                                                            */
/* -------------------------------------------------------------------------- */

const storeConfig: StoreConfig = {
  storeName: "Atlas Connect",
  ownerName: "Atlas Reseller",
  primaryColor: "#1B4332",
  secondaryColor: "#D8F3DC",
  description:
    "Buy affordable data, airtime, electricity and subscription services quickly and securely.",
};

const services: CustomerStoreService[] = [
  {
    id: "data",
    name: "Data",
    description: "Affordable internet bundles",
    icon: "globe",
  },
  {
    id: "airtime",
    name: "Airtime",
    description: "Top up any supported network",
    icon: "phone",
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Purchase ECG credit",
    icon: "zap",
  },
  {
    id: "tv",
    name: "TV Subscriptions",
    description: "Pay your TV subscription",
    icon: "tv",
  },
];

const products: CustomerStoreProduct[] = [
  {
    id: "mtn-data-1gb",
    serviceId: "data",
    serviceName: "Data",
    category: "data",
    name: "MTN 1GB",
    description: "1GB internet bundle",
    price: 5,
    network: "MTN",
    validity: "30 days",
    icon: "globe",
  },
  {
    id: "mtn-data-5gb",
    serviceId: "data",
    serviceName: "Data",
    category: "data",
    name: "MTN 5GB",
    description: "5GB internet bundle",
    price: 22,
    network: "MTN",
    validity: "30 days",
    popular: true,
    icon: "globe",
  },
  {
    id: "mtn-data-10gb",
    serviceId: "data",
    serviceName: "Data",
    category: "data",
    name: "MTN 10GB",
    description: "10GB internet bundle",
    price: 40,
    network: "MTN",
    validity: "30 days",
    icon: "globe",
  },
  {
    id: "telecel-data-5gb",
    serviceId: "data",
    serviceName: "Data",
    category: "data",
    name: "Telecel 5GB",
    description: "5GB internet bundle",
    price: 21,
    network: "Telecel",
    validity: "30 days",
    popular: true,
    icon: "globe",
  },
  {
    id: "airteltigo-data-5gb",
    serviceId: "data",
    serviceName: "Data",
    category: "data",
    name: "AirtelTigo 5GB",
    description: "5GB internet bundle",
    price: 20,
    network: "AirtelTigo",
    validity: "30 days",
    icon: "globe",
  },
  {
    id: "airtime-10",
    serviceId: "airtime",
    serviceName: "Airtime",
    category: "airtime",
    name: "GHS 10 Airtime",
    description: "Instant airtime top up",
    price: 10,
    network: "MTN",
    icon: "phone",
  },
  {
    id: "airtime-20",
    serviceId: "airtime",
    serviceName: "Airtime",
    category: "airtime",
    name: "GHS 20 Airtime",
    description: "Instant airtime top up",
    price: 20,
    network: "MTN",
    icon: "phone",
  },
  {
    id: "ecg-20",
    serviceId: "electricity",
    serviceName: "Electricity",
    category: "electricity",
    name: "GHS 20 ECG",
    description: "ECG prepaid electricity credit",
    price: 20,
    icon: "zap",
  },
  {
    id: "ecg-50",
    serviceId: "electricity",
    serviceName: "Electricity",
    category: "electricity",
    name: "GHS 50 ECG",
    description: "ECG prepaid electricity credit",
    price: 50,
    icon: "zap",
  },
  {
    id: "dstv-compact",
    serviceId: "tv",
    serviceName: "TV Subscription",
    category: "tv",
    name: "DStv Compact",
    description: "DStv Compact subscription",
    price: 370,
    icon: "tv",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number) {
  return `GHS ${value.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function CustomerStoreSkeleton() {
  return (
    <div className="space-y-6">
      <AtlasSkeleton className="h-64 w-full rounded-2xl" />

      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-24 w-full" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomerStore() {
  const [loading] = useState(false);
  const [error] = useState(false);

  const [activeService, setActiveService] = useState("data");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<CustomerStoreProduct | null>(null);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [completedOrderNumber, setCompletedOrderNumber] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const serviceMatch =
        activeService === "all" || product.serviceId === activeService;

      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.network?.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return serviceMatch && searchMatch;
    });
  }, [activeService, searchQuery]);

  const handleBuy = (product: CustomerStoreProduct) => {
    setSelectedProduct(product);
    setPurchaseOpen(true);
  };

  const handlePurchaseClose = () => {
    setPurchaseOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchaseSuccess = () => {
    const orderNumber = `ATL-${Date.now().toString().slice(-8)}`;

    setCompletedOrderNumber(orderNumber);
    setPurchaseOpen(false);
    setSelectedProduct(null);
    setSuccessOpen(true);
  };

  if (loading) {
    return <CustomerStoreSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Store Hero                                                          */}
      {/* ------------------------------------------------------------------ */}

      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-sm sm:p-8 lg:p-10"
        style={{ backgroundColor: storeConfig.primaryColor }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: storeConfig.secondaryColor }}
        />

        <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
              style={{
                backgroundColor: storeConfig.secondaryColor,
                color: storeConfig.primaryColor,
              }}
            >
              {storeConfig.storeName.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-medium text-white/70">
                {storeConfig.ownerName}
              </p>

              <h1 className="text-xl font-bold sm:text-2xl">
                {storeConfig.storeName}
              </h1>
            </div>
          </div>

          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, in one place.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            {storeConfig.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
            <div className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              Fast delivery
            </div>

            <div className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              Secure payments
            </div>

            <div className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              Trusted reseller
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Service Navigation                                                 */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            What do you need?
          </h2>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Choose a service to see the available products.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const active = activeService === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setActiveService(service.id)}
                className={`group rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-brand-700 bg-brand-50 shadow-sm dark:border-brand-500 dark:bg-brand-950/30"
                    : "border-neutral-200 bg-white hover:border-brand-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-brand-800 text-white"
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    <AtlasIcon name={service.icon} className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                      {service.name}
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {service.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Product Section                                                     */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              Available products
            </p>

            <h2 className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
              {services.find((service) => service.id === activeService)?.name ??
                "Products"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Select a product and complete your purchase in a few steps.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <AtlasIcon
              name="search"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <CustomerStoreProductCard
                key={product.id}
                product={product}
                formatCurrency={formatCurrency}
                onBuy={() => handleBuy(product)}
              />
            ))}
          </div>
        ) : (
          <AtlasCard className="mt-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <AtlasIcon
                name="search"
                className="h-5 w-5 text-neutral-500"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
              No products found
            </h3>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Try another search or select another service.
            </p>
          </AtlasCard>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Trust Information                                                   */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: "check" as AtlasIconName,
            title: "Reliable service",
            description: "Your order is processed quickly.",
          },
          {
            icon: "shield" as AtlasIconName,
            title: "Secure checkout",
            description: "Your payment details stay protected.",
          },
          {
            icon: "support" as AtlasIconName,
            title: "Need help?",
            description: "Contact the reseller for assistance.",
          },
        ].map((item) => (
          <AtlasCard key={item.title} className="border-neutral-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                <AtlasIcon name={item.icon} className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            </div>
          </AtlasCard>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Purchase Modal                                                      */}
      {/* ------------------------------------------------------------------ */}

      {selectedProduct && (
        <CustomerStorePurchaseModal
          open={purchaseOpen}
          product={selectedProduct}
          onClose={handlePurchaseClose}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Success Modal                                                        */}
      {/* ------------------------------------------------------------------ */}

      <CustomerStoreSuccessModal
        open={successOpen}
        orderNumber={completedOrderNumber}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}