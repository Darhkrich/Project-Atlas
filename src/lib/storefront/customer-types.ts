export type StorefrontCustomer = {
  id: string;
  resellerSlug: string;
  storefrontId?: string;
  name: string;
  email: string;
  phone: string;
  twoFactorEnabled?: boolean;
  savedDetails?: {
    phoneNumber?: string;
    meterNumber?: string;
    smartCardNumber?: string;
  };
  preferredPaymentMethod?: string;
  orders: StorefrontOrder[];
  createdAt: string;
};

export type StorefrontOrder = {
  id: string;
  service: string;
  plan: string;
  recipient: string;
  amount: number;
  createdAt: string;
  status: "successful" | "pending" | "failed";
  paymentMethodId: string;
  paidFromWallet?: boolean;
  walletTransactionId?: string;
  failureReason?: string;
  /**
   * @deprecated Use createdAt.
   */
  date?: string;
};

export type CustomerAuthForm = {
  email: string;
  password: string;
  name?: string;
  phone: string;
};