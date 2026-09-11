export type EcommerceTicketStatus = "open" | "pending" | "resolved" | "closed";
export type EcommerceTicketPriority = "low" | "medium" | "high" | "urgent";

export interface EcommerceSupportTicket {
  id: string;
  merchantId: string;
  merchantName: string;
  subject: string;
  category: "general" | "billing" | "technical" | "storefront" | "orders";
  status: EcommerceTicketStatus;
  priority: EcommerceTicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: "merchant" | "admin";
    message: string;
    timestamp: string;
  }[];
}