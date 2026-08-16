"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasGrid } from "@/components/atlas/atlas-grid";
import { ServiceIcon } from "@/components/atlas/service-icon";
import { ServiceProductCard } from "./service-product-card";
import type {
  ServiceCatalog,
  ServiceProduct,
  ServiceProductField,
} from "@/lib/service-products";

type ModalStep = "form" | "confirmation" | "processing" | "result";

type TransactionResult = {
  status: "successful" | "pending" | "failed";
  transactionId?: string;
  message?: string;
};

export function ServiceProductCatalog({
  catalog,
}: {
  catalog: ServiceCatalog;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ServiceProduct | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("All");
  const [step, setStep] = useState<ModalStep>("form");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Available networks from products
  const networks = useMemo(() => {
    const unique = new Set<string>();
    catalog.products.forEach((p) => {
      if (p.network) unique.add(p.network);
    });
    return ["All", ...Array.from(unique)];
  }, [catalog.products]);

  // Filter products by network
  const filteredProducts = useMemo(() => {
    if (selectedNetwork === "All") return catalog.products;
    return catalog.products.filter((p) => p.network === selectedNetwork);
  }, [catalog.products, selectedNetwork]);

  const openPurchase = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setStep("form");
    setFormData({});
    setErrors({});
    setResult(null);
    setIsSubmitting(false);
  };

  const openCustomAmount = () => {
    openPurchase({
      id: "custom",
      name: catalog.customAmountLabel || "Custom Amount",
      description: `Enter the amount you want to purchase.`,
      price: 0,
      currency: "GHS",
      status: "available",
      available: true,
    });
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setStep("form");
    setFormData({});
    setErrors({});
    setResult(null);
    setIsSubmitting(false);
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateField = (field: ServiceProductField, value: string) => {
    if (field.required && !value.trim()) {
      return `${field.label} is required.`;
    }

    switch (field.name) {
      case "phoneNumber":
        if (!/^\d{10}$/.test(value.replace(/\s/g, ""))) {
          return "Enter a valid phone number.";
        }
        break;
      case "meterNumber":
        if (!/^\d{8,12}$/.test(value.trim())) {
          return "Enter a valid meter number.";
        }
        break;
      case "smartCardNumber":
        if (value.trim().length < 6) {
          return "Enter a valid smart-card number.";
        }
        break;
      case "candidateNumber":
        if (value.trim().length < 6) {
          return "Enter a valid candidate number.";
        }
        break;
      case "amount":
        const amount = Number(value);
        if (!value || isNaN(amount) || amount <= 0) {
          return "Enter a valid amount.";
        }
        if (catalog.customAmountMin && amount < catalog.customAmountMin) {
          return `Minimum amount is ${catalog.customAmountMin}.`;
        }
        if (catalog.customAmountMax && amount > catalog.customAmountMax) {
          return `Maximum amount is ${catalog.customAmountMax}.`;
        }
        break;
      default:
        break;
    }
    return undefined;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Regular fields
    for (const field of catalog.fields) {
      const value = formData[field.name] || "";
      const error = validateField(field, value);
      if (error) newErrors[field.name] = error;
    }
    // Custom amount field
    if (selectedProduct?.id === "custom") {
      const amount = formData["amount"] || "";
      const amountError = validateField(
        { name: "amount", label: "Amount", type: "number", required: true },
        amount,
      );
      if (amountError) newErrors["amount"] = amountError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      setStep("confirmation");
    }
  };

  const handleConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setStep("processing");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response — replace with actual API later
    const mockResult: TransactionResult = {
      status: "successful",
      transactionId: `ATX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      message: "Purchase completed successfully.",
    };

    setResult(mockResult);
    setIsSubmitting(false);
    setStep("result");
  };

  const handleRetry = () => {
    setStep("form");
    setResult(null);
    setIsSubmitting(false);
  };

  // Escape key closes modal
  useEffect(() => {
    if (!selectedProduct) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  // Focus close button when modal opens
  useEffect(() => {
    if (selectedProduct && step === "form") {
      const timeout = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [selectedProduct, step]);

  // Compute total amount for summary
  const getTotalAmount = () => {
    if (selectedProduct?.id === "custom") {
      const amount = Number(formData["amount"] || 0);
      return amount;
    }
    return selectedProduct?.price || 0;
  };

  return (
    <div>
      {/* Network filter for services with multiple networks */}
      {networks.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {networks.map((network) => (
            <button
              key={network}
              type="button"
              onClick={() => setSelectedNetwork(network)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selectedNetwork === network
                  ? "bg-brand-800 text-white"
                  : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {network}
            </button>
          ))}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {catalog.productHeading}
        </h2>
      </div>

      <AtlasGrid cols={3} gap={6}>
        {filteredProducts.map((product) => (
          <ServiceProductCard
            key={product.id}
            product={product}
            onBuy={openPurchase}
          />
        ))}

        {/* Custom amount card */}
        {catalog.allowCustomAmount && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/50 p-6 dark:border-brand-700 dark:bg-brand-900/20">
            <ServiceIcon name={catalog.icon} className="h-8 w-8 text-brand-800 dark:text-brand-300" />
            <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {catalog.customAmountLabel || "Custom Amount"}
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openCustomAmount}
            >
              Buy Custom Amount
            </Button>
          </div>
        )}
      </AtlasGrid>

      {/* Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/40 p-0 dark:bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-modal-title"
        >
          <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-lg bg-white shadow-xl dark:bg-neutral-900 sm:rounded-lg">
            {step === "form" && (
              <>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2
                    id="purchase-modal-title"
                    className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    {selectedProduct.id === "custom"
                      ? `Buy ${catalog.name}`
                      : `Buy ${selectedProduct.name}`}
                  </h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeModal}
                    className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
                    aria-label="Close purchase modal"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {selectedProduct.id === "custom"
                          ? catalog.name
                          : selectedProduct.name}
                      </span>
                      {selectedProduct.id !== "custom" && (
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {selectedProduct.currency}{" "}
                          {selectedProduct.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {selectedProduct.network && (
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Network: {selectedProduct.network}
                      </p>
                    )}
                    {selectedProduct.validity && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Valid for {selectedProduct.validity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {catalog.fields.map((field) => (
                      <div key={field.name}>
                        {field.type === "select" ? (
                          <div>
                            <label
                              htmlFor={field.name}
                              className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                            >
                              {field.label}
                            </label>
                            <select
                              id={field.name}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                updateField(field.name, e.target.value)
                              }
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
                              <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
                                {errors[field.name]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <AtlasInput
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) =>
                              updateField(field.name, e.target.value)
                            }
                            error={errors[field.name]}
                          />
                        )}
                      </div>
                    ))}

                    {/* Custom amount input */}
                    {selectedProduct.id === "custom" && (
                      <AtlasInput
                        label="Amount (GHS)"
                        type="number"
                        placeholder="Enter amount"
                        value={formData["amount"] || ""}
                        onChange={(e) =>
                          updateField("amount", e.target.value)
                        }
                        error={errors["amount"]}
                      />
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleFormSubmit}>
                      Buy
                    </Button>
                  </div>
                </div>
              </>
            )}

            {step === "confirmation" && (
              <>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                  <h2
                    id="purchase-modal-title"
                    className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    Confirm Purchase
                  </h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeModal}
                    className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
                    aria-label="Close confirmation"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4 rounded-md bg-neutral-50 p-4 dark:bg-neutral-800">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Service
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {catalog.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Product
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedProduct.id === "custom"
                            ? "Custom Amount"
                            : selectedProduct.name}
                        </span>
                      </div>
                      {selectedProduct.network && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Network
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {selectedProduct.network}
                          </span>
                        </div>
                      )}
                      {catalog.fields.map((field) => (
                        <div
                          key={field.name}
                          className="flex justify-between"
                        >
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {field.label}
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {formData[field.name] || "—"}
                          </span>
                        </div>
                      ))}
                      {selectedProduct.id === "custom" && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Amount
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            GHS {formData["amount"] || "0"}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total
                          </span>
                          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {selectedProduct.currency}{" "}
                            {getTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to continue?
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("form")}
                    >
                      Go Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                    >
                      Confirm Purchase
                    </Button>
                  </div>
                </div>
              </>
            )}

            {step === "processing" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                  <svg
                    className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Processing purchase...
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Please wait while we complete your transaction.
                </p>
              </div>
            )}

            {step === "result" && result && (
              <div className="p-8 text-center">
                {result.status === "successful" && (
                  <>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Purchase Successful
                    </h3>
                  </>
                )}
                {result.status === "pending" && (
                  <>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Purchase Processing
                    </h3>
                  </>
                )}
                {result.status === "failed" && (
                  <>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Purchase Failed
                    </h3>
                  </>
                )}

                {result.transactionId && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Transaction ID: {result.transactionId}
                  </p>
                )}

                <div className="mt-6 flex gap-3">
                  <Button className="flex-1" onClick={closeModal}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}