import type { ProductStatus } from "../types";
import type {
  ProductVariant,
  ProductVariantGroup,
} from "@/types/merchant-storefront";

export interface ProductFormValues {
  name: string;
  description: string;
  categoryId: string | null;
  price: string;
  salePrice: string;
  stockLevel: string;
  sku: string;
  status: ProductStatus;
  featured: boolean;
  images: string[];
  variantGroups: ProductVariantGroup[];
  variants: ProductVariant[];
}

export interface ProductFormErrors {
  name?: string;
  price?: string;
  salePrice?: string;
  stockLevel?: string;
  categoryId?: string;
  images?: string;
  sku?: string;
  variants?: string;
}

export interface ProductFormSubmitResult {
  ok: boolean;
  productId?: string;
  errors?: ProductFormErrors;
}

export type ProductFormMode = "create" | "edit";

export interface UseProductFormOptions {
  mode: ProductFormMode;
  storeSlug: string;
  initial: {
    id: string;
    name: string;
    description: string;
    categoryId: string | null;
    price: number;
    salePrice: number | null;
    stockLevel: number | null;
    sku: string;
    status: ProductStatus;
    featured: boolean;
    images: string[];
    variantGroups: ProductVariantGroup[];
    variants: ProductVariant[];
  } | null;
}