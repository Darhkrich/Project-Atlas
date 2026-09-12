// lib/admin/types/storefront-user-order.ts

export type StorefrontUserOrderStatus =
  | "paid"
  | "pending"
  | "refunded"
  | "cancelled";

export interface StorefrontUserOrder {
  id: string;
  storefrontUserId: string;
  storefrontId: string;
  productName: string;
  amount: number;
  status: StorefrontUserOrderStatus;
  placedAt: string;
}