export type EcommercePaymentStatus = "successful" | "failed" | "pending" | "refunded";

export interface EcommercePayment {
  id: string;
  merchantId: string;
  merchantName: string;
  orderId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  status: EcommercePaymentStatus;
  transactionRef: string;
  createdAt: string;
  walletId?: string;
  walletCreditedAt?: string; // when net amount was credited to merchant wallet
  walletCreditStatus?: "credited" | "pending" | "failed";
}