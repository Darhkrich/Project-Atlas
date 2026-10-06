import type { AtlasIconName } from "@/components/atlas/icons";

export type StorefrontPaymentMethod = "momo" | "card" | "bank";

export interface PaymentMethodMeta {
  id: StorefrontPaymentMethod;
  label: string;
  description: string;
  icon: AtlasIconName;
}

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: "momo",
    label: "Mobile Money",
    description: "MTN, Vodafone, AirtelTigo, Telecel.",
    icon: "smartphone",
  },
  {
    id: "card",
    label: "Card",
    description: "Visa, Mastercard, and Verve.",
    icon: "credit-card",
  },
  {
    id: "bank",
    label: "Bank transfer",
    description: "Direct bank payment confirmation.",
    icon: "bank",
  },
];

export function methodLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

// Merchant storefront checkout does not include Atlas Wallet. Customers on
// a merchant storefront have no wallet. If the plan's allowance lists
// methods that are not part of this storefront, filter them out here so
// nothing downstream can render them by accident.
export function filterStorefrontMethods(
  planMethods: string[]
): StorefrontPaymentMethod[] {
  const valid = new Set<string>(PAYMENT_METHODS.map((m) => m.id));
  return planMethods.filter((m): m is StorefrontPaymentMethod =>
    valid.has(m)
  );
}