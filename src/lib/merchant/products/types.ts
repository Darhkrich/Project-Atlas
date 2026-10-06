export type ProductStatus = "Active" | "Draft" | "Archived";

export type ProductStatusFilter = "All" | ProductStatus;

export type ProductSortKey =
  | "recent"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc";

export interface MerchantProductRow {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  categoryName: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  stockLevel: number | null;
  inStock: boolean;
  status: ProductStatus;
  featured: boolean;
  primaryImage: string | null;
  imageCount: number;
  createdAt: number | null;
}

export interface MerchantProductsSnapshot {
  rows: MerchantProductRow[];
  totalCount: number;
  activeCount: number;
  draftCount: number;
  archivedCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  untrackedCount: number;
  categoryCounts: Record<string, number>;
}

export interface MerchantProductDetail {
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
  storefrontId: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface ProductFilterState {
  search: string;
  status: ProductStatusFilter;
  categoryId: string | "All";
  sort: ProductSortKey;
}