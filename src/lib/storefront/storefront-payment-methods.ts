import { allPaymentMethods, type PaymentMethod } from "@/lib/payment-methods";

/**
 * Payment methods available on reseller white-label storefronts.
 * Excludes Atlas account wallet, bank transfer, and Atlas points.
 * These are customer-facing payment options only.
 */
export const storefrontPaymentMethods: PaymentMethod[] = allPaymentMethods.filter(
  (method) => !["wallet", "bank", "atlas_points"].includes(method.id),
);

/**
 * Reseller storefront customers typically use mobile money or card.
 * Adjust the filter above if more methods should be available.
 */      