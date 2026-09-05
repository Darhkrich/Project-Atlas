/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import type { PaymentMethod } from "@/lib/payment-methods";
import { useSavedPaymentMethods } from "@/contexts/SavedPaymentMethodsContext";

export type PaymentFlowStep =
  | "method"
  | "form"
  | "confirmation"
  | "processing"
  | "result";

export type PaymentFlowResult = {
  status: "success" | "failed";
  message: string;  
};

interface PaymentFlowModalProps {
  open: boolean;
  mode: "fund" | "withdraw" | "purchase";
  title?: string;
  amount?: number;
  showAmountInput?: boolean;
  methods: PaymentMethod[];
  initialMethod?: PaymentMethod | null;
  description?: string;
  submitLabel?: string;
  successMessage?: string;
  failureMessage?: string;
  atlasPointsBalance?: number;
  pointsConversionRate?: number;
  onClose: () => void;
  onSuccess?: (result: PaymentFlowResult) => void;
  onFailed?: (result: PaymentFlowResult) => void;
}

export function PaymentFlowModal({
  open,
  mode,
  title,
  amount,
  showAmountInput = mode !== "purchase",
  methods,
  initialMethod = null,
  description,
  submitLabel,
  successMessage = "Payment completed successfully.",
  failureMessage = "Payment could not be completed.",
  atlasPointsBalance = 0,
  pointsConversionRate = 0.05,
  onClose,
  onSuccess,
  onFailed,
}: PaymentFlowModalProps) {
  const [step, setStep] = useState<PaymentFlowStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentFlowResult | null>(null);
  const [saveMethod, setSaveMethod] = useState(false);

  const { savedMethods, addSavedMethod, isMethodSaved } = useSavedPaymentMethods();

  useEffect(() => {
    if (open) {
      if (initialMethod) {
        setSelectedMethod(initialMethod);
        if (initialMethod.fields.length === 0 && !showAmountInput) {
          setStep("confirmation");
        } else {
          setStep("form");
        }
      } else {
        setSelectedMethod(null);
        setStep("method");
      }
      setFormData({});
      setErrors({});
      setIsSubmitting(false);
      setResult(null);
      setSaveMethod(false);
    }
  }, [open, initialMethod, showAmountInput]);

  const effectiveAmount = showAmountInput
    ? parseFloat(formData.amount || "0")
    : amount || 0;

  const pointsRequired =
    selectedMethod?.id === "atlas_points"
      ? Math.ceil(effectiveAmount / pointsConversionRate)
      : 0;

  const insufficientPoints =
    selectedMethod?.id === "atlas_points" && atlasPointsBalance < pointsRequired;

  const close = () => {
    onClose();
  };

  const selectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData({});
    setErrors({});
    setSaveMethod(false);
    if (method.fields.length === 0 && !showAmountInput) {
      setStep("confirmation");
    } else {
      setStep("form");
    }
  };

  const selectSavedMethod = (saved: {
    methodId: string;
    label: string;
    details: Record<string, string>;
  }) => {
    const method = methods.find((m) => m.id === saved.methodId);
    if (!method) return;
    setSelectedMethod(method);
    setFormData({ ...saved.details, ...(showAmountInput ? { amount: "" } : {}) });
    setErrors({});
    setStep("form");
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (showAmountInput && (!formData.amount || Number(formData.amount) <= 0)) {
      newErrors.amount = "Enter a valid amount.";
    }
    if (selectedMethod) {
      selectedMethod.fields.forEach((field) => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required.`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setStep("confirmation");
    }
  };

  const handleConfirm = () => {
    if (insufficientPoints) return;
    setIsSubmitting(true);
    setStep("processing");
    setTimeout(() => {
      const success = true;
      const newResult: PaymentFlowResult = {
        status: success ? "success" : "failed",
        message: success ? successMessage : failureMessage,
      };
      // Save method if requested
      if (success && saveMethod && selectedMethod && selectedMethod.fields.length > 0) {
        addSavedMethod(
          selectedMethod.id,
          selectedMethod.name,
          selectedMethod.fields.reduce((acc, field) => {
            acc[field.name] = formData[field.name] || "";
            return acc;
          }, {} as Record<string, string>),
        );
      }
      setResult(newResult);
      setStep("result");
      setIsSubmitting(false);
      if (success && onSuccess) onSuccess(newResult);
      if (!success && onFailed) onFailed(newResult);
    }, 1500);
  };

  if (!open) return null;

  const modalTitle =
    title ||
    (mode === "fund" ? "Fund Wallet" : mode === "withdraw" ? "Withdraw" : "Payment");

  const submitText =
    submitLabel ||
    (mode === "fund" ? "Fund Wallet" : mode === "withdraw" ? "Withdraw" : "Pay");

  // Saved methods filtered by available methods
  const availableSavedMethods = savedMethods.filter((saved) =>
    methods.some((m) => m.id === saved.methodId),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
        {/* Method Selection Step */}
        {step === "method" && (
          <>
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{modalTitle}</h2>
              <button onClick={close} className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" aria-label="Close">
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">Select a payment method</p>
              {availableSavedMethods.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Saved methods
                  </p>
                  <div className="space-y-2">
                    {availableSavedMethods.map((saved) => (
                      <button
                        key={saved.id}
                        onClick={() => selectSavedMethod({ methodId: saved.methodId, label: saved.label, details: saved.details })}
                        className="flex w-full items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-left transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/30 dark:hover:bg-brand-900/50"
                      >
                        <AtlasIcon name="star" className="h-5 w-5 text-brand-800 dark:text-brand-300" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{saved.label}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {Object.values(saved.details).join(" • ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => selectMethod(method)}
                    className="flex w-full items-center gap-4 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-neutral-950"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${method.bgClass}`}>
                      <AtlasIcon name={method.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{method.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Form Step */}
        {step === "form" && selectedMethod && (
          <>
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {modalTitle} — {selectedMethod.name}
              </h2>
              <button onClick={close} className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" aria-label="Close">
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {description && <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>}
                {selectedMethod.fields.map((field) => (
                  <AtlasInput
                    key={field.name}
                    label={field.label}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    error={errors[field.name]}
                  />
                ))}
                {showAmountInput && (
                  <AtlasInput
                    label="Amount (GHS)"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount || amount?.toString() || ""}
                    onChange={(e) => updateField("amount", e.target.value)}
                    error={errors.amount}
                  />
                )}
                {selectedMethod.fields.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={saveMethod}
                      onChange={(e) => setSaveMethod(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-800 focus:ring-brand-500"
                    />
                    Save this payment method for future use
                  </label>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("method")}>Back</Button>
                <Button className="flex-1" onClick={handleContinue}>Continue</Button>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Step */}
        {step === "confirmation" && selectedMethod && (
          <>
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Confirm {modalTitle}
              </h2>
              <button onClick={close} className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" aria-label="Close">
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Method</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedMethod.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">GHS {effectiveAmount.toFixed(2)}</span>
                  </div>
                  {selectedMethod.id === "atlas_points" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Points Required</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{pointsRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Your Balance</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{atlasPointsBalance} points</span>
                      </div>
                    </>
                  )}
                  {insufficientPoints && (
                    <p className="text-sm text-danger-600 dark:text-danger-400">Insufficient Atlas Points.</p>
                  )}
                </div>
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="mt-2 flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{key === "amount" ? "Amount" : key}</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Go Back</Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={isSubmitting || insufficientPoints}>
                  {submitText}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Processing and Result steps remain same as previous */}
        {step === "processing" && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <svg className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Processing...</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Please wait while we process your request.</p>
          </div>
        )}

        {step === "result" && result && (
          <div className="p-8 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${result.status === "success" ? "bg-success-100 dark:bg-success-900" : "bg-danger-100 dark:bg-danger-900"}`}>
              <AtlasIcon name={result.status === "success" ? "check" : "x-circle"} className={`h-8 w-8 ${result.status === "success" ? "text-success-700 dark:text-success-300" : "text-danger-700 dark:text-danger-300"}`} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{result.status === "success" ? "Success!" : "Failed"}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{result.message}</p>
            <div className="mt-6">
              <Button className="w-full" onClick={close}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}