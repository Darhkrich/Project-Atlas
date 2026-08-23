/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { servicesCategories } from "@/lib/services-page-data";
import { allPaymentMethods, type PaymentMethod } from "@/lib/payment-methods";
import type { Plan } from "@/lib/services-page-data";

type FavoriteKind = "quick_buy" | "detail";

type QuickBuyFavorite = {
  id: string;
  kind: "quick_buy";
  name: string;
  serviceName: string;
  serviceIcon: AtlasIconName;
  network?: string;
  planName: string;
  recipient: string;
  amount: number;
  paymentMethodId: string;
};

type DetailFavorite = {
  id: string;
  kind: "detail";
  name: string;
  type: "phone" | "meter" | "smartcard" | "bank";
  value: string;
  service: string;
  icon: AtlasIconName;
  iconBg: string;
};

type Favorite = QuickBuyFavorite | DetailFavorite;

const mockQuickBuys: QuickBuyFavorite[] = [
  {
    id: "q1",
    kind: "quick_buy",
    name: "MTN Data 1GB",
    serviceName: "Data",
    serviceIcon: "globe",
    network: "MTN",
    planName: "1GB",
    recipient: "024 123 4567",
    amount: 6,
    paymentMethodId: "momo",
  },
  {
    id: "q2",
    kind: "quick_buy",
    name: "ECG Prepaid",
    serviceName: "Electricity",
    serviceIcon: "zap",
    network: "ECG",
    planName: "GHS 50",
    recipient: "Meter: 1234567890",
    amount: 50,
    paymentMethodId: "wallet",
  },
];

const mockDetailFavorites: DetailFavorite[] = [
  {
    id: "d1",
    kind: "detail",
    name: "Emmanuel Phone",
    type: "phone",
    value: "024 123 4567",
    service: "Airtime / Data",
    icon: "phone",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "d2",
    kind: "detail",
    name: "DSTV Decoder",
    type: "smartcard",
    value: "1234567890",
    service: "Cable TV",
    icon: "tv",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
];

const typeLabels: Record<string, string> = {
  phone: "Phone Number",
  meter: "Meter Number",
  smartcard: "Smartcard Number",
  bank: "Bank Account",
};

export function FavoritesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quickBuys, setQuickBuys] = useState<QuickBuyFavorite[]>([]);
  const [details, setDetails] = useState<DetailFavorite[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"quick_buy" | "detail">("quick_buy");
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  // Quick buy confirm state
  const [selectedQuickBuy, setSelectedQuickBuy] = useState<QuickBuyFavorite | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState<"confirm" | "processing" | "success">("confirm");

  const [form, setForm] = useState({
    name: "",
    serviceId: "",
    network: "",
    planId: "",
    recipient: "",
    paymentMethodId: "momo", // default
    type: "phone",
    value: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setQuickBuys(mockQuickBuys);
      setDetails(mockDetailFavorites);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedService = servicesCategories.find((s) => s.id === form.serviceId);
  const availablePlans: Plan[] = selectedService?.formConfig?.plans || [];
  const networkPlanCategories = selectedService?.formConfig?.networkPlanCategories;
  const currentPlans: Plan[] =
    networkPlanCategories && form.network
      ? networkPlanCategories[form.network]?.flatMap((c) => c.plans) || availablePlans
      : availablePlans;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateQuickBuy = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.serviceId) errors.serviceId = "Service is required.";
    if (!form.recipient.trim()) errors.recipient = "Recipient is required.";
    if (selectedService?.networkOptions?.length && !form.network) {
      errors.network = "Network/provider is required.";
    }
    if (currentPlans.length > 0 && !form.planId) errors.planId = "Plan is required.";
    if (!form.paymentMethodId) errors.paymentMethodId = "Payment method is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDetail = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.value.trim()) errors.value = "Value is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    if (addMode === "quick_buy") {
      if (!validateQuickBuy()) return;
      const plan = currentPlans.find((p) => p.id === form.planId);
      const service = servicesCategories.find((s) => s.id === form.serviceId);
      const newQuickBuy: QuickBuyFavorite = {
        id: `q${Date.now()}`,
        kind: "quick_buy",
        name: form.name,
        serviceName: service?.name || "",
        serviceIcon: (service?.icon as AtlasIconName) || "grid",
        network: form.network || undefined,
        planName: plan?.name || "Custom",
        recipient: form.recipient,
        amount: plan?.price || 0,
        paymentMethodId: form.paymentMethodId,
      };
      setQuickBuys((prev) => [newQuickBuy, ...prev]);
    } else {
      if (!validateDetail()) return;
      const newDetail: DetailFavorite = {
        id: `d${Date.now()}`,
        kind: "detail",
        name: form.name,
        type: form.type as DetailFavorite["type"],
        value: form.value,
        service: getServiceByType(form.type),
        icon: getTypeIcon(form.type),
        iconBg: getTypeIconBg(form.type),
      };
      setDetails((prev) => [newDetail, ...prev]);
    }
    setShowAddModal(false);
    setForm({
      name: "",
      serviceId: "",
      network: "",
      planId: "",
      recipient: "",
      paymentMethodId: "momo",
      type: "phone",
      value: "",
    });
  };

  const handleBuy = (quickBuy: QuickBuyFavorite) => {
    setSelectedQuickBuy(quickBuy);
    setConfirmStep("confirm");
    setConfirmOpen(true);
  };

  const handleConfirmPurchase = () => {
    setConfirmStep("processing");
    setTimeout(() => {
      setConfirmStep("success");
    }, 1500);
  };

  const getServiceByType = (type: string): string => {
    switch (type) {
      case "phone":
        return "Airtime / Data";
      case "meter":
        return "Electricity";
      case "smartcard":
        return "Cable TV";
      case "bank":
        return "Wallet Withdrawal";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: string): AtlasIconName => {
    switch (type) {
      case "phone":
        return "phone";
      case "meter":
        return "zap";
      case "smartcard":
        return "tv";
      case "bank":
        return "bank";
      default:
        return "grid";
    }
  };

  const getTypeIconBg = (type: string): string => {
    switch (type) {
      case "phone":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "meter":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "smartcard":
        return "bg-purple-100 dark:bg-purple-900/30";
      case "bank":
        return "bg-green-100 dark:bg-green-900/30";
      default:
        return "bg-neutral-100 dark:bg-neutral-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-8">
      {/* Quick Buy Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Quick Buy Favorites
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              One-click purchases for your most used services.
            </p>
          </div>
          <Button onClick={() => { setAddMode("quick_buy"); setShowAddModal(true); }}>
            <AtlasIcon name="plus" className="mr-2 h-4 w-4" />
            Add Quick Buy
          </Button>
        </div>

        {quickBuys.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickBuys.map((qb) => {
              const paymentMethod = allPaymentMethods.find((m) => m.id === qb.paymentMethodId);
              return (
                <AtlasCard key={qb.id} className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                        <AtlasIcon name={qb.serviceIcon} className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                          {qb.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {qb.network ? `${qb.network} • ` : ""}{qb.planName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteId(qb.id)}
                      className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-danger-600 dark:hover:bg-neutral-800 dark:hover:text-danger-400"
                      aria-label="Delete quick buy"
                    >
                      <AtlasIcon name="x-circle" className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {qb.recipient}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      GHS {qb.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      {paymentMethod && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <AtlasIcon name={paymentMethod.icon} className="h-4 w-4" />
                          {paymentMethod.name}
                        </span>
                      )}
                      <Button size="sm" onClick={() => handleBuy(qb)}>
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </AtlasCard>
              );
            })}
          </div>
        ) : (
          <AtlasEmptyState
            title="No quick buy favorites"
            description="Save a full service purchase for one-click buying."
            action={
              <Button onClick={() => { setAddMode("quick_buy"); setShowAddModal(true); }}>
                Add Quick Buy
              </Button>
            }
          />
        )}
      </section>

      {/* Saved Details Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Saved Details
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Frequently used phone numbers, meters, smartcards, and bank accounts.
            </p>
          </div>
          <Button onClick={() => { setAddMode("detail"); setShowAddModal(true); }}>
            <AtlasIcon name="plus" className="mr-2 h-4 w-4" />
            Add Detail
          </Button>
        </div>

        {details.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((detail) => (
              <AtlasCard key={detail.id} className="relative">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${detail.iconBg}`}
                  >
                    <AtlasIcon
                      name={detail.icon}
                      className="h-6 w-6 text-neutral-700 dark:text-neutral-200"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {detail.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {detail.value}
                    </p>
                    <div className="mt-2">
                      <AtlasBadge variant="neutral">{detail.service}</AtlasBadge>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteId(detail.id)}
                    className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-danger-600 dark:hover:bg-neutral-800 dark:hover:text-danger-400"
                    aria-label="Delete detail"
                  >
                    <AtlasIcon name="x-circle" className="h-5 w-5" />
                  </button>
                </div>
              </AtlasCard>
            ))}
          </div>
        ) : (
          <AtlasEmptyState
            title="No saved details"
            description="Save your frequently used recipient details."
            action={
              <Button onClick={() => { setAddMode("detail"); setShowAddModal(true); }}>
                Add Detail
              </Button>
            }
          />
        )}
      </section>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowAddModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Add {addMode === "quick_buy" ? "Quick Buy" : "Saved Detail"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {addMode === "quick_buy" ? (
                <div className="space-y-4">
                  <AtlasInput
                    label="Name"
                    type="text"
                    placeholder="e.g. MTN Data 1GB"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={formErrors.name}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Service
                    </label>
                    <select
                      value={form.serviceId}
                      onChange={(e) => {
                        updateField("serviceId", e.target.value);
                        updateField("network", "");
                        updateField("planId", "");
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="" disabled>Select service</option>
                      {servicesCategories.filter(s => s.available).map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.serviceId && (
                      <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.serviceId}</p>
                    )}
                  </div>
                  {selectedService?.networkOptions?.length ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Network / Provider
                      </label>
                      <select
                        value={form.network}
                        onChange={(e) => {
                          updateField("network", e.target.value);
                          updateField("planId", "");
                        }}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      >
                        <option value="" disabled>Select network</option>
                        {selectedService.networkOptions.map((network) => (
                          <option key={network} value={network}>
                            {network}
                          </option>
                        ))}
                      </select>
                      {formErrors.network && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.network}</p>
                      )}
                    </div>
                  ) : null}
                  {currentPlans.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Plan / Package
                      </label>
                      <select
                        value={form.planId}
                        onChange={(e) => updateField("planId", e.target.value)}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      >
                        <option value="" disabled>Select plan</option>
                        {currentPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} — GHS {plan.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {formErrors.planId && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.planId}</p>
                      )}
                    </div>
                  )}
                  <AtlasInput
                    label="Recipient"
                    type="text"
                    placeholder="Phone number, meter number, smartcard..."
                    value={form.recipient}
                    onChange={(e) => updateField("recipient", e.target.value)}
                    error={formErrors.recipient}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Preferred Payment Method
                    </label>
                    <select
                      value={form.paymentMethodId}
                      onChange={(e) => updateField("paymentMethodId", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      {allPaymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.paymentMethodId && (
                      <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{formErrors.paymentMethodId}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AtlasInput
                    label="Name"
                    type="text"
                    placeholder="e.g. Emmanuel Phone"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={formErrors.name}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => updateField("type", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      {Object.keys(typeLabels).map((type) => (
                        <option key={type} value={type}>
                          {typeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AtlasInput
                    label={typeLabels[form.type]}
                    type="text"
                    placeholder={
                      form.type === "phone"
                        ? "024 XXX XXXX"
                        : form.type === "meter"
                          ? "1234567890"
                          : form.type === "smartcard"
                            ? "1234567890"
                            : "Account number"
                    }
                    value={form.value}
                    onChange={(e) => updateField("value", e.target.value)}
                    error={formErrors.value}
                  />
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAdd}
                  loading={isSubmitting}
                >
                  Add {addMode === "quick_buy" ? "Quick Buy" : "Detail"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowDeleteId(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300">
                <AtlasIcon name="x-circle" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Delete Item?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    setQuickBuys((prev) => prev.filter((qb) => qb.id !== showDeleteId));
                    setDetails((prev) => prev.filter((d) => d.id !== showDeleteId));
                    setShowDeleteId(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Buy Confirmation Modal */}
      {confirmOpen && selectedQuickBuy && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            {confirmStep === "confirm" && (
              <>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Confirm Purchase
                  </h2>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    aria-label="Close"
                  >
                    <AtlasIcon name="x-circle" className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Service</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedQuickBuy.serviceName}
                        </span>
                      </div>
                      {selectedQuickBuy.network && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Network</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {selectedQuickBuy.network}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Plan</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedQuickBuy.planName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Recipient</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedQuickBuy.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Payment Method</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {allPaymentMethods.find(m => m.id === selectedQuickBuy.paymentMethodId)?.name}
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Total</span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GHS {selectedQuickBuy.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to proceed?
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleConfirmPurchase}>
                      Confirm Purchase
                    </Button>
                  </div>
                </div>
              </>
            )}

            {confirmStep === "processing" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                  <svg className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Processing...</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Please wait while we complete your purchase.</p>
              </div>
            )}

            {confirmStep === "success" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
                  <AtlasIcon name="check" className="h-8 w-8 text-success-700 dark:text-success-300" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Purchase Successful!</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Your {selectedQuickBuy.name} has been purchased.
                </p>
                <div className="mt-6">
                  <Button className="w-full" onClick={() => setConfirmOpen(false)}>Done</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}