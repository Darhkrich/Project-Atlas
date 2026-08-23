/* eslint-disable react-hooks/immutability */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import {
  servicesCategories,
  examPinUnitPrice,
} from "@/lib/services-page-data";
import type { Plan, ServiceCategory, PlanCategory } from "@/lib/services-page-data";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import {
  allPaymentMethods,
  MOCK_ATLAS_POINTS_BALANCE,
  POINTS_CONVERSION_RATE,
  type PaymentMethod,
} from "@/lib/payment-methods";
import {
  useSavedDetails,
  type SavedDetailType,
} from "@/contexts/SavedDetailsContext";

type OrderSummary = {
  service: string;
  details: Record<string, string>;
  plan?: Plan;
  total: number;
};

type ModalStep = "purchase" | "confirmation" | "processing" | "success";

interface ServicesClientProps {
  resellerMode?: boolean;
  onResellerOrderComplete?: (order: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => void;
}

const filterTabs = [
  { id: "all", label: "All" },
  { id: "airtime", label: "Airtime" },
  { id: "data", label: "Data" },
  { id: "bills", label: "Bills" },
  { id: "tv", label: "TV" },
  { id: "more", label: "More" },
];

const networkMeta: Record<string, { color: string; headerText: string; initials: string; logo?: string }> = {
  MTN: { color: "bg-yellow-400", headerText: "text-neutral-900", initials: "MTN", logo: "/mtn1.png" },
  Telecel: { color: "bg-red-600", headerText: "text-white", initials: "V", logo: "/telecel1.jpg" },
  AirtelTigo: { color: "bg-blue-600", headerText: "text-white", initials: "A", logo: "/airteltigo.png" },
  DSTV: { color: "bg-blue-900", headerText: "text-white", initials: "D", logo: "/dstv1.jpg" },
  GOtv: { color: "bg-red-700", headerText: "text-white", initials: "G", logo: "/gotv1.png" },
  StarTimes: { color: "bg-sky-500", headerText: "text-white", initials: "S", logo: "/startimes1.jpg" },
  Surfline: { color: "bg-teal-500", headerText: "text-white", initials: "SF", logo: "/surfline.png" },
  ECG: { color: "bg-amber-500", headerText: "text-neutral-900", initials: "E", logo: "/ecg.png" },
  "Ghana Water": { color: "bg-cyan-600", headerText: "text-white", initials: "GW", logo: "/ghanawater.png" },
};

const trustedPartners = [
  { name: "MTN", src: "/mtn4.jpg" },
  { name: "AirtelTigo", src: "/airteltigo2.jpg" },
  { name: "Telecel", src: "/telecel3.jpg" },
  { name: "DSTV", src: "/dstv1.jpg" },
  { name: "GOtv", src: "/gotv4.jpeg" },
  { name: "StarTimes", src: "/startimes3.jpg" },
  { name: "ECG", src: "/ECG1.webp" },
  { name: "WAEC", src: "/waec3.jpg" },
];

const resellerPaymentMethods: PaymentMethod[] = [
  allPaymentMethods.find((m) => m.id === "wallet")!,
  allPaymentMethods.find((m) => m.id === "momo")!,
];

export function ServicesClient({
  resellerMode = false,
  onResellerOrderComplete,
}: ServicesClientProps = {}) {
  const searchParams = useSearchParams();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showNetworkSelection, setShowNetworkSelection] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activePlanCategory, setActivePlanCategory] = useState("All");
  const [showAllPlansModal, setShowAllPlansModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saveDetail, setSaveDetail] = useState(false);

  const { addSavedDetail, getDetailsByType } = useSavedDetails();

  const selectedCategory = servicesCategories.find((c) => c.id === selectedCategoryId);

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      const category = servicesCategories.find(
        (c) => c.id === serviceParam && c.available,
      );
      if (category) {
        handleCategorySelect(serviceParam);
      }
    }
  }, [searchParams]);

  const filteredCategories = useMemo(() => {
    let cats = servicesCategories;
    if (activeFilter !== "all") {
      cats = cats.filter((c) => c.filterGroup === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      cats = cats.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    return cats;
  }, [activeFilter, query]);

  const handleCategorySelect = (categoryId: string) => {
    const category = servicesCategories.find((c) => c.id === categoryId);
    if (!category) return;
    setSelectedCategoryId(categoryId);
    setFormValues({});
    setCustomerName("");
    setSelectedPlanId(null);
    setCustomAmount("");
    setErrors({});
    setModalStep(null);
    setActivePlanCategory("All");
    setSaveDetail(false);

    if (category.networkOptions && category.networkOptions.length > 0) {
      setShowNetworkSelection(true);
      setSelectedNetwork(null);
    } else {
      setShowNetworkSelection(false);
      setSelectedNetwork(null);
    }
  };

  const handleFilterTabClick = (tabId: string) => {
    setActiveFilter(tabId);
    setQuery("");

    if (tabId === "all") {
      setSelectedCategoryId(null);
      setShowNetworkSelection(false);
      return;
    }

    const groupServices = servicesCategories.filter(
      (c) => c.filterGroup === tabId && c.available,
    );
    if (groupServices.length === 1) {
      handleCategorySelect(groupServices[0].id);
    } else {
      setSelectedCategoryId(null);
      setShowNetworkSelection(false);
    }
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setShowNetworkSelection(false);
    setSelectedPlanId(null);
    setCustomAmount("");

    if (selectedCategory?.formConfig?.networkPlanCategories) {
      const cats = selectedCategory.formConfig.networkPlanCategories[network] || [];
      setActivePlanCategory(cats.length > 0 ? cats[0].name : "All");
    }

    if (selectedCategory?.formConfig?.fields.some((f) => f.name === "network")) {
      setFormValues((prev) => ({ ...prev, network }));
    }
    if (selectedCategory?.formConfig?.fields.some((f) => f.name === "provider")) {
      setFormValues((prev) => ({ ...prev, provider: network }));
    }
  };

  const handleBackToCatalogue = () => {
    setSelectedCategoryId(null);
    setSelectedNetwork(null);
    setShowNetworkSelection(false);
    setFormValues({});
    setCustomerName("");
    setSelectedPlanId(null);
    setCustomAmount("");
    setErrors({});
    setModalStep(null);
    setActiveFilter("all");
    setSaveDetail(false);
  };

  const handleBackToNetworks = () => {
    setShowNetworkSelection(true);
    setSelectedNetwork(null);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    if (!selectedCategory?.formConfig) return false;
    const newErrors: Record<string, string> = {};
    for (const field of selectedCategory.formConfig.fields) {
      const value = formValues[field.name] || "";
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    }
    if (selectedCategory.formConfig.plans && !selectedPlanId && !customAmount) {
      newErrors.plan = "Please select a plan or enter a custom amount.";
    }
    if (
      selectedCategory.id === "exampins" &&
      (!formValues.quantity || Number(formValues.quantity) < 1)
    ) {
      newErrors.quantity = "Quantity must be at least 1.";
    }
    if (resellerMode && !customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedPlan = (): Plan | undefined => {
    if (!selectedCategory?.formConfig) return undefined;
    if (selectedCategory.formConfig.plans) {
      return selectedCategory.formConfig.plans.find((p) => p.id === selectedPlanId);
    }
    if (selectedCategory.formConfig.networkPlanCategories && selectedNetwork) {
      const cats = selectedCategory.formConfig.networkPlanCategories[selectedNetwork];
      if (cats) {
        for (const cat of cats) {
          const plan = cat.plans.find((p) => p.id === selectedPlanId);
          if (plan) return plan;
        }
      }
    }
    return undefined;
  };

  const getTotalAmount = (): number => {
    if (selectedCategory?.id === "exampins") {
      const qty = Number(formValues.quantity || 0);
      return qty * examPinUnitPrice;
    }
    const plan = getSelectedPlan();
    if (plan) return plan.price;
    if (customAmount) return Number(customAmount);
    return 0;
  };

  const handleContinue = () => {
    if (!selectedCategory || !selectedCategory.formConfig) return;
    if (!validateForm()) return;

    const details: Record<string, string> = {};
    for (const field of selectedCategory.formConfig.fields) {
      details[field.label] = formValues[field.name] || "—";
    }
    if (selectedNetwork && !details["Network"] && !details["Provider"]) {
      details["Network"] = selectedNetwork;
    }
    if (resellerMode && customerName) {
      details["Customer Name"] = customerName;
    }

    const plan = getSelectedPlan();
    const total = getTotalAmount();

    setOrderSummary({
      service: selectedCategory.name,
      details,
      plan:
        plan ||
        (customAmount
          ? { id: "custom", name: "Custom Amount", price: total }
          : undefined),
      total,
    });
    setModalStep("purchase");
  };

  const handleSubmitPurchase = () => setModalStep("confirmation");

  const handleConfirmPurchase = () => {
    setModalStep(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (saveDetail && selectedCategory) {
      const fieldName = ["phoneNumber", "meterNumber", "smartCardNumber"].find(
        (name) => formValues[name]?.trim(),
      );
      if (fieldName) {
        const type: SavedDetailType =
          fieldName === "phoneNumber"
            ? "phone"
            : fieldName === "meterNumber"
              ? "meter"
              : "smartcard";
        addSavedDetail({
          name: `${selectedCategory.name} ${type}`,
          type,
          value: formValues[fieldName],
          service: selectedCategory.name,
        });
      }
    }

    if (resellerMode && onResellerOrderComplete && orderSummary) {
      const plan = orderSummary.plan?.name || "Custom";
      const recipient = Object.values(orderSummary.details).find((v) => v !== "—") || "N/A";
      onResellerOrderComplete({
        service: orderSummary.service,
        plan,
        recipient,
        amount: orderSummary.total,
        customerName: customerName || undefined,
      });
    }

    setShowPaymentModal(false);
    setModalStep("processing");
    setTimeout(() => {
      setTransactionId(`AT${Date.now().toString(36).toUpperCase()}`);
      setModalStep("success");
    }, 1500);
  };

  const handleDone = () => {
    setModalStep(null);
    setSelectedCategoryId(null);
    setSelectedNetwork(null);
    setShowNetworkSelection(false);
    setFormValues({});
    setCustomerName("");
    setSelectedPlanId(null);
    setCustomAmount("");
    setOrderSummary(null);
    setActiveFilter("all");
    setSaveDetail(false);
  };

  const closeModal = () => {
    setModalStep(null);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setCustomAmount("");
    setErrors((prev) => {
      const { plan, ...rest } = prev;
      return rest;
    });
    setShowAllPlansModal(false);
  };

  const handleAmountSelect = (planId: string) => {
    handlePlanSelect(planId);
  };

  const getActivePlanCategories = (): PlanCategory[] => {
    if (selectedCategory?.formConfig?.networkPlanCategories && selectedNetwork) {
      return selectedCategory.formConfig.networkPlanCategories[selectedNetwork] || [];
    }
    return selectedCategory?.formConfig?.planCategories || [];
  };

  const getActivePlans = (): Plan[] => {
    const categories = getActivePlanCategories();
    if (categories.length === 0) {
      return selectedCategory?.formConfig?.plans || [];
    }
    const active = categories.find((c) => c.name === activePlanCategory);
    return active?.plans || [];
  };

  const getFieldSavedOptions = (fieldName: string) => {
    if (fieldName === "phoneNumber") return getDetailsByType("phone");
    if (fieldName === "meterNumber") return getDetailsByType("meter");
    if (fieldName === "smartCardNumber") return getDetailsByType("smartcard");
    return [];
  };

  const canSaveDetail =
    selectedCategory?.formConfig?.fields?.some((field) =>
      ["phoneNumber", "meterNumber", "smartCardNumber"].includes(field.name),
    ) ?? false;

  const paymentMethodsForMode = resellerMode
    ? resellerPaymentMethods
    : allPaymentMethods;

  return (
    <>
      <AtlasSection
        size="lg"
        className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
      >
        <AtlasContainer>
          {/* Reseller banner */}
          {resellerMode && (
            <div className="mb-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              <strong>Reseller Purchase:</strong> Pay for a customer using your
              wallet or mobile money. The order will appear in your Orders.
            </div>
          )}

          {!selectedCategory ? (
            <>
              {/* Top Section with primary brand background */}
              <div className="mb-8 rounded-xl bg-brand-800 p-6 shadow-sm dark:bg-brand-900">
                <div className="mb-6 flex items-center">
                  <button
                    onClick={() => window.history.back()}
                    className="mr-4 rounded-md p-2 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Go back"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-white">All Services</h1>
                    <p className="mt-1 text-sm text-brand-100">
                      Everything you need, in one place. Choose a service to get started.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <AtlasIcon
                      name="search"
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search services..."
                      className="w-full rounded-full bg-white/95 py-3 pl-12 pr-4 text-base text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:bg-neutral-900/95 dark:text-neutral-100 dark:placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleFilterTabClick(tab.id)}
                      className={`pb-1 text-sm font-medium transition-colors ${
                        activeFilter === tab.id
                          ? "border-b-2 border-white text-white"
                          : "text-brand-100 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => category.available && handleCategorySelect(category.id)}
                    disabled={!category.available}
                    className={`group rounded-xl border p-5 text-left transition-all ${
                      category.available
                        ? "border-neutral-200 bg-white hover:border-brand-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
                        : "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
                    }`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/40">
                      <AtlasIcon name={category.icon as AtlasIconName} className="h-6 w-6 text-brand-800 dark:text-brand-300" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{category.name}</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{category.description}</p>
                    {category.comingSoon && (
                      <span className="mt-3 inline-block rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        Coming soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : showNetworkSelection && selectedCategory.networkOptions ? (
            <>
              <div className="mb-6 flex items-start">
                <button
                  onClick={handleBackToCatalogue}
                  className="mr-4 rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  aria-label="Back to services"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedCategory.name}</h1>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Choose a network/provider</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCategory.networkOptions.map((network) => (
                  <button
                    key={network}
                    onClick={() => handleNetworkSelect(network)}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
                  >
                    <NetworkLogo network={network} size="md" />
                    <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{network}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex items-start">
                <button
                  onClick={
                    selectedCategory?.networkOptions?.length
                      ? handleBackToNetworks
                      : handleBackToCatalogue
                  }
                  className="mr-4 rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  aria-label="Back"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedCategory?.name}</h1>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{selectedCategory?.description}</p>
                  {selectedNetwork && (
                    <div className="mt-2 flex items-center gap-2">
                      <NetworkLogo network={selectedNetwork} size="sm" />
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                        {selectedNetwork}
                      </span>
                      <button
                        onClick={handleBackToNetworks}
                        className="text-sm text-brand-700 hover:underline dark:text-brand-300"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mx-auto max-w-2xl rounded-xl bg-neutral-50/80 p-6 dark:bg-neutral-900/50">
                {resellerMode && (
                  <div className="mb-4">
                    <AtlasInput
                      label="Customer Name"
                      type="text"
                      placeholder="e.g. John Mensah"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      error={errors.customerName}
                    />
                  </div>
                )}

                <div className="space-y-5">
                  {selectedCategory?.formConfig?.fields.map((field) => {
                    const savedOptions = getFieldSavedOptions(field.name);
                    return (
                      <div key={field.name}>
                        {savedOptions.length > 0 && (
                          <div className="mb-2">
                            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              Use saved
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleFieldChange(field.name, e.target.value);
                                }
                              }}
                              className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                              <option value="">Select saved {field.label}</option>
                              {savedOptions.map((detail) => (
                                <option key={detail.id} value={detail.value}>
                                  {detail.name} — {detail.value}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {field.type === "select" ? (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              {field.label}
                            </label>
                            <select
                              value={formValues[field.name] || ""}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange(field.name, e.target.value)}
                              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                              <option value="" disabled>
                                Select {field.label}
                              </option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            {errors[field.name] && (
                              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors[field.name]}</p>
                            )}
                          </div>
                        ) : (
                          <AtlasInput
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formValues[field.name] || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
                            error={errors[field.name]}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Amount suggestions */}
                {selectedCategory?.formConfig?.selectionType === "amounts" &&
                  selectedCategory.formConfig.plans && (
                    <div className="mt-8">
                      <label className="mb-3 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Select Amount
                      </label>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {selectedCategory.formConfig.plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handleAmountSelect(plan.id)}
                            className={`rounded-full py-3 px-4 text-sm font-semibold text-neutral-900 transition-colors ${
                              selectedPlanId === plan.id
                                ? "bg-brand-800 text-white"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                            }`}
                          >
                            GH₵{plan.price}
                          </button>
                        ))}
                      </div>
                      {errors.plan && (
                        <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.plan}</p>
                      )}
                    </div>
                  )}

                {/* Plain plans */}
                {selectedCategory?.formConfig?.plans &&
                  selectedCategory.formConfig.selectionType === "plans" &&
                  getActivePlanCategories().length === 0 && (
                    <div className="mt-8">
                      <label className="mb-3 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Select Package
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedCategory.formConfig.plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                              selectedPlanId === plan.id
                                ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                                : "border-neutral-200 bg-white hover:border-brand-300 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-brand-700"
                            }`}
                          >
                            {selectedNetwork && (
                              <div className="absolute top-2 right-2">
                                <NetworkLogo network={selectedNetwork} size="sm" />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {plan.name}
                            </span>
                            {plan.description && (
                              <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                {plan.description}
                              </span>
                            )}
                            <span className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              GH₵{plan.price.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.plan && (
                        <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.plan}</p>
                      )}
                    </div>
                  )}

                {/* Data plan categories */}
                {getActivePlanCategories().length > 0 && (
                  <div className="mt-8">
                    <label className="mb-3 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Select Plan
                    </label>
                    <div className="mb-5 flex flex-wrap gap-2">
                      {getActivePlanCategories().map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            setActivePlanCategory(category.name);
                            setSelectedPlanId(null);
                            setCustomAmount("");
                          }}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            activePlanCategory === category.name
                              ? "bg-brand-800 text-white"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {getActivePlans().slice(0, 6).map((plan) => {
                        const networkColor = selectedNetwork
                          ? networkMeta[selectedNetwork]?.color || "bg-neutral-300"
                          : "bg-neutral-300";
                        const headerText = selectedNetwork
                          ? networkMeta[selectedNetwork]?.headerText || "text-white"
                          : "text-white";
                        return (
                          <button
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`overflow-hidden rounded-xl border transition-all ${
                              selectedPlanId === plan.id
                                ? "border-brand-600 ring-2 ring-brand-600"
                                : "border-neutral-200 hover:border-neutral-300"
                            }`}
                          >
                            <div className={`flex items-center justify-between px-2 py-2 ${networkColor} ${headerText}`}>
                              <span className="text-xs font-semibold truncate">Data Bundle</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                                {activePlanCategory.toUpperCase() === "ALL" ? "REGULAR" : activePlanCategory.toUpperCase()}
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2 py-3 dark:bg-neutral-900">
                              <div>
                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Data</span>
                                <span className="block text-base font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Cost</span>
                                <span className="block text-base font-bold text-neutral-900 dark:text-neutral-100">
                                  GH₵{plan.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {getActivePlans().length > 6 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowAllPlansModal(true)}
                          className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
                        >
                          Load More
                        </button>
                      </div>
                    )}

                    {errors.plan && (
                      <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{errors.plan}</p>
                    )}
                  </div>
                )}

                {/* Custom amount */}
                {selectedCategory?.formConfig?.customAmount && (
                  <div className="mt-8">
                    <AtlasInput
                      label={selectedCategory.formConfig.customAmount.label}
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCustomAmount(e.target.value);
                        setSelectedPlanId(null);
                        setErrors((prev) => {
                          const { plan, ...rest } = prev;
                          return rest;
                        });
                      }}
                      error={errors.plan}
                    />
                  </div>
                )}

                {/* Exam pins total */}
                {selectedCategory?.id === "exampins" && (
                  <div className="mt-8 rounded-lg bg-white p-4 dark:bg-neutral-900">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Unit Price</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        GH₵{examPinUnitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Total</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        GH₵{getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {canSaveDetail && (
                  <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={saveDetail}
                      onChange={(e) => setSaveDetail(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-800 focus:ring-brand-500"
                    />
                    Save this detail for future use
                  </label>
                )}

                <div className="mt-8">
                  <Button className="w-full" size="lg" onClick={handleContinue}>
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}
        </AtlasContainer>
      </AtlasSection>

      {/* Partner logos */}
      {!selectedCategory && (
        <AtlasSection size="md" className="bg-white dark:bg-neutral-950">
          <AtlasContainer>
            <p className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Trusted by leading networks and partners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {trustedPartners.map((partner) => (
                <img
                  key={partner.name}
                  src={partner.src}
                  alt={`${partner.name} logo`}
                  className="h-10 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                />
              ))}
            </div>
          </AtlasContainer>
        </AtlasSection>
      )}

      {/* Trust strip */}
      <AtlasSection size="md" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {[
              { step: "1", title: "Choose service", desc: "Select from available services" },
              { step: "2", title: "Enter details", desc: "Provide required information" },
              { step: "3", title: "Pay & receive", desc: "Complete payment and track order" },
            ].map((s) => (
              <div key={s.step}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Modals */}
      {modalStep && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            {modalStep === "purchase" && orderSummary && (
              <>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Purchase Details</h2>
                  <button onClick={closeModal} className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" aria-label="Close">
                    <AtlasIcon name="x-circle" className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Service</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.service}</span>
                      </div>
                      {Object.entries(orderSummary.details).map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
                        </div>
                      ))}
                      {orderSummary.plan && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Plan</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.plan.name}</span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Total</span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GH₵{orderSummary.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Please confirm these details before continuing.</p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                    <Button className="flex-1" onClick={handleSubmitPurchase}>Continue</Button>
                  </div>
                </div>
              </>
            )}

            {modalStep === "confirmation" && (
              <>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Confirm Purchase</h2>
                  <button onClick={closeModal} className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" aria-label="Close">
                    <AtlasIcon name="x-circle" className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Service</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary?.service}</span>
                      </div>
                      {orderSummary && Object.entries(orderSummary.details).map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
                        </div>
                      ))}
                      {orderSummary?.plan && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Plan</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.plan.name}</span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Total</span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GH₵{orderSummary?.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to continue?</p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setModalStep("purchase")}>Go Back</Button>
                    <Button className="flex-1" onClick={handleConfirmPurchase}>Confirm Purchase</Button>
                  </div>
                </div>
              </>
            )}

            {modalStep === "processing" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                  <svg className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Processing Your Order</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Please wait while Atlas processes your request.</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>Received</span><span>→</span><span>Processing</span><span>→</span><span>Finalizing</span><span>→</span><span>Complete</span>
                </div>
              </div>
            )}

            {modalStep === "success" && orderSummary && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
                  <svg className="h-8 w-8 text-success-700 dark:text-success-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Order Successful!</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Your order has been purchased successfully.</p>
                <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-left dark:bg-neutral-800">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Service</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">GH₵{orderSummary.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Transaction ID</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{transactionId}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button className="w-full" onClick={handleDone}>View My Orders</Button>
                  <button onClick={handleDone} className="text-sm font-medium text-neutral-600 hover:text-brand-800 dark:text-neutral-400 dark:hover:text-brand-300">Buy Another</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Flow Modal */}
      <PaymentFlowModal
        open={showPaymentModal}
        mode="purchase"
        title="Payment"
        amount={orderSummary?.total}
        showAmountInput={false}
        methods={paymentMethodsForMode}
        atlasPointsBalance={MOCK_ATLAS_POINTS_BALANCE}
        pointsConversionRate={POINTS_CONVERSION_RATE}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        submitLabel={`Pay GH₵${orderSummary?.total.toFixed(2) ?? "0.00"}`}
        successMessage="Payment completed successfully."
      />

      {/* Load More Plans Modal */}
      {showAllPlansModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowAllPlansModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-t-xl bg-white p-4 shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                All {activePlanCategory} Plans
              </h3>
              <button
                onClick={() => setShowAllPlansModal(false)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {getActivePlans().map((plan) => {
                  const networkColor = selectedNetwork
                    ? networkMeta[selectedNetwork]?.color || "bg-neutral-300"
                    : "bg-neutral-300";
                  const headerText = selectedNetwork
                    ? networkMeta[selectedNetwork]?.headerText || "text-white"
                    : "text-white";
                  return (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`overflow-hidden rounded-xl border transition-all ${
                        selectedPlanId === plan.id
                          ? "border-brand-600 ring-2 ring-brand-600"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className={`flex items-center justify-between px-2 py-2 ${networkColor} ${headerText}`}>
                        <span className="text-xs font-semibold truncate">Data Bundle</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                          {activePlanCategory.toUpperCase() === "ALL" ? "REGULAR" : activePlanCategory.toUpperCase()}
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-3 dark:bg-neutral-900">
                        <div>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Data</span>
                          <span className="block text-base font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Cost</span>
                          <span className="block text-base font-bold text-neutral-900 dark:text-neutral-100">
                            GH₵{plan.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NetworkLogo({ network, size = "md" }: { network: string; size?: "sm" | "md" }) {
  const meta = networkMeta[network];
  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";

  return (
    <span
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full ${
        meta?.color ?? "bg-neutral-300"
      } ${meta?.headerText ?? "text-white"} font-semibold`}
      aria-label={`${network} logo`}
    >
      {meta?.logo ? (
        <img src={meta.logo} alt="" className="h-full w-full object-cover" />
      ) : (
        meta?.initials ?? network.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}