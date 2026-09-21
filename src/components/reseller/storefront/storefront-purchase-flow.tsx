/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { servicesCategories, examPinUnitPrice } from "@/lib/services-page-data";
import {
  getBrandingStyle,
  getSellingPrice,
  networkMeta,
} from "@/lib/storefront/utils";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import type {
  PaymentFlowSavedMethod,
  PaymentFlowSaveInput,
} from "@/components/payments/PaymentFlowModal";
import { resolveStorefrontPaymentMethods } from "@/lib/storefront/storefront-payment-methods";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import type { Plan } from "@/lib/services-page-data";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { useCurrentStorefrontWallet } from "@/lib/storefront-user/hooks/use-current-storefront-wallet";
import { useSavedMethods } from "@/lib/storefront-user/hooks/use-saved-methods";
import {
  ensureStorefrontWallet,
  recordStorefrontPurchase,
} from "@/lib/storefront-user/wallet/wallet-mutations";
import { addSavedMethod } from "@/lib/storefront-user/wallet/saved-methods-mutations";
import { recordResellerOrder } from "@/lib/domains/orders/mutations";
import { resolveOrderContext } from "@/lib/domains/orders/service-mapping";
import { createStorefrontCustomer } from "@/lib/domains/storefront/customer-mutations";
import { formatCurrency } from "@/lib/shared/format";
import type { StorefrontCustomer } from "@/lib/storefront/customer-types";
import type { OrderWalletDebit } from "@/lib/admin/types/orders";

interface StorefrontPurchaseFlowProps {
  serviceId: string;
  initialNetwork?: string;
  initialPlanId?: string;
  config: StorefrontConfig;
  onClose: () => void;
  onComplete?: (order: Record<string, unknown>) => void;
  resellerMode?: boolean;
}

type Step = "network" | "form" | "confirmation" | "processing" | "success";

function maskAccount(raw: string): string {
  const digits = raw.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}

function providerFor(
  methodId: string,
  formData: Record<string, string>
): string {
  if (methodId === "momo") return "Momo";
  if (methodId === "card") return formData.cardBrand || "Card";
  if (methodId === "bank") return formData.bankName || "Bank";
  return "Payment method";
}

export function StorefrontPurchaseFlow(props: StorefrontPurchaseFlowProps) {
  const service = servicesCategories.find((cat) => cat.id === props.serviceId);
  if (!service) return null;
  return <PurchaseFlowBody {...props} service={service} />;
}

function PurchaseFlowBody({
  serviceId,
  initialNetwork,
  initialPlanId,
  config,
  onClose,
  onComplete,
  resellerMode = false,
  service,
}: StorefrontPurchaseFlowProps & {
  service: NonNullable<ReturnType<typeof servicesCategories.find>>;
}) {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(
    initialNetwork || null
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId || null
  );
  const [customAmount, setCustomAmount] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState("");
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

  const {
    isAuthenticated,
    customer,
    saveDetail,
    setPreferredPaymentMethod,
  } = useStorefrontCustomer();
  const walletState = useCurrentStorefrontWallet();
  const savedMethodsState = useSavedMethods();

  const brandingStyle = getBrandingStyle(config);

  const formConfig = service.formConfig;
  const networkOptions = service.networkOptions || [];

  const initialStep: Step =
    networkOptions.length > 0 && !initialNetwork ? "network" : "form";
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

  const walletBalance = walletState.wallet?.record.balance ?? 0;
  const walletMethodAvailable =
    !resellerMode && isAuthenticated && walletBalance > 0;

  const availableMethods = useMemo(
    () =>
      resolveStorefrontPaymentMethods({
        walletEnabled: walletMethodAvailable,
        walletBalance,
      }),
    [walletMethodAvailable, walletBalance]
  );

  const modalSavedMethods: PaymentFlowSavedMethod[] = useMemo(() => {
    if (!isAuthenticated) return [];
    return savedMethodsState.savedMethods.map((m) => ({
      id: m.id,
      methodId: m.methodId,
      label: m.label,
      maskedSummary: m.provider + " " + m.maskedLabel,
      fieldValues: m.fieldValues,
    }));
  }, [isAuthenticated, savedMethodsState.savedMethods]);

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

  const getPlanPrice = (plan: Plan) =>
    getSellingPrice(plan.price, config, serviceId);

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
        newErrors[field.name] = field.label + " is required.";
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
      planCategories
        .flatMap((c) => c.plans)
        .find((p) => p.id === selectedPlanId);
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

  const buildOrderId = (): string =>
    "ORD-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const buildActor = () => {
    if (!customer) return null;
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      storefrontId: customer.storefrontId ?? config.storefrontId,
      resellerSlug: config.store.slug,
      storefrontName: config.store.name,
    };
  };

  const commitPurchase = (input: {
    paymentMethodId: string;
    paidFromWallet: boolean;
    walletDebit?: OrderWalletDebit;
    storefrontUserId?: string;
  }) => {
    if (!orderSummary) return;
    if (!config.store.slug) return;

    const customerDisplayName = resellerMode
      ? customerName
      : customer?.name ?? "Guest Customer";
    const customerPhone =
      Object.values(orderSummary.details).find((v) => /^[0-9+\s]+$/.test(v)) ??
      customer?.phone ??
      "";
    const orderContext = resolveOrderContext(serviceId, selectedNetwork ?? undefined);

    // Ensure the customer record exists in the shared storefront customer
    // store before we link the order to it.
    let storefrontUserId: string | undefined = input.storefrontUserId;
    if (!resellerMode && customer) {
      createStorefrontCustomer({
        id: customer.id,
        resellerSlug: config.store.slug,
        storefrontId: config.storefrontId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
      storefrontUserId = customer.id;
    }

    const result = recordResellerOrder({
      audience: resellerMode ? "reseller" : "storefront_user",
      customerId: storefrontUserId,
      customerName: customerDisplayName,
      customerPhone: customerPhone || "0000000000",
      storefrontId: config.storefrontId,
      storefrontUserId,
      resellerId: config.ownerId ?? "",
      resellerName: config.store.name,
      serviceId: orderContext.serviceId,
      providerId: orderContext.providerId,
      networkId: orderContext.networkId,
      paymentMethodId: input.paymentMethodId as PaymentFlowSavedMethod["methodId"],
      amount: orderSummary.total,
      walletDebit: input.walletDebit,
    });

    if (!result.ok || !result.order) return;

    if (onComplete) {
      onComplete({
        id: result.order.id,
        service: orderSummary.service,
        plan: orderSummary.plan?.name || "Custom",
        recipient: Object.values(orderSummary.details).join(" "),
        amount: orderSummary.total,
        customerName: resellerMode ? customerName : undefined,
      });
    }

    if (saveCustomerDetail && customer && !resellerMode) {
      const fieldMap: Record<
        string,
        keyof NonNullable<StorefrontCustomer["savedDetails"]>
      > = {
        phoneNumber: "phoneNumber",
        meterNumber: "meterNumber",
        smartCardNumber: "smartCardNumber",
      };
      Object.entries(orderSummary.details).forEach(([key, value]) => {
        const mapped = fieldMap[key];
        if (mapped && value) saveDetail(mapped, value);
      });
    }
  };

  const handlePaymentSubmit = async (input: {
    methodId: string;
    amount: number;
    formData: Record<string, string>;
  }) => {
    if (!orderSummary) {
      return { status: "failed" as const, message: "Order summary missing." };
    }

    if (input.methodId !== "wallet") {
      commitPurchase({ paymentMethodId: input.methodId, paidFromWallet: false });
      setShowPayment(false);
      setStep("success");
      return {
        status: "success" as const,
        message: "Payment completed successfully.",
      };
    }

    if (!customer) {
      return {
        status: "failed" as const,
        message: "Please sign in to pay with wallet.",
      };
    }

    const actor = buildActor();
    if (!actor) {
      return { status: "failed" as const, message: "Customer session missing." };
    }

    const walletId = ensureStorefrontWallet(actor);
    const orderId = buildOrderId();

    const result = recordStorefrontPurchase(
      walletId,
      {
        amount: orderSummary.total,
        service: orderSummary.service,
        plan: orderSummary.plan?.name || "Custom",
        orderId,
      },
      actor
    );

    if (!result.ok) {
      return {
        status: "failed" as const,
        message: result.error ?? "Wallet payment failed.",
      };
    }

    const nowIso = new Date().toISOString();
    const walletDebit: OrderWalletDebit = {
      walletId,
      walletOwner: "storefront_user",
      amount: orderSummary.total,
      status: "captured",
      heldAt: nowIso,
      capturedAt: nowIso,
    };

    commitPurchase({
      paymentMethodId: "wallet",
      paidFromWallet: true,
      walletDebit,
      storefrontUserId: customer.id,
    });

    setShowPayment(false);
    setStep("success");
    return { status: "success" as const, message: "Paid from your wallet." };
  };

  const handleSaveMethod = (input: PaymentFlowSaveInput) => {
    if (!customer) return;
    const actor = buildActor();
    if (!actor) return;
    const walletId = ensureStorefrontWallet(actor);
    const provider = providerFor(input.methodId, input.details);
    const maskedLabel = maskAccount(
      input.details.phoneNumber ||
        input.details.cardNumber ||
        input.details.accountNumber ||
        ""
    );
    const result = addSavedMethod(
      walletId,
      customer.id,
      {
        methodId: input.methodId as "momo" | "card" | "bank",
        provider,
        maskedLabel,
        label: input.label,
        fieldValues: input.details,
      },
      { id: customer.id, name: customer.name, email: customer.email }
    );
    if (result.ok) setPreferredPaymentMethod(input.methodId);
  };

  return (
    <AtlasModalShell open onClose={onClose} title={service.name}>
      <div style={brandingStyle}>
        {step === "network" && networkOptions.length > 0 && (
          <div>
            <p className="text-sm text-neutral-600 mb-4">Choose a network</p>
            <div className="grid grid-cols-1 gap-3">
              {networkOptions.map((network) => (
                <button
                  key={network}
                  type="button"
                  onClick={() => handleNetworkSelect(network)}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4 hover:border-neutral-300"
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
                label="Customer name"
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
                    <label
                      htmlFor={"pf-" + field.name}
                      className="block text-sm font-medium text-neutral-800 mb-1"
                    >
                      {field.label}
                    </label>
                    <select
                      id={"pf-" + field.name}
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
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
                      <p className="mt-1 text-xs text-danger-600">
                        {errors[field.name]}
                      </p>
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
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  error={errors[field.name]}
                />
              );
            })}

            {isAirtime && (
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  Select amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formConfig?.plans?.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleAmountSelect(plan.price)}
                      className={
                        "py-3 px-4 text-sm font-semibold rounded-full transition " +
                        (customAmount === plan.price.toString()
                          ? "bg-brand-800 text-white"
                          : "bg-neutral-100 hover:bg-neutral-200")
                      }
                    >
                      {formatCurrency(plan.price)}
                    </button>
                  ))}
                </div>
                <AtlasInput
                  label="Custom amount"
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
                  Select amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formConfig?.plans?.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleAmountSelect(plan.price)}
                      className={
                        "py-3 px-4 text-sm font-semibold rounded-full transition " +
                        (customAmount === plan.price.toString()
                          ? "bg-brand-800 text-white"
                          : "bg-neutral-100 hover:bg-neutral-200")
                      }
                    >
                      {formatCurrency(plan.price)}
                    </button>
                  ))}
                </div>
                <AtlasInput
                  label={formConfig?.customAmount?.label || "Custom amount"}
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
                        type="button"
                        onClick={() => {
                          setActivePlanCategory(category.name);
                          setSelectedPlanId(null);
                          setCustomAmount("");
                        }}
                        className={
                          "px-4 py-1.5 text-sm font-medium rounded-full transition " +
                          (activePlanCategory === category.name
                            ? "bg-brand-800 text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {activePlans.slice(0, 6).map((plan) => {
                    const meta = selectedNetwork
                      ? networkMeta[selectedNetwork]
                      : null;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanSelect(plan.id)}
                        className={
                          "overflow-hidden rounded-xl border transition-all " +
                          (selectedPlanId === plan.id
                            ? "border-brand-600 ring-2 ring-brand-600"
                            : "border-neutral-200 hover:border-neutral-300")
                        }
                      >
                        <div
                          className={
                            "flex items-center justify-between px-2 py-2 " +
                            (meta?.color || "bg-neutral-200") +
                            " " +
                            (meta?.headerText || "text-neutral-900")
                          }
                        >
                          <span className="text-xs font-semibold truncate">
                            Data bundle
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                            {activePlanCategory.toUpperCase() === "ALL"
                              ? "REGULAR"
                              : activePlanCategory.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-2 py-3">
                          <div>
                            <span className="text-[10px] text-neutral-500">
                              Data
                            </span>
                            <span className="block text-base font-bold text-neutral-900">
                              {plan.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500">
                              Cost
                            </span>
                            <span className="block text-base font-bold text-neutral-900">
                              {formatCurrency(getPlanPrice(plan))}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {activePlans.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPlansModal(true)}
                    className="mt-4 w-full text-sm font-medium text-brand-800 hover:underline"
                  >
                    Load more
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
                    <span className="text-sm text-neutral-600">
                      Unit price
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        getSellingPrice(examPinUnitPrice, config, serviceId)
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-sm text-neutral-600">Total</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(
                        Number(formValues.quantity || 0) *
                          getSellingPrice(examPinUnitPrice, config, serviceId)
                      )}
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
            <h4 className="font-semibold text-neutral-900 mb-3">
              Confirm purchase
            </h4>
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
                <span>{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("form")}
              >
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
            <AtlasIcon
              name="check"
              className="h-12 w-12 text-success-500 mx-auto"
              aria-hidden="true"
            />
            <h4 className="mt-4 font-semibold text-neutral-900">
              Order successful
            </h4>
            <p className="text-sm text-neutral-600 mt-2">
              Your order has been placed.
            </p>
            <Button className="w-full mt-6" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentFlowModal
          open={showPayment}
          mode="purchase"
          title="Payment"
          amount={orderTotal}
          showAmountInput={false}
          methods={availableMethods}
          savedMethods={modalSavedMethods}
          onSaveMethod={
            isAuthenticated && !resellerMode ? handleSaveMethod : undefined
          }
          onSubmit={handlePaymentSubmit}
          onClose={() => setShowPayment(false)}
          submitLabel={"Pay " + formatCurrency(orderTotal)}
          successMessage="Payment completed successfully."
        />
      )}

      {showAllPlansModal && isData && (
        <AtlasModalShell
          open
          onClose={() => setShowAllPlansModal(false)}
          title={"All " + activePlanCategory + " plans"}
          size="lg"
        >
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activePlans.map((plan) => {
                const meta = selectedNetwork
                  ? networkMeta[selectedNetwork]
                  : null;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      handlePlanSelect(plan.id);
                      setShowAllPlansModal(false);
                    }}
                    className={
                      "overflow-hidden rounded-xl border transition-all " +
                      (selectedPlanId === plan.id
                        ? "border-brand-600 ring-2 ring-brand-600"
                        : "border-neutral-200")
                    }
                  >
                    <div
                      className={
                        "flex items-center justify-between px-2 py-2 " +
                        (meta?.color || "bg-neutral-200") +
                        " " +
                        (meta?.headerText || "text-neutral-900")
                      }
                    >
                      <span className="text-xs font-semibold">
                        Data bundle
                      </span>
                      <span className="rounded-full bg-neutral-900 px-2 py-px text-white">
                        {activePlanCategory.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-3">
                      <div>
                        <span className="text-[10px] text-neutral-500">
                          Data
                        </span>
                        <span className="block text-base font-bold">
                          {plan.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500">
                          Cost
                        </span>
                        <span className="block text-base font-bold">
                          {formatCurrency(getPlanPrice(plan))}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </AtlasModalShell>
      )}
    </AtlasModalShell>
  );
}