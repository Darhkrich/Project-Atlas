export type EcommerceOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface EcommerceOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface EcommerceOrder {
  id: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  items: EcommerceOrderItem[];
  totalAmount: number;
  status: EcommerceOrderStatus; // managed by merchant
  paymentStatus: "paid" | "pending" | "refunded";
  paymentMethod: string;
  createdAt: string;
}