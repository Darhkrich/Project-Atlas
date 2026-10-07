/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import type { PaymentMethod } from "@/lib/payment-methods";

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

export type PaymentFlowSavedMethod = {
  id: string;
  methodId: string;
  label: string;
  maskedSummary: string;
  fieldValues: Record<string, string>;
  tokenRef?: string;
};

export type PaymentFlowSubmitInput = {
  methodId: string;
  methodName: string;
  amount: number;
  formData: Record<string, string>;
  savedMethodId?: string;
  tokenRef?: string;
};

export type PaymentFlowSaveInput = {
  methodId: string;
  label: string;
  details: Record<string, string>;
};

interface PaymentFlowModalProps {
  open: boolean;
  mode: "fund" | "purchase";
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
  savedMethods?: PaymentFlowSavedMethod[];
  onSaveMethod?: (input: PaymentFlowSaveInput) => void;
  onSubmit?: (input: PaymentFlowSubmitInput) => Promise<PaymentFlowResult>;
  onClose: () => void;
  onSuccess?: (result: PaymentFlowResult) => void;
  onFailed?: (result: PaymentFlowResult) => void;
}

const DEFAULT_OUTCOME_DELAY_MS = 1200;

type SelectedSaved = {
  id: string;
  label: string;
  maskedSummary: string;
  tokenRef?: string;
};

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
  savedMethods = [],
  onSaveMethod,
  onSubmit,
  onClose,
  onSuccess,
  onFailed,
}: PaymentFlowModalProps) {
  const [step, setStep] = useState<PaymentFlowStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [selectedSaved, setSelectedSaved] = useState<SelectedSaved | null>(
    null
  );
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentFlowResult | null>(null);
  const [saveMethod, setSaveMethod] = useState(false);

  const defaultOutcomeTimer = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (defaultOutcomeTimer.current !== null) {
        window.clearTimeout(defaultOutcomeTimer.current);
        defaultOutcomeTimer.current = null;
      }
    };
  }, []);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
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
    setSelectedSaved(null);
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
    setResult(null);
    setSaveMethod(false);
  }, [open, initialMethod, showAmountInput]);

  const effectiveAmount = showAmountInput
    ? parseFloat(formData.amount || "0")
    : amount || 0;

  const safeEffectiveAmount = Number.isFinite(effectiveAmount)
    ? effectiveAmount
    : 0;

  const pointsRequired =
    selectedMethod?.id === "atlas_points"
      ? Math.ceil(safeEffectiveAmount / pointsConversionRate)
      : 0;

  const insufficientPoints =
    selectedMethod?.id === "atlas_points" &&
    atlasPointsBalance < pointsRequired;

  const selectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setSelectedSaved(null);
    setFormData({});
    setErrors({});
    setSaveMethod(false);
    if (method.fields.length === 0 && !showAmountInput) {
      setStep("confirmation");
    } else {
      setStep("form");
    }
  };

  const selectSavedMethod = (saved: PaymentFlowSavedMethod) => {
    const method = methods.find((m) => m.id === saved.methodId);
    if (!method) return;
    setSelectedMethod(method);
    setSelectedSaved({
      id: saved.id,
      label: saved.label,
      maskedSummary: saved.maskedSummary,
      tokenRef: saved.tokenRef,
    });
    setErrors({});
    setSaveMethod(false);

    const prefilled: Record<string, string> = { ...saved.fieldValues };
    if (showAmountInput) prefilled.amount = "";
    setFormData(prefilled);

    const hasToken = Boolean(saved.tokenRef);
    const fieldsSatisfied = method.fields.every(
      (f) => !f.required || prefilled[f.name] || hasToken
    );
    const needsForm = showAmountInput || !fieldsSatisfied;
    setStep(needsForm ? "form" : "confirmation");
  };

  const clearSaved = () => {
    setSelectedSaved(null);
    setFormData({});
    setErrors({});
    setStep("method");
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (showAmountInput) {
      const v = Number(formData.amount);
      if (!formData.amount || !Number.isFinite(v) || v <= 0) {
        newErrors.amount = "Enter a valid amount.";
      }
    }
    if (selectedMethod && !selectedSaved?.tokenRef) {
      selectedMethod.fields.forEach((field) => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = field.label + " is required.";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) setStep("confirmation");
  };

  const runDefaultOutcome = (): Promise<PaymentFlowResult> =>
    new Promise((resolve) => {
      if (defaultOutcomeTimer.current !== null) {
        window.clearTimeout(defaultOutcomeTimer.current);
      }
      defaultOutcomeTimer.current = window.setTimeout(() => {
        defaultOutcomeTimer.current = null;
        resolve({ status: "success", message: successMessage });
      }, DEFAULT_OUTCOME_DELAY_MS);
    });

  const handleConfirm = async () => {
    if (insufficientPoints || !selectedMethod) return;
    setIsSubmitting(true);
    setStep("processing");

    let outcome: PaymentFlowResult;
    try {
      outcome = onSubmit
        ? await onSubmit({
            methodId: selectedMethod.id,
            methodName: selectedMethod.name,
            amount: safeEffectiveAmount,
            formData,
            savedMethodId: selectedSaved?.id,
            tokenRef: selectedSaved?.tokenRef,
          })
        : await runDefaultOutcome();
    } catch (err) {
      outcome = {
        status: "failed",
        message: err instanceof Error ? err.message : failureMessage,
      };
    }

    if (!mountedRef.current) return;

    if (
      outcome.status === "success" &&
      saveMethod &&
      selectedMethod.fields.length > 0 &&
      onSaveMethod &&
      !selectedSaved
    ) {
      const details: Record<string, string> = {};
      for (const field of selectedMethod.fields) {
        details[field.name] = formData[field.name] || "";
      }
      onSaveMethod({
        methodId: selectedMethod.id,
        label: selectedMethod.name,
        details,
      });
    }

    setResult(outcome);
    setStep("result");
    setIsSubmitting(false);

    if (outcome.status === "success" && onSuccess) onSuccess(outcome);
    if (outcome.status === "failed" && onFailed) onFailed(outcome);
  };

  if (!open) return null;

  const modalTitle = title || (mode === "fund" ? "Fund Wallet" : "Payment");

  const submitText =
    submitLabel || (mode === "fund" ? "Fund Wallet" : "Pay");

  const availableSavedMethods = savedMethods.filter((saved) =>
    methods.some((m) => m.id === saved.methodId)
  );

  const usingSavedToken = Boolean(selectedSaved?.tokenRef);

  return (
    <AtlasModalShell
      open={open}
      onClose={close}
      title={
        step === "confirmation"
          ? "Confirm " + modalTitle
          : step === "form" && selectedMethod
          ? modalTitle + " - " + selectedMethod.name
          : modalTitle
      }
      description={step === "method" ? "Select a payment method" : undefined}
    >
      {step === "method" && (
        <div className="space-y-3">
          {availableSavedMethods.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Saved methods
              </p>
              <ul role="list" className="space-y-2">
                {availableSavedMethods.map((saved) => (
                  <li key={saved.id}>
                    <button
                      type="button"
                      onClick={() => selectSavedMethod(saved)}
                      className="flex w-full items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-left transition-colors hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-brand-800 dark:bg-brand-900/30 dark:hover:bg-brand-900/50"
                    >
                      <AtlasIcon
                        name="star"
                        className="h-5 w-5 text-brand-800 dark:text-brand-300"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {saved.label}
                        </p>
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {saved.maskedSummary}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul role="list" className="space-y-2">
            {methods.map((method) => (
              <li key={method.id}>
                <button
                  type="button"
                  onClick={() => selectMethod(method)}
                  className="flex w-full items-center gap-4 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-neutral-950"
                >
                  <div
                    className={
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                      method.bgClass
                    }
                  >
                    <AtlasIcon
                      name={method.icon}
                      className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {method.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {method.description}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === "form" && selectedMethod && (
        <div className="space-y-4">
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}

          {usingSavedToken && selectedSaved && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-900/30">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paying with
              </p>
              <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {selectedSaved.label} {selectedSaved.maskedSummary}
              </p>
              <button
                type="button"
                onClick={clearSaved}
                className="mt-1 text-xs font-medium text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              >
                Use a different method
              </button>
            </div>
          )}

          {!usingSavedToken &&
            selectedMethod.fields.map((field) => (
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
              label={"Amount (GH\u20B5)"}
              type="number"
              placeholder="0.00"
              value={formData.amount || amount?.toString() || ""}
              onChange={(e) => updateField("amount", e.target.value)}
              error={errors.amount}
            />
          )}

          {!usingSavedToken &&
            selectedMethod.fields.length > 0 &&
            onSaveMethod && (
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

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("method")}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "confirmation" && selectedMethod && (
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Method
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedMethod.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Amount
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {"GH\u20B5 "}
                  {safeEffectiveAmount.toFixed(2)}
                </span>
              </div>
              {selectedMethod.id === "atlas_points" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Points required
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {pointsRequired}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Your balance
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {atlasPointsBalance} points
                    </span>
                  </div>
                </>
              )}
            </div>

            {usingSavedToken && selectedSaved && (
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Paying with
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedSaved.label} {selectedSaved.maskedSummary}
                </span>
              </div>
            )}

            {!usingSavedToken &&
              Object.entries(formData).map(([key, value]) => {
                if (key === "amount") return null;
                const field = selectedMethod.fields.find(
                  (f) => f.name === key
                );
                return (
                  <div key={key} className="mt-2 flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {field?.label ?? key}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {value}
                    </span>
                  </div>
                );
              })}
          </div>

          {insufficientPoints && (
            <p
              role="alert"
              className="text-sm text-danger-600 dark:text-danger-400"
            >
              Insufficient Atlas Points.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("form")}
            >
              Go back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={isSubmitting || insufficientPoints}
              aria-busy={isSubmitting}
            >
              {submitText}
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <svg
              className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400"
              viewBox="0 0 24 24"
              fill="none"
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
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Processing...
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div className="p-6 text-center">
          <div
            className={
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full " +
              (result.status === "success"
                ? "bg-success-100 dark:bg-success-900"
                : "bg-danger-100 dark:bg-danger-900")
            }
          >
            <AtlasIcon
              name={result.status === "success" ? "check" : "x-circle"}
              className={
                "h-8 w-8 " +
                (result.status === "success"
                  ? "text-success-700 dark:text-success-300"
                  : "text-danger-700 dark:text-danger-300")
              }
              aria-hidden="true"
            />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {result.status === "success" ? "Success" : "Failed"}
          </h3>
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            {result.message}
          </p>
          <div className="mt-6">
            <Button className="w-full" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      )}
    </AtlasModalShell>
  );
}