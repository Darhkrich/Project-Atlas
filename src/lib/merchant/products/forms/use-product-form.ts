/* eslint-disable react-hooks/refs */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useStoreProducts } from "@/contexts/store-products-context";
import {
  MAX_IMAGES_PER_PRODUCT,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_PRICE_MAX,
  PRODUCT_SKU_MAX_LENGTH,
} from "../constants";
import {
  PRODUCT_CATEGORY_REQUIRED,
  PRODUCT_IMAGE_LIMIT_REACHED,
  PRODUCT_NAME_REQUIRED,
  PRODUCT_NAME_TOO_LONG,
  PRODUCT_PRICE_INVALID,
  PRODUCT_PRICE_REQUIRED,
  PRODUCT_SALE_PRICE_INVALID,
  PRODUCT_SKU_DUPLICATE,
  PRODUCT_STOCK_INVALID,
} from "../labels";
import { compressImage } from "./image";
import { generateUniqueSku } from "./sku";
import type {
  ProductFormErrors,
  ProductFormSubmitResult,
  ProductFormValues,
  UseProductFormOptions,
} from "./types";

function baselineFromInitial(
  initial: UseProductFormOptions["initial"]
): ProductFormValues {
  if (!initial) {
    return {
      name: "",
      description: "",
      categoryId: null,
      price: "",
      salePrice: "",
      stockLevel: "",
      sku: "",
      status: "Active",
      featured: false,
      images: [],
    };
  }
  const stockAsString =
    initial.stockLevel !== null ? String(initial.stockLevel) : "";
  return {
    name: initial.name,
    description: initial.description,
    categoryId: initial.categoryId,
    price: String(initial.price),
    salePrice: initial.salePrice !== null ? String(initial.salePrice) : "",
    stockLevel: stockAsString,
    sku: initial.sku,
    status: initial.status,
    featured: initial.featured,
    images: initial.images.slice(),
  };
}

function serialize(values: ProductFormValues): string {
  return JSON.stringify(values);
}

export interface UseProductFormResult {
  values: ProductFormValues;
  errors: ProductFormErrors;
  isDirty: boolean;
  isSubmitting: boolean;
  imageBusy: boolean;
  imageError: string | null;
  updateField: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => void;
  addImage: (file: File) => Promise<void>;
  removeImage: (index: number) => void;
  clearImageError: () => void;
  submit: () => ProductFormSubmitResult;
  reset: () => void;
}

export function useProductForm(
  options: UseProductFormOptions
): UseProductFormResult {
  const { addProduct, updateProduct, getProductsForStore } = useStoreProducts();

  const existingSkusForThisStore = useCallback(
    (excludeId: string | undefined): string[] => {
      const products = getProductsForStore(options.storeSlug);
      const out: string[] = [];
      for (const p of products) {
        if (p.id === excludeId) continue;
        const sku = (p.sku ?? "").trim();
        if (sku.length > 0) out.push(sku);
      }
      return out;
    },
    [getProductsForStore, options.storeSlug]
  );

  const initialBaselineRef = useRef<ProductFormValues | null>(null);
  if (initialBaselineRef.current === null) {
    const baseline = baselineFromInitial(options.initial);
    if (baseline.status === "Active" && baseline.sku.trim() === "") {
      baseline.sku = generateUniqueSku(
        existingSkusForThisStore(options.initial?.id)
      );
    }
    initialBaselineRef.current = baseline;
  }
  const baseline = initialBaselineRef.current;
  const baselineSerialized = useMemo(() => serialize(baseline), [baseline]);

  const [values, setValues] = useState<ProductFormValues>(baseline);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => serialize(values) !== baselineSerialized,
    [values, baselineSerialized]
  );

  const updateField = useCallback(
    <K extends keyof ProductFormValues>(
      key: K,
      value: ProductFormValues[K]
    ) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "status" && value === "Active" && next.sku.trim() === "") {
          next.sku = generateUniqueSku(
            existingSkusForThisStore(options.initial?.id)
          );
        }
        return next;
      });
      setErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key as keyof ProductFormErrors];
        return next;
      });
    },
    [existingSkusForThisStore, options.initial?.id]
  );

  const addImage = useCallback(
    async (file: File) => {
      setImageError(null);
      if (values.images.length >= MAX_IMAGES_PER_PRODUCT) {
        setImageError(PRODUCT_IMAGE_LIMIT_REACHED);
        return;
      }
      setImageBusy(true);
      try {
        const compressed = await compressImage(file);
        setValues((prev) => ({
          ...prev,
          images: [...prev.images, compressed].slice(
            0,
            MAX_IMAGES_PER_PRODUCT
          ),
        }));
      } catch (err) {
        setImageError(
          err instanceof Error ? err.message : "Failed to process image."
        );
      } finally {
        setImageBusy(false);
      }
    },
    [values.images.length]
  );

  const removeImage = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const clearImageError = useCallback(() => setImageError(null), []);

  const validate = useCallback((): ProductFormErrors => {
    const next: ProductFormErrors = {};

    const name = values.name.trim();
    if (name.length === 0) next.name = PRODUCT_NAME_REQUIRED;
    else if (name.length > PRODUCT_NAME_MAX_LENGTH)
      next.name = PRODUCT_NAME_TOO_LONG;

    const price = Number.parseFloat(values.price);
    if (values.price.trim().length === 0) next.price = PRODUCT_PRICE_REQUIRED;
    else if (
      !Number.isFinite(price) ||
      price <= 0 ||
      price > PRODUCT_PRICE_MAX
    )
      next.price = PRODUCT_PRICE_INVALID;

    if (values.salePrice.trim().length > 0) {
      const sale = Number.parseFloat(values.salePrice);
      if (!Number.isFinite(sale) || sale < 0) {
        next.salePrice = PRODUCT_SALE_PRICE_INVALID;
      } else if (Number.isFinite(price) && sale >= price) {
        next.salePrice = PRODUCT_SALE_PRICE_INVALID;
      }
    }

    if (values.stockLevel.trim().length === 0) {
      next.stockLevel = PRODUCT_STOCK_INVALID;
    } else {
      const stock = Number.parseInt(values.stockLevel, 10);
      if (!Number.isFinite(stock) || stock < 0) {
        next.stockLevel = PRODUCT_STOCK_INVALID;
      }
    }

    if (!values.categoryId) next.categoryId = PRODUCT_CATEGORY_REQUIRED;

    if (values.sku.trim().length > PRODUCT_SKU_MAX_LENGTH) {
      next.sku = "SKU is too long.";
    }

    if (values.description.length > PRODUCT_DESCRIPTION_MAX_LENGTH) {
      next.name = next.name ?? "Description is too long.";
    }

    return next;
  }, [values]);

  const submit = useCallback((): ProductFormSubmitResult => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return { ok: false, errors: nextErrors };
    }

    let finalSku = values.sku.trim();
    if (values.status === "Active" && finalSku === "") {
      finalSku = generateUniqueSku(existingSkusForThisStore(options.initial?.id));
    }

    if (finalSku.length > 0) {
      const candidate = finalSku.toLowerCase();
      const collision = existingSkusForThisStore(options.initial?.id).some(
        (s) => s.toLowerCase() === candidate
      );
      if (collision) {
        const dup = { sku: PRODUCT_SKU_DUPLICATE };
        setErrors(dup);
        return { ok: false, errors: dup };
      }
    }

    setIsSubmitting(true);
    try {
      const price = Number.parseFloat(values.price);
      const sale = values.salePrice.trim().length
        ? Number.parseFloat(values.salePrice)
        : null;
      const stock = Number.parseInt(values.stockLevel, 10);

      const productPayload = {
        name: values.name.trim(),
        description: values.description.trim(),
        price,
        salePrice: sale !== null ? sale : undefined,
        images: values.images.slice(),
        categoryId: values.categoryId ?? "",
        inStock: stock > 0,
        featured: values.featured,
        status: values.status,
        sku: finalSku.length > 0 ? finalSku : undefined,
        stockLevel: stock,
      };

      if (options.mode === "edit" && options.initial) {
        updateProduct(options.storeSlug, options.initial.id, productPayload);
        setIsSubmitting(false);
        return { ok: true, productId: options.initial.id };
      }

      const id = crypto.randomUUID();
      addProduct(options.storeSlug, { id, ...productPayload });
      setIsSubmitting(false);
      return { ok: true, productId: id };
    } catch (err) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "Save failed.";
      const fallback = { name: msg };
      setErrors(fallback);
      return { ok: false, errors: fallback };
    }
  }, [
    addProduct,
    existingSkusForThisStore,
    options.initial,
    options.mode,
    options.storeSlug,
    updateProduct,
    validate,
    values,
  ]);

  const reset = useCallback(() => {
    setValues(baseline);
    setErrors({});
    setImageError(null);
  }, [baseline]);

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    imageBusy,
    imageError,
    updateField,
    addImage,
    removeImage,
    clearImageError,
    submit,
    reset,
  };
}