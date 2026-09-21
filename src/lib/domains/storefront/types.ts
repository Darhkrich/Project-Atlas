export interface StorefrontCustomerSavedDetails {
  phoneNumber?: string;
  meterNumber?: string;
  smartCardNumber?: string;
}

export interface StorefrontCustomerRecord {
  id: string;
  resellerSlug: string;
  storefrontId?: string;
  name: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
  preferredPaymentMethod?: string;
  savedDetails: StorefrontCustomerSavedDetails;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontCustomerState {
  customers: Record<string, StorefrontCustomerRecord>;
}