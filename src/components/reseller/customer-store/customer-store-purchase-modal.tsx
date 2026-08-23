/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { CustomerStoreProduct } from "./customer-store";
import { AtlasIcon } from "@/components/atlas/icons";

type Props = {
  open: boolean;
  product: CustomerStoreProduct;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  phoneNumber: string;
  customerName: string;
  meterNumber: string;
  smartCardNumber: string;
};

export function CustomerStorePurchaseModal({
  open,
  product,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>({
    phoneNumber: "",
    customerName: "",
    meterNumber: "",
    smartCardNumber: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm({
      phoneNumber: "",
      customerName: "",
      meterNumber: "",
      smartCardNumber: "",
    });

    setError("");
    setSubmitting(false);
  }, [open, product.id]);

  if (!open) {
    return null;
  }

  const isElectricity = product.category === "electricity";
  const isTv = product.category === "tv";

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    if (isElectricity) {
      if (!form.meterNumber.trim()) {
        return "Enter the meter number.";
      }
    } else if (isTv) {
      if (!form.smartCardNumber.trim()) {
        return "Enter the smart card or IUC number.";
      }
    } else if (!form.phoneNumber.trim()) {
      return "Enter the phone number.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    /*
     * Temporary mock purchase request.
     *
     * Replace this with the real Atlas customer-store purchase endpoint.
     */
    await new Promise((resolve) => setTimeout(resolve, 700));

    setSubmitting(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close purchase dialog"
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-title"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl dark:bg-neutral-950 sm:max-w-lg sm:rounded-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div>
            <p className="text-xs font-medium text-brand-700 dark:text-brand-300">
              Purchase
            </p>

            <h2
              id="purchase-title"
              className="mt-0.5 text-lg font-bold text-neutral-950 dark:text-white"
            >
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Close"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Product Summary */}
          <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Product
                </p>

                <p className="mt-1 text-sm font-semibold text-neutral-950 dark:text-white">
                  {product.name}
                </p>

                {product.network && (
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {product.network}
                  </p>
                )}
              </div>

              <p className="text-lg font-bold text-brand-800 dark:text-brand-300">
                GHS {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Customer details
            </h3>

            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Enter the details required to deliver this service.
            </p>

            <div className="mt-4 space-y-4">
              {isElectricity ? (
                <>
                  <Field
                    label="Meter Number"
                    placeholder="Enter meter number"
                    value={form.meterNumber}
                    onChange={(value) =>
                      updateField("meterNumber", value)
                    }
                  />

                  <Field
                    label="Customer Name"
                    placeholder="Optional"
                    value={form.customerName}
                    onChange={(value) =>
                      updateField("customerName", value)
                    }
                  />
                </>
              ) : isTv ? (
                <>
                  <Field
                    label="Smart Card / IUC Number"
                    placeholder="Enter smart card number"
                    value={form.smartCardNumber}
                    onChange={(value) =>
                      updateField("smartCardNumber", value)
                    }
                  />

                  <Field
                    label="Customer Name"
                    placeholder="Optional"
                    value={form.customerName}
                    onChange={(value) =>
                      updateField("customerName", value)
                    }
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Phone Number"
                    placeholder="024 XXX XXXX"
                    value={form.phoneNumber}
                    onChange={(value) =>
                      updateField("phoneNumber", value)
                    }
                    type="tel"
                  />

                  <Field
                    label="Customer Name"
                    placeholder="Optional"
                    value={form.customerName}
                    onChange={(value) =>
                      updateField("customerName", value)
                    }
                  />
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900/50 dark:bg-danger-950/30 dark:text-danger-300">
              {error}
            </div>
          )}

          {/* Continue */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </>
            ) : (
              <>
                Continue
                <AtlasIcon name="arrow-right" className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] leading-5 text-neutral-500 dark:text-neutral-400">
            By continuing, you confirm that the information provided is
            correct.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
      />
    </div>
  );
}