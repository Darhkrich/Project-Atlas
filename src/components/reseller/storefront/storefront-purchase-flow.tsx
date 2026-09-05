/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useMemo, useEffect } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { servicesCategories, examPinUnitPrice } from "@/lib/services-page-data";
import {
  getBrandingStyle,
  getSellingPrice,
  getThemeClasses,
  networkMeta,
} from "@/lib/storefront/utils";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { storefrontPaymentMethods } from "@/lib/storefront/storefront-payment-methods";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import type { Plan } from "@/lib/services-page-data";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { useResellerData } from "@/contexts/reseller-data-context";
import type { StorefrontCustomer } from "@/lib/storefront/customer-types";

interface StorefrontPurchaseFlowProps {
  serviceId: string;
  initialNetwork?: string;
  initialPlanId?: string;
  config: StorefrontConfig;
  onClose: () => void;
  onComplete?: (order: any) => void;
  resellerMode?: boolean; // NEW: shows customer name field and hides account save
}

type Step = "network" | "form" | "confirmation" | "processing" | "success";

export function StorefrontPurchaseFlow({
  serviceId,
  initialNetwork,
  initialPlanId,
  config,
  onClose,
  onComplete,
  resellerMode = false,
}: StorefrontPurchaseFlowProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(initialNetwork || null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlanId || null);
  const [customAmount, setCustomAmount] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState(""); // NEW
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPayment, setShowPayment] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderSummary, setOrderSummary] = useState<{
    service: string;
    details: Record<string, string>;
    plan?: Plan;
    total: number;
  } | null>(null);
  const [activePlanCategory, setActivePlanCategory] = useState("All");
  const [showAllPlansModal, setShowAllPlansModal] = useState(false);
  const [saveCustomerDetail, setSaveCustomerDetail] = useState(false);

  const { isAuthenticated, customer, addOrder, saveDetail } = useStorefrontCustomer();
  const { addOrder: addResellerOrder, updateCustomerStats } = useResellerData();

  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  const service = servicesCategories.find((cat) => cat.id === serviceId);
  if (!service) return null;

  const formConfig = service.formConfig;
  const networkOptions = service.networkOptions || [];

  const initialStep: Step = networkOptions.length > 0 && !initialNetwork ? "network" : "form";
  const [step, setStep] = useState<Step>(initialStep);

  const planCategories = useMemo(() => {
    if (selectedNetwork && formConfig?.networkPlanCategories) {
      return formConfig.networkPlanCategories[selectedNetwork] || [];
    }
    return formConfig?.planCategories || [];
  }, [selectedNetwork, formConfig]);

  const activePlans = useMemo(() => {
    if (planCategories.length > 0) {
      const active = planCategories.find((c) => c.name === activePlanCategory);
      return active?.plans || [];
    }
    return formConfig?.plans || [];
  }, [planCategories, activePlanCategory, formConfig]);

  const isData = serviceId === "data";
  const isAirtime = serviceId === "airtime";
  const isElectricity = serviceId === "electricity";
  const isExamPins = serviceId === "exampins";

  useEffect(() => {
    if (initialPlanId && selectedNetwork && planCategories.length > 0) {
      for (const cat of planCategories) {
        if (cat.plans.some((p) => p.id === initialPlanId)) {
          setActivePlanCategory(cat.name);
          break;
        }
      }
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId, selectedNetwork, planCategories]);

  const getPlanPrice = (plan: Plan) => getSellingPrice(plan.price, config, serviceId);

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setStep("form");
    setActivePlanCategory("All");
    setSelectedPlanId(null);
    setCustomAmount("");
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setCustomAmount("");
  };

  const handleAmountSelect = (amount: number) => {
    setCustomAmount(amount.toString());
    setSelectedPlanId(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (resellerMode && !customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    }
    formConfig?.fields.forEach((field) => {
      if (field.required && !formValues[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    if (isData && activePlans.length > 0 && !selectedPlanId) {
      newErrors.plan = "Please select a plan.";
    }
    if (isAirtime || isElectricity) {
      if (!selectedPlanId && !customAmount) {
        newErrors.plan = "Please select an amount or enter custom amount.";
      }
    }
    if (isExamPins) {
      const qty = Number(formValues.quantity || 0);
      if (!qty || qty < 1) newErrors.quantity = "Quantity must be at least 1.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    const selectedPlan =
      activePlans.find((p) => p.id === selectedPlanId) ||
      planCategories.flatMap((c) => c.plans).find((p) => p.id === selectedPlanId);
    let total = 0;
    if (selectedPlan) {
      total = getPlanPrice(selectedPlan);
    } else if (customAmount) {
      total = Number(customAmount);
    } else if (isExamPins) {
      const qty = Number(formValues.quantity || 0);
      total = qty * getSellingPrice(examPinUnitPrice, config, serviceId);
    }
    setOrderTotal(total);
    setOrderSummary({
      service: service.name,
      details: formValues,
      plan: selectedPlan,
      total,
    });
    setStep("confirmation");
  };

  const handlePayment = () => setShowPayment(true);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setStep("success");

    if (onComplete && orderSummary) {
      onComplete({
        service: orderSummary.service,
        plan: orderSummary.plan?.name || "Custom",
        recipient: Object.values(orderSummary.details).join(" "),
        amount: orderSummary.total,
        customerName: resellerMode ? customerName : undefined,
      });
    }

    // Add order to reseller dashboard
    if (orderSummary) {
      addResellerOrder({
        id: `R-${Date.now().toString(36).toUpperCase()}`,
        orderNumber: `R-${Math.floor(Math.random() * 10000)}`,
        service: orderSummary.service,
        category: orderSummary.service,
        customer: resellerMode
          ? customerName
          : customer?.name || "Online Customer",
        amount: `GHS ${orderSummary.total.toFixed(2)}`,
        commission: `GHS ${(orderSummary.total * 0.05).toFixed(2)}`,
        date: "Just now",
        status: "Successful",
        statusVariant: "success",
      });

      if (isAuthenticated && customer && !resellerMode) {
        updateCustomerStats(customer.id, orderSummary.total);
      }
    }

    // Add to customer's own order history if logged in and not reseller mode
    if (isAuthenticated && orderSummary && !resellerMode) {
      addOrder({
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        service: orderSummary.service,
        plan: orderSummary.plan?.name || "Custom",
        recipient: Object.values(orderSummary.details).join(" "),
        amount: orderSummary.total,
        date: new Date().toISOString(),
        status: "Successful",
        paymentMethod: "Card",
      });

      if (saveCustomerDetail) {
        const fieldMap: Record<string, keyof NonNullable<StorefrontCustomer["savedDetails"]>> = {
          phoneNumber: "phoneNumber",
          meterNumber: "meterNumber",
          smartCardNumber: "smartCardNumber",
        };
        Object.entries(orderSummary.details).forEach(([key, value]) => {
          const mapped = fieldMap[key];
          if (mapped && value) {
            saveDetail(mapped, value);
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={brandingStyle}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-neutral-900">{service.name}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-800"
            aria-label="Close"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-5">
          {step === "network" && networkOptions.length > 0 && (
            <div>
              <p className="text-sm text-neutral-600 mb-4">Choose a network</p>
              <div className="grid grid-cols-1 gap-3">
                {networkOptions.map((network) => (
                  <button
                    key={network}
                    onClick={() => handleNetworkSelect(network)}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 transition"
                  >
                    <span className="font-medium">{network}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-4">
              {resellerMode && (
                <AtlasInput
                  label="Customer Name"
                  type="text"
                  placeholder="e.g. John Mensah"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={errors.customerName}
                />
              )}

              {selectedNetwork && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-neutral-500">Network:</span>
                  <span className="font-medium">{selectedNetwork}</span>
                </div>
              )}

              {formConfig?.fields.map((field) => {
                if (field.type === "select") {
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-neutral-800 mb-1">
                        {field.label}
                      </label>
                      <select
                        value={formValues[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
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
                        <p className="mt-1 text-xs text-danger-600">{errors[field.name]}</p>
                      )}
                    </div>
                  );
                }
                return (
                  <AtlasInput
                    key={field.name}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    error={errors[field.name]}
                  />
                );
              })}

              {isAirtime && (
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {formConfig?.plans?.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleAmountSelect(plan.price)}
                        className={`py-3 px-4 text-sm font-semibold rounded-full transition ${
                          customAmount === plan.price.toString()
                            ? "bg-brand-800 text-white"
                            : "bg-neutral-100 hover:bg-neutral-200"
                        }`}
                      >
                        GH₵{plan.price}
                      </button>
                    ))}
                  </div>
                  <AtlasInput
                    label="Custom Amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPlanId(null);
                    }}
                    error={errors.plan}
                  />
                </div>
              )}

              {isElectricity && (
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {formConfig?.plans?.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleAmountSelect(plan.price)}
                        className={`py-3 px-4 text-sm font-semibold rounded-full transition ${
                          customAmount === plan.price.toString()
                            ? "bg-brand-800 text-white"
                            : "bg-neutral-100 hover:bg-neutral-200"
                        }`}
                      >
                        GH₵{plan.price}
                      </button>
                    ))}
                  </div>
                  <AtlasInput
                    label={formConfig?.customAmount?.label || "Custom Amount"}
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPlanId(null);
                    }}
                    error={errors.plan}
                  />
                </div>
              )}

              {isData && (
                <div>
                  {planCategories.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {planCategories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            setActivePlanCategory(category.name);
                            setSelectedPlanId(null);
                            setCustomAmount("");
                          }}
                          className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
                            activePlanCategory === category.name
                              ? "bg-brand-800 text-white"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {activePlans.slice(0, 6).map((plan) => {
                      const meta = selectedNetwork ? networkMeta[selectedNetwork] : null;
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
                          <div
                            className={`flex items-center justify-between px-2 py-2 ${
                              meta?.color || "bg-neutral-200"
                            } ${meta?.headerText || "text-neutral-900"}`}
                          >
                            <span className="text-xs font-semibold truncate">
                              Data Bundle
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                              {activePlanCategory.toUpperCase() === "ALL"
                                ? "REGULAR"
                                : activePlanCategory.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-white px-2 py-3">
                            <div>
                              <span className="text-[10px] text-neutral-500">Data</span>
                              <span className="block text-base font-bold text-neutral-900">
                                {plan.name}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-500">Cost</span>
                              <span className="block text-base font-bold text-neutral-900">
                                GH₵{getPlanPrice(plan).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {activePlans.length > 6 && (
                    <button
                      onClick={() => setShowAllPlansModal(true)}
                      className="mt-4 w-full text-sm font-medium text-brand-800 hover:underline"
                    >
                      Load More
                    </button>
                  )}
                  {errors.plan && (
                    <p className="mt-2 text-sm text-danger-600">{errors.plan}</p>
                  )}
                </div>
              )}

              {isExamPins && (
                <div>
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Unit Price</span>
                      <span className="text-sm font-medium">
                        GH₵{getSellingPrice(examPinUnitPrice, config, serviceId).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-sm text-neutral-600">Total</span>
                      <span className="text-sm font-bold">
                        GH₵{(Number(formValues.quantity || 0) * getSellingPrice(examPinUnitPrice, config, serviceId)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!resellerMode && isAuthenticated && (
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={saveCustomerDetail}
                    onChange={(e) => setSaveCustomerDetail(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
                  />
                  Save these details to my account
                </label>
              )}

              <Button className="w-full" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          )}

          {step === "confirmation" && orderSummary && (
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Confirm Purchase</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service</span>
                  <span>{orderSummary.service}</span>
                </div>
                {resellerMode && (
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span>{customerName}</span>
                  </div>
                )}
                {Object.entries(orderSummary.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
                {orderSummary.plan && (
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span>{orderSummary.plan.name}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>GH₵{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handlePayment}>
                  Pay
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center">
              <AtlasIcon name="check" className="h-12 w-12 text-success-500 mx-auto" />
              <h4 className="mt-4 font-semibold text-neutral-900">Order Successful!</h4>
              <p className="text-sm text-neutral-600 mt-2">Your order has been placed.</p>
              <Button className="w-full mt-6" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentFlowModal
          open={showPayment}
          mode="purchase"
          title="Payment"
          amount={orderTotal}
          showAmountInput={false}
          methods={storefrontPaymentMethods}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          submitLabel={`Pay GH₵${orderTotal.toFixed(2)}`}
          successMessage="Payment completed successfully."
        />
      )}

      {showAllPlansModal && isData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50"
            onClick={() => setShowAllPlansModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-t-xl bg-white p-4 shadow-xl sm:rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">All {activePlanCategory} Plans</h3>
              <button
                onClick={() => setShowAllPlansModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-800"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activePlans.map((plan) => {
                  const meta = selectedNetwork ? networkMeta[selectedNetwork] : null;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        handlePlanSelect(plan.id);
                        setShowAllPlansModal(false);
                      }}
                      className={`overflow-hidden rounded-xl border transition-all ${
                        selectedPlanId === plan.id
                          ? "border-brand-600 ring-2 ring-brand-600"
                          : "border-neutral-200"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between px-2 py-2 ${
                          meta?.color || "bg-neutral-200"
                        } ${meta?.headerText || "text-neutral-900"}`}
                      >
                        <span className="text-xs font-semibold">Data Bundle</span>
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-white">
                          {activePlanCategory.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-3">
                        <div>
                          <span className="text-[10px] text-neutral-500">Data</span>
                          <span className="block text-base font-bold">{plan.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500">Cost</span>
                          <span className="block text-base font-bold">
                            GH₵{getPlanPrice(plan).toFixed(2)}
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
    </div>
  );
}