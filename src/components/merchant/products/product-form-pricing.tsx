"use client";

import { cn } from "@/lib/utils";
import {
  PRODUCT_PRICE_MAX,
  PRODUCT_SKU_MAX_LENGTH,
} from "@/lib/merchant/products/constants";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "@/lib/merchant/products/forms/types";

interface ProductFormPricingProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  updateField: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => void;
}

function fieldClass(hasError: boolean): string {
  return cn(
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
    hasError
      ? "border-danger-500 focus:ring-danger-200"
      : "border-neutral-300 focus:border-brand-500 focus:ring-brand-200 dark:border-neutral-700"
  );
}

export function ProductFormPricing({
  values,
  errors,
  updateField,
}: ProductFormPricingProps) {
  const price = Number.parseFloat(values.price);
  const sale = Number.parseFloat(values.salePrice);
  const saleAbovePrice =
    values.salePrice.trim().length > 0 &&
    Number.isFinite(price) &&
    Number.isFinite(sale) &&
    sale >= price;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Pricing and inventory
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="product-price"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {"Price (GH\u20B5) "}
            <span className="text-danger-500">*</span>
          </label>
          <input
            id="product-price"
            type="number"
            inputMode="decimal"
            min="0"
            max={PRODUCT_PRICE_MAX}
            step="0.01"
            value={values.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="0.00"
            aria-invalid={errors.price ? "true" : undefined}
            aria-describedby={errors.price ? "product-price-error" : undefined}
            className={fieldClass(Boolean(errors.price))}
          />
          {errors.price && (
            <p
              id="product-price-error"
              className="mt-1 text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-sale-price"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Sale price (optional)
          </label>
          <input
            id="product-sale-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.salePrice}
            onChange={(e) => updateField("salePrice", e.target.value)}
            placeholder="0.00"
            aria-invalid={errors.salePrice ? "true" : undefined}
            aria-describedby={
              errors.salePrice ? "product-sale-price-error" : undefined
            }
            className={fieldClass(Boolean(errors.salePrice) || saleAbovePrice)}
          />
          {errors.salePrice && (
            <p
              id="product-sale-price-error"
              className="mt-1 text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.salePrice}
            </p>
          )}
          {!errors.salePrice && saleAbovePrice && (
            <p className="mt-1 text-xs text-warning-600 dark:text-warning-400">
              Sale price is higher than the regular price.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-stock"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Stock level <span className="text-danger-500">*</span>
          </label>
          <input
            id="product-stock"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.stockLevel}
            onChange={(e) => updateField("stockLevel", e.target.value)}
            placeholder="0"
            aria-invalid={errors.stockLevel ? "true" : undefined}
            aria-describedby={
              errors.stockLevel ? "product-stock-error" : undefined
            }
            className={fieldClass(Boolean(errors.stockLevel))}
          />
          {errors.stockLevel && (
            <p
              id="product-stock-error"
              className="mt-1 text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.stockLevel}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-sku"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            SKU
          </label>
          <input
            id="product-sku"
            value={values.sku}
            maxLength={PRODUCT_SKU_MAX_LENGTH}
            onChange={(e) => updateField("sku", e.target.value)}
            placeholder="Auto-generated"
            aria-invalid={errors.sku ? "true" : undefined}
            aria-describedby="product-sku-hint"
            className={fieldClass(Boolean(errors.sku))}
          />
          <p
            id="product-sku-hint"
            className="mt-1 text-xs text-neutral-500 dark:text-neutral-400"
          >
            Auto-generated when the product is Active. Edit if you use your own
            SKUs.
          </p>
          {errors.sku && (
            <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
              {errors.sku}
            </p>
          )}
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => updateField("featured", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
        />
        <span>
          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Feature this product
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            Featured products appear on your storefront home page.
          </span>
        </span>
      </label>
    </div>
  );
}