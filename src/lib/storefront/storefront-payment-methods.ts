import { allPaymentMethods, type PaymentMethod } from "@/lib/payment-methods";

/**
 * Payment methods available on reseller white-label storefronts.
 * Mobile money and card are the primary rails. Bank transfer is excluded
 * because Atlas settles bank transfers through a different flow. Atlas
 * account wallet and Atlas points are excluded because they are D2C-only.
 */
export const storefrontPaymentMethods: PaymentMethod[] =
  allPaymentMethods.filter(
    (method) =>
      method.id === "momo" ||
      method.id === "card" ||
      method.id === "ussd"
  );

/**
 * The wallet payment option is never part of the static list. It is added
 * conditionally at call time when the customer is signed in and has a
 * sufficient balance.
 */
export const storefrontWalletMethod: PaymentMethod = {
  id: "wallet",
  name: "Storefront wallet",
  description: "Pay from your wallet balance",
  icon: "wallet",
  bgClass: "bg-brand-100 dark:bg-brand-900/30",
  fields: [],
};

export interface ResolveStorefrontPaymentMethodsInput {
  walletEnabled: boolean;
  walletBalance: number;
}

export function resolveStorefrontPaymentMethods({
  walletEnabled,
}: ResolveStorefrontPaymentMethodsInput): PaymentMethod[] {
  if (!walletEnabled) return storefrontPaymentMethods;
  return [storefrontWalletMethod, ...storefrontPaymentMethods];
}