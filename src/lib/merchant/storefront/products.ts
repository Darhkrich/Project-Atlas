import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";

export function productIsInStock(product: MerchantStorefrontProduct): boolean {
  if (typeof product.stockLevel === "number") {
    return product.stockLevel > 0;
  }
  return product.inStock;
}