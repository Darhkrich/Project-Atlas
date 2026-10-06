"use client";

import { CategoryPicker } from "@/components/merchant/categories/category-picker";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import { cn } from "@/lib/utils";
import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
} from "@/lib/merchant/products/constants";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "@/lib/merchant/products/forms/types";
import { ProductImageStrip } from "./product-image-strip";

interface ProductFormBasicProps {
  storeSlug: string;
  values: ProductFormValues;
  errors: ProductFormErrors;
  categories: MerchantCategory[];
  categoryCounts: Record<string, number>;
  imageBusy: boolean;
  imageError: string | null;
  updateField: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => void;
  onAddImage: (file: File) => void;
  onRemoveImage: (index: number) => void;
}

export function ProductFormBasic({
  storeSlug,
  values,
  errors,
  categories,
  categoryCounts,
  imageBusy,
  imageError,
  updateField,
  onAddImage,
  onRemoveImage,
}: ProductFormBasicProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Basic information
      </h2>

      <div className="mt-5 space-y-5">
        <ProductImageStrip
          images={values.images}
          onAdd={onAddImage}
          onRemove={onRemoveImage}
          error={imageError}
          busy={imageBusy}
        />

        <div>
          <label
            htmlFor="product-name"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Product name <span className="text-danger-500">*</span>
          </label>
          <input
            id="product-name"
            value={values.name}
            maxLength={PRODUCT_NAME_MAX_LENGTH}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Vitamin C Face Serum"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "product-name-error" : undefined}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
              errors.name
                ? "border-danger-500 focus:ring-danger-200"
                : "border-neutral-300 focus:border-brand-500 focus:ring-brand-200 dark:border-neutral-700"
            )}
          />
          {errors.name && (
            <p
              id="product-name-error"
              className="mt-1 text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Description
          </label>
          <textarea
            id="product-description"
            value={values.description}
            maxLength={PRODUCT_DESCRIPTION_MAX_LENGTH}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            placeholder="Describe the product..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {values.description.length} / {PRODUCT_DESCRIPTION_MAX_LENGTH}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Category <span className="text-danger-500">*</span>
          </label>
          <CategoryPicker
            storeSlug={storeSlug}
            value={values.categoryId}
            onChange={(id) => updateField("categoryId", id)}
            categories={categories}
            productCounts={categoryCounts}
            error={errors.categoryId ?? null}
          />
        </div>
      </div>
    </div>
  );
}