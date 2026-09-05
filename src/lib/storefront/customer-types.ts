export type StorefrontCustomer = {
  id: string;
  resellerSlug: string; // scopes customer to reseller
  name: string;
  email: string;
  phone?: string;
  savedDetails?: {
    phoneNumber?: string;
    meterNumber?: string;
    smartCardNumber?: string;
  };
  preferredPaymentMethod?: string; // payment method id
  orders: StorefrontOrder[];
  createdAt: string;
};

export type StorefrontOrder = {
  id: string;
  service: string;
  plan: string;
  recipient: string;
  amount: number;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  paymentMethod: string;
};

export type CustomerAuthForm = {
  email: string;
  password: string;
  name?: string;
  phone?: string;
};