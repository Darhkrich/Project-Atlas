/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { cn } from "@/lib/utils";
import type { Discount } from "@/types/merchant-storefront";

interface DiscountFormModalProps {
  open: boolean;
  onClose: () => void;
  existing: Discount | null;
  existingCodes: string[];
  onSubmit: (input: Omit<Discount, "id" | "usedCount">) => void;
}

interface FormState {
  code: string;
  type: Discount["type"];
  value: string;
  minOrderValue: string;
  maxUses: string;
  expiresDate: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  type: "percent",
  value: "",
  minOrderValue: "",
  maxUses: "",
  expiresDate: "",
  enabled: true,
};

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

function toDateInputValue(ts: number | undefined): string {
  if (typeof ts !== "number") return "";
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function fromDateInputValue(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  const parts = trimmed.split("-").map(Number);
  if (parts.length !== 3) return undefined;
  const [y, m, d] = parts;
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return undefined;
  }
  return Date.UTC(y, m - 1, d);
}

function formFromExisting(discount: Discount): FormState {
  return {
    code: discount.code,
    type: discount.type,
    value: String(discount.value),
    minOrderValue:
      discount.minOrderValue !== undefined ? String(discount.minOrderValue) : "",
    maxUses: discount.maxUses !== undefined ? String(discount.maxUses) : "",
    expiresDate: toDateInputValue(discount.expiresAt),
    enabled: discount.enabled,
  };
}

export function DiscountFormModal({
  open,
  onClose,
  existing,
  existingCodes,
  onSubmit,
}: DiscountFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(existing ? formFromExisting(existing) : EMPTY_FORM);
    setError(null);
  }, [open, existing]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleCodeChange(raw: string) {
    const cleaned = raw.replace(/\s+/g, "").toUpperCase();
    setField("code", cleaned);
  }

  function handleSubmit() {
    const code = form.code.trim();
    if (code.length < 3 || code.length > 20) {
      setError("Code must be 3 to 20 characters.");
      return;
    }
    const candidate = code.toLowerCase();
    const clash = existingCodes.some((c) => c.toLowerCase() === candidate);
    if (clash) {
      setError("A code with that name already exists.");
      return;
    }

    const valueNum = Number.parseFloat(form.value);
    if (!Number.isFinite(valueNum) || valueNum <= 0) {
      setError("Enter a discount value.");
      return;
    }
    if (form.type === "percent" && (valueNum < 1 || valueNum > 100)) {
      setError("Percentage must be between 1 and 100.");
      return;
    }
    if (form.type === "fixed" && valueNum > 100000) {
      setError("Fixed amount is too large.");
      return;
    }

    const minOrder = form.minOrderValue.trim()
      ? Number.parseFloat(form.minOrderValue)
      : undefined;
    if (minOrder !== undefined) {
      if (!Number.isFinite(minOrder) || minOrder < 0) {
        setError("Minimum order value is invalid.");
        return;
      }
    }

    const maxUses = form.maxUses.trim()
      ? Number.parseInt(form.maxUses, 10)
      : undefined;
    if (maxUses !== undefined) {
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        setError("Maximum uses must be at least 1.");
        return;
      }
    }

    const expiresAt = fromDateInputValue(form.expiresDate);

    onSubmit({
      code,
      type: form.type,
      value: valueNum,
      minOrderValue: minOrder,
      maxUses,
      expiresAt,
      enabled: form.enabled,
    });
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={existing ? "Edit discount" : "New discount"}
      description={
        existing
          ? existing.code
          : "Customers enter this code at checkout."
      }
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="discount-code"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Code
          </label>
          <input
            id="discount-code"
            type="text"
            value={form.code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="e.g. WELCOME10"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            className={cn(inputClass, "font-mono uppercase")}
          />
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Letters and numbers. No spaces. Customers type this exactly.
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Discount type
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setField("type", "percent")}
              aria-pressed={form.type === "percent"}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition",
                form.type === "percent"
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
              )}
            >
              Percentage
            </button>
            <button
              type="button"
              onClick={() => setField("type", "fixed")}
              aria-pressed={form.type === "fixed"}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition",
                form.type === "fixed"
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
              )}
            >
              {"Fixed amount (GH\u20B5)"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="discount-value"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            {form.type === "percent" ? "Percentage off" : "Amount off (GH\u20B5)"}
          </label>
          <input
            id="discount-value"
            type="number"
            inputMode="decimal"
            min={form.type === "percent" ? 1 : 0.01}
            max={form.type === "percent" ? 100 : 100000}
            step={form.type === "percent" ? 1 : 0.01}
            value={form.value}
            onChange={(e) => setField("value", e.target.value)}
            placeholder={form.type === "percent" ? "10" : "20.00"}
            className={inputClass}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="discount-min"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Minimum order (optional)
            </label>
            <input
              id="discount-min"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.minOrderValue}
              onChange={(e) => setField("minOrderValue", e.target.value)}
              placeholder={"GH\u20B5"}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="discount-max"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Maximum uses (optional)
            </label>
            <input
              id="discount-max"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={form.maxUses}
              onChange={(e) => setField("maxUses", e.target.value)}
              placeholder="Unlimited"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="discount-expires"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Expires (optional)
          </label>
          <input
            id="discount-expires"
            type="date"
            value={form.expiresDate}
            onChange={(e) => setField("expiresDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setField("enabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Active
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Inactive codes are saved but cannot be used.
            </span>
          </span>
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
          >
            {error}
          </div>
        )}

        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          Codes are validated when a customer checks out on this device.
          Backend validation is coming.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {existing ? "Save changes" : "Create discount"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}