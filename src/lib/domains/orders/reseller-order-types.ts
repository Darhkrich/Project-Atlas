import type { Order } from "@/lib/admin/types/orders";

// Reseller-facing view of an order. Direct-audience orders are filtered
// before this row is built. Only storefront_user and reseller audiences
// reach the reseller dashboard.
export interface ResellerOrderRow {
  paymentMethodId: string;
  id: string;
  audience: "storefront_user" | "reseller";
  serviceId: string;
  providerId: string;
  networkId?: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  commission: number;
  status: Order["status"];
  createdAt: string;
}