/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import {
  servicesCategories,
  examPinUnitPrice,
} from "@/lib/services-page-data";
import type { Plan, ServiceCategory } from "@/lib/services-page-data";

type OrderSummary = {
  service: string;
  details: Record<string, string>;
  plan?: Plan;
  total: number;
};

type ModalStep =
  | "purchase"
  | "confirmation"
  | "payment"
  | "processing"
  | "success";

const paymentMethods = [
  { id: "wallet", name: "Wallet Balance", icon: "wallet", balance: "GHC 250.80" },
  { id: "card", name: "Card Payment", icon: "card" },
  { id: "bank", name: "Bank Transfer", icon: "bank" },
  { id: "momo", name: "Mobile Money", icon: "mobile" },
];

const filterTabs = [
  { id: "all", label: "All" },
  { id: "airtime", label: "Airtime" },
  { id: "data", label: "Data" },
  { id: "bills", label: "Bills" },
  { id: "tv", label: "TV" },
  { id: "more", label: "More" },
];

const networkMeta: Record<string, { color: string; initials: string }> = {
  MTN: { color: "bg-yellow-400", initials: "MTN" },
  Vodafone: { color: "bg-red-600", initials: "V" },
  AirtelTigo: { color: "bg-blue-600", initials: "A" },
  DSTV: { color: "bg-blue-900", initials: "D" },
  GOtv: { color: "bg-red-700", initials: "G" },
  StarTimes: { color: "bg-sky-500", initials: "S" },
  Surfline: { color: "bg-teal-500", initials: "SF" },
  ECG: { color: "bg-amber-500", initials: "E" },
  "Ghana Water": { color: "bg-cyan-600", initials: "GW" },
};

export function ServicesClient() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showNetworkSelection, setShowNetworkSelection] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [transactionId, setTransactionId] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activePlanCategory, setActivePlanCategory] = useState("All");

  const selectedCategory = servicesCategories.find((c) => c.id === selectedCategoryId);

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
    setSelectedPlanId(null);
    setCustomAmount("");
    setErrors({});
    setModalStep(null);
    setPaymentDetails({});
    setActivePlanCategory("All");

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

    // If only one available service in this group, select it directly
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
    setSelectedPlanId(null);
    setCustomAmount("");
    setErrors({});
    setModalStep(null);
    setPaymentDetails({});
    setActiveFilter("all");
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedPlan = (): Plan | undefined => {
    if (!selectedCategory?.formConfig) return undefined;
    if (selectedCategory.formConfig.plans) {
      return selectedCategory.formConfig.plans.find((p) => p.id === selectedPlanId);
    }
    if (selectedCategory.formConfig.planCategories) {
      for (const category of selectedCategory.formConfig.planCategories) {
        const plan = category.plans.find((p) => p.id === selectedPlanId);
        if (plan) return plan;
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
  const handleConfirmPurchase = () => setModalStep("payment");

  const handlePay = () => {
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
    setSelectedPlanId(null);
    setCustomAmount("");
    setOrderSummary(null);
    setPaymentMethod("wallet");
    setPaymentDetails({});
    setActiveFilter("all");
  };

  const closeModal = () => {
    setModalStep(null);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setCustomAmount("");
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.plan;
      return newErrors;
    });
  };

  const handleAmountSelect = (planId: string) => {
    handlePlanSelect(planId);
  };

  const getActivePlans = (): Plan[] => {
    if (!selectedCategory?.formConfig?.planCategories) {
      return selectedCategory?.formConfig?.plans || [];
    }
    const category = selectedCategory.formConfig.planCategories.find(
      (c) => c.name === activePlanCategory,
    );
    return category?.plans || [];
  };

  const getPaymentFields = (methodId: string) => {
    switch (methodId) {
      case "card":
        return [
          { name: "cardNumber", label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456", required: true },
          { name: "expiry", label: "Expiry Date", type: "text", placeholder: "MM/YY", required: true },
          { name: "cvv", label: "CVV", type: "text", placeholder: "123", required: true },
        ];
      case "bank":
        return [
          { name: "accountName", label: "Account Name", type: "text", placeholder: "John Doe", required: true },
          { name: "accountNumber", label: "Account Number", type: "text", placeholder: "0123456789", required: true },
          { name: "bankName", label: "Bank Name", type: "text", placeholder: "Bank of Ghana", required: true },
        ];
      case "momo":
        return [
          { name: "momoNumber", label: "Mobile Money Number", type: "tel", placeholder: "024 XXX XXXX", required: true },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          {!selectedCategory ? (
            <>
              {/* Page header */}
              <div className="mb-6 flex items-center">
                <button
                  onClick={() => window.history.back()}
                  className="mr-4 rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  aria-label="Go back"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    All Services
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Everything you need, in one place. Choose a service to get started.
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search services..."
                    className="w-full rounded-full bg-neutral-100 py-3 pl-12 pr-4 text-base text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
                  />
                </div>
              </div>

              {/* Filter tabs */}
              <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterTabClick(tab.id)}
                    className={`pb-1 text-sm font-medium transition-colors ${
                      activeFilter === tab.id
                        ? "border-b-2 border-brand-800 text-neutral-900 dark:border-brand-400 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Service cards grid */}
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
                      <CategoryIcon name={category.id} className="h-6 w-6 text-brand-800 dark:text-brand-300" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {category.description}
                    </p>
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
              {/* Network selection */}
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
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedCategory.name}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Choose a network/provider
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCategory.networkOptions.map((network) => {
                  const meta = networkMeta[network] || {
                    color: "bg-neutral-300",
                    initials: network.charAt(0),
                  };
                  return (
                    <button
                      key={network}
                      onClick={() => handleNetworkSelect(network)}
                      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${meta.color} text-white font-bold`}
                      >
                        {meta.initials}
                      </span>
                      <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {network}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Product form */}
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
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedCategory?.name}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedCategory?.description}
                  </p>
                  {selectedNetwork && (
                    <div className="mt-2 flex items-center gap-2">
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

              {/* White card container for form */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="space-y-5">
                  {selectedCategory?.formConfig?.fields.map((field) => (
                    <div key={field.name}>
                      {field.type === "select" ? (
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {field.label}
                          </label>
                          <select
                            value={formValues[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
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
                            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                              {errors[field.name]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <AtlasInput
                          label={field.label}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          error={errors[field.name]}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {selectedCategory?.formConfig?.selectionType === "amounts" &&
                  selectedCategory.formConfig.plans && (
                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Select Amount
                      </label>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {selectedCategory.formConfig.plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handleAmountSelect(plan.id)}
                            className={`rounded-lg border p-3 text-center transition-colors ${
                              selectedPlanId === plan.id
                                ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                                : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              GH₵{plan.price}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.plan && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.plan}
                        </p>
                      )}
                    </div>
                  )}

                {selectedCategory?.formConfig?.planCategories && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Select Plan
                    </label>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selectedCategory.formConfig.planCategories.map((category) => (
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
                              : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <div className="space-y-2 p-2">
                        {getActivePlans().map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                              selectedPlanId === plan.id
                                ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                                : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600"
                            }`}
                          >
                            <div>
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {plan.name}
                              </span>
                              {plan.description && (
                                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                                  {plan.description}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              GH₵{plan.price.toFixed(2)}
                            </span>
                            <span
                              className={`h-4 w-4 rounded-full border ${
                                selectedPlanId === plan.id
                                  ? "border-brand-700 bg-brand-700"
                                  : "border-neutral-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.plan && (
                      <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                        {errors.plan}
                      </p>
                    )}
                  </div>
                )}

                {selectedCategory?.formConfig?.customAmount && (
                  <div className="mt-6">
                    <AtlasInput
                      label={selectedCategory.formConfig.customAmount.label}
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedPlanId(null);
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.plan;
                          return newErrors;
                        });
                      }}
                      error={errors.plan}
                    />
                  </div>
                )}

                {selectedCategory?.id === "exampins" && (
                  <div className="mt-6 rounded-lg bg-white p-4 dark:bg-neutral-900">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Unit Price
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        GH₵{examPinUnitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        GH₵{getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
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
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {s.desc}
                </p>
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
                <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Purchase Details
                  </h2>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Service
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {orderSummary.service}
                        </span>
                      </div>
                      {Object.entries(orderSummary.details).map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {label}
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {value}
                          </span>
                        </div>
                      ))}
                      {orderSummary.plan && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Plan
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {orderSummary.plan.name}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total
                          </span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GH₵{orderSummary.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    Please confirm these details before continuing.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleSubmitPurchase}>
                      Continue
                    </Button>
                  </div>
                </div>
              </>
            )}

            {modalStep === "confirmation" && (
              <>
                <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Confirm Purchase
                  </h2>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Service
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {orderSummary?.service}
                        </span>
                      </div>
                      {orderSummary &&
                        Object.entries(orderSummary.details).map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {label}
                            </span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {value}
                            </span>
                          </div>
                        ))}
                      {orderSummary?.plan && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Plan
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {orderSummary.plan.name}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total
                          </span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GH₵{orderSummary?.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to continue?
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setModalStep("purchase")}>
                      Go Back
                    </Button>
                    <Button className="flex-1" onClick={handleConfirmPurchase}>
                      Confirm Purchase
                    </Button>
                  </div>
                </div>
              </>
            )}

            {modalStep === "payment" && orderSummary && (
              <>
                <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Payment
                  </h2>
                </div>
                <div className="p-4">
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Service
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {orderSummary.service}
                        </span>
                      </div>
                      {Object.entries(orderSummary.details).map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {label}
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {value}
                          </span>
                        </div>
                      ))}
                      {orderSummary.plan && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Plan
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {orderSummary.plan.name}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total
                          </span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            GH₵{orderSummary.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                            paymentMethod === method.id
                              ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <PaymentIcon name={method.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {method.name}
                            </span>
                          </span>
                          {method.balance && (
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {method.balance}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {paymentMethod !== "wallet" && (
                      <div className="mt-4 space-y-4">
                        {getPaymentFields(paymentMethod).map((field) => (
                          <AtlasInput
                            key={field.name}
                            label={field.label}
                            type={field.type as "text" | "tel"}
                            placeholder={field.placeholder}
                            value={paymentDetails[field.name] || ""}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setModalStep("confirmation")}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={handlePay}>
                      Pay GH₵{orderSummary.total.toFixed(2)}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {modalStep === "processing" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                  <svg
                    className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Processing Your Order
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Please wait while Atlas processes your request.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>Received</span>
                  <span>→</span>
                  <span>Processing</span>
                  <span>→</span>
                  <span>Finalizing</span>
                  <span>→</span>
                  <span>Complete</span>
                </div>
              </div>
            )}

            {modalStep === "success" && orderSummary && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
                  <svg
                    className="h-8 w-8 text-success-700 dark:text-success-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Order Successful!
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Your order has been purchased successfully.
                </p>
                <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-left dark:bg-neutral-800">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Service
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {orderSummary.service}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Amount
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        GH₵{orderSummary.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Transaction ID
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {transactionId}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button className="w-full" onClick={handleDone}>
                    View My Orders
                  </Button>
                  <button
                    onClick={handleDone}
                    className="text-sm font-medium text-neutral-600 hover:text-brand-800 dark:text-neutral-400 dark:hover:text-brand-300"
                  >
                    Buy Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Helper icon components
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "airtime":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case "data":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case "cabletv":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l-5 5-5-5" />
        </svg>
      );
    case "electricity":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "internet":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case "billpayments":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "exampins":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
        </svg>
      );
    default:
      return null;
  }
}

function PaymentIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "wallet":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case "card":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
        </svg>
      );
    case "bank":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V10m14 11V10M9 21V10m6 11V10M3 10l9-6 9 6M3 10h18" />
        </svg>
      );
    case "mobile":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
        </svg>
      );
    default:
      return null;
  }
}