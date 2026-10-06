import type {
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import { LOW_STOCK_THRESHOLD } from "./constants";
import { UNCATEGORISED_LABEL } from "./labels";
import type {
  MerchantProductDetail,
  MerchantProductRow,
  MerchantProductsSnapshot,
  ProductFilterState,
  ProductSortKey,
  ProductStatus,
} from "./types";

function effectiveStatus(
  product: MerchantStorefrontProduct
): ProductStatus {
  const s = product.status;
  if (s === "Active" || s === "Draft" || s === "Archived") return s;
  return "Active";
}

function effectiveStockLevel(
  product: MerchantStorefrontProduct
): number | null {
  if (typeof product.stockLevel === "number") return product.stockLevel;
  return null;
}

function effectiveInStock(product: MerchantStorefrontProduct): boolean {
  const level = effectiveStockLevel(product);
  if (level !== null) return level > 0;
  return product.inStock === true;
}

function categoryNameFor(
  categoryId: string | null,
  categories: MerchantCategory[]
): string {
  if (!categoryId) return UNCATEGORISED_LABEL;
  const found = categories.find((c) => c.id === categoryId);
  if (found) return found.name;
  const byName = categories.find(
    (c) => c.name.toLowerCase() === categoryId.toLowerCase()
  );
  if (byName) return byName.name;
  return categoryId;
}

function categoryIdFor(
  product: MerchantStorefrontProduct,
  categories: MerchantCategory[]
): string | null {
  const raw = product.categoryId;
  if (!raw) return null;
  const byId = categories.find((c) => c.id === raw);
  if (byId) return byId.id;
  const byName = categories.find(
    (c) => c.name.toLowerCase() === raw.toLowerCase()
  );
  if (byName) return byName.id;
  return raw;
}

function primaryImage(product: MerchantStorefrontProduct): string | null {
  if (!Array.isArray(product.images)) return null;
  if (product.images.length === 0) return null;
  const first = product.images[0];
  return typeof first === "string" && first.length > 0 ? first : null;
}

export function projectProductRow(
  product: MerchantStorefrontProduct,
  categories: MerchantCategory[]
): MerchantProductRow {
  const stockLevel = effectiveStockLevel(product);
  const salePrice =
    typeof product.salePrice === "number" ? product.salePrice : null;
  const effectivePrice =
    salePrice !== null && salePrice < product.price ? salePrice : product.price;
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    id: product.id,
    name: product.name,
    sku: typeof product.sku === "string" ? product.sku : "",
    categoryId: categoryIdFor(product, categories),
    categoryName: categoryNameFor(categoryIdFor(product, categories), categories),
    price: product.price,
    salePrice,
    effectivePrice,
    stockLevel,
    inStock: effectiveInStock(product),
    status: effectiveStatus(product),
    featured: product.featured === true,
    primaryImage: primaryImage(product),
    imageCount: images.length,
    createdAt: null,
  };
}

export function projectProductDetail(
  product: MerchantStorefrontProduct,
  categories: MerchantCategory[]
): MerchantProductDetail {
  const stockLevel = effectiveStockLevel(product);
  const salePrice =
    typeof product.salePrice === "number" ? product.salePrice : null;
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    categoryId: categoryIdFor(product, categories),
    price: product.price,
    salePrice,
    stockLevel,
    sku: typeof product.sku === "string" ? product.sku : "",
    status: effectiveStatus(product),
    featured: product.featured === true,
    images,
    storefrontId: null,
    createdAt: null,
    updatedAt: null,
  };
}

function sortRows(rows: MerchantProductRow[], sort: ProductSortKey): MerchantProductRow[] {
  const next = rows.slice();
  switch (sort) {
    case "recent":
      return next;
    case "name_asc":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return next.sort((a, b) => b.name.localeCompare(a.name));
    case "price_asc":
      return next.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case "price_desc":
      return next.sort((a, b) => b.effectivePrice - a.effectivePrice);
    case "stock_asc":
      return next.sort((a, b) => {
        const av = a.stockLevel ?? Number.POSITIVE_INFINITY;
        const bv = b.stockLevel ?? Number.POSITIVE_INFINITY;
        return av - bv;
      });
    case "stock_desc":
      return next.sort((a, b) => {
        const av = a.stockLevel ?? Number.NEGATIVE_INFINITY;
        const bv = b.stockLevel ?? Number.NEGATIVE_INFINITY;
        return bv - av;
      });
  }
}

function matchesSearch(row: MerchantProductRow, term: string): boolean {
  if (term.length === 0) return true;
  const t = term.toLowerCase();
  return (
    row.name.toLowerCase().includes(t) ||
    row.sku.toLowerCase().includes(t) ||
    row.categoryName.toLowerCase().includes(t)
  );
}

export interface ProjectProductsInput {
  products: MerchantStorefrontProduct[];
  categories: MerchantCategory[];
  filters: ProductFilterState;
}

export function projectMerchantProducts(
  input: ProjectProductsInput
): MerchantProductsSnapshot {
  const rowsAll = input.products.map((p) =>
    projectProductRow(p, input.categories)
  );

  const categoryCounts: Record<string, number> = {};
  for (const row of rowsAll) {
    if (!row.categoryId) continue;
    categoryCounts[row.categoryId] = (categoryCounts[row.categoryId] ?? 0) + 1;
  }

  const activeCount = rowsAll.filter((r) => r.status === "Active").length;
  const draftCount = rowsAll.filter((r) => r.status === "Draft").length;
  const archivedCount = rowsAll.filter((r) => r.status === "Archived").length;
  const lowStockCount = rowsAll.filter(
    (r) =>
      typeof r.stockLevel === "number" &&
      r.stockLevel > 0 &&
      r.stockLevel <= LOW_STOCK_THRESHOLD
  ).length;
  const outOfStockCount = rowsAll.filter((r) => r.inStock === false).length;
  const untrackedCount = rowsAll.filter((r) => r.stockLevel === null).length;

  const filtered = rowsAll.filter((row) => {
    if (!matchesSearch(row, input.filters.search)) return false;
    if (input.filters.status !== "All" && row.status !== input.filters.status) {
      return false;
    }
    if (
      input.filters.categoryId !== "All" &&
      row.categoryId !== input.filters.categoryId
    ) {
      return false;
    }
    return true;
  });

  const sorted = sortRows(filtered, input.filters.sort);

  return {
    rows: sorted,
    totalCount: rowsAll.length,
    activeCount,
    draftCount,
    archivedCount,
    lowStockCount,
    outOfStockCount,
    untrackedCount,
    categoryCounts,
  };
}