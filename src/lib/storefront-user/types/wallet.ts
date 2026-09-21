export * from "@/lib/domains/wallet/storefront-user-types";

export interface StorefrontSavedPaymentMethod {
  id: string;
  walletId: string;
  ownerId: string;
  methodId: import("@/lib/domains/wallet/enums").WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
}

export interface StorefrontSavedMethodsStoreState {
  savedMethods: StorefrontSavedPaymentMethod[];
}