"use client";

import { useProductForm } from "@/lib/merchant/products/forms/use-product-form";
import type { ProductFormMode } from "@/lib/merchant/products/forms/types";
import type { MerchantProductDetail } from "@/lib/merchant/products/types";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import { ProductFormBasic } from "./product-form-basic";
import { ProductFormPricing } from "./product-form-pricing";
import { ProductFormStatus } from "./product-form-status";
import { ProductFormActions } from "./product-form-actions";

interface ProductFormProps {
  mode: ProductFormMode;
  storeSlug: string;
  initial: MerchantProductDetail | null;
  categories: MerchantCategory[];
  categoryCounts: Record<string, number>;
  onSaved: (productId: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ProductForm({
  mode,
  storeSlug,
  initial,
  categories,
  categoryCounts,
  onSaved,
  onCancel,
  onDelete,
}: ProductFormProps) {
  const form = useProductForm({
    mode,
    storeSlug,
    initial: initial
      ? {
          id: initial.id,
          name: initial.name,
          description: initial.description,
          categoryId: initial.categoryId,
          price: initial.price,
          salePrice: initial.salePrice,
          stockLevel: initial.stockLevel,
          sku: initial.sku,
          status: initial.status,
          featured: initial.featured,
          images: initial.images,
        }
      : null,
  });

  const handleSubmit = () => {
    const result = form.submit();
    if (result.ok && result.productId) {
      onSaved(result.productId);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProductFormBasic
            storeSlug={storeSlug}
            values={form.values}
            errors={form.errors}
            categories={categories}
            categoryCounts={categoryCounts}
            imageBusy={form.imageBusy}
            imageError={form.imageError}
            updateField={form.updateField}
            onAddImage={form.addImage}
            onRemoveImage={form.removeImage}
          />

          <ProductFormPricing
            values={form.values}
            errors={form.errors}
            updateField={form.updateField}
          />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <ProductFormStatus
            values={form.values}
            updateField={form.updateField}
          />

          {mode === "edit" && onDelete && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Danger zone
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Removing a product removes it from your storefront. Orders that
                already reference it are not affected.
              </p>
              <button
                type="button"
                onClick={onDelete}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-danger-200 bg-white px-3 py-2 text-sm font-medium text-danger-700 hover:bg-danger-50 dark:border-danger-900 dark:bg-neutral-900 dark:text-danger-300 dark:hover:bg-danger-900/30"
              >
                Remove product
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductFormActions
        isSubmitting={form.isSubmitting}
        isDirty={form.isDirty}
        onCancel={onCancel}
        mode={mode}
      />
    </form>
  );
}