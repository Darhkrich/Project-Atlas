export type MerchantTicketStatus =
  | "open"
  | "waiting_on_atlas"
  | "resolved"
  | "closed";

export type MerchantTicketCategory =
  | "orders"
  | "payments"
  | "products"
  | "storefront"
  | "billing"
  | "account"
  | "other";

export type TicketMessageAuthor = "merchant" | "atlas";

export interface MerchantTicketMessage {
  id: string;
  author: TicketMessageAuthor;
  authorName: string;
  body: string;
  createdAt: number;
  readByMerchant: boolean;
}

export interface MerchantTicket {
  id: string;
  storeSlug: string;
  subject: string;
  category: MerchantTicketCategory;
  status: MerchantTicketStatus;
  messages: MerchantTicketMessage[];
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  closedAt?: number;
}

export type CustomerThreadStatus =
  | "new"
  | "replied"
  | "resolved"
  | "closed";

export type CustomerMessageAuthor = "customer" | "merchant";

export interface CustomerMessage {
  id: string;
  author: CustomerMessageAuthor;
  authorName: string;
  body: string;
  createdAt: number;
  readByMerchant: boolean;
}

export interface CustomerMessageThread {
  id: string;
  storeSlug: string;
  customerId: string | null;
  customerEmail: string;
  customerName: string;
  status: CustomerThreadStatus;
  messages: CustomerMessage[];
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  closedAt?: number;
}

export interface MerchantTicketRow {
  id: string;
  subject: string;
  category: MerchantTicketCategory;
  status: MerchantTicketStatus;
  messageCount: number;
  lastActivityAt: number;
  lastMessagePreview: string;
  hasUnreadAtlasReply: boolean;
}

export interface CustomerThreadRow {
  id: string;
  customerId: string | null;
  customerEmail: string;
  customerName: string;
  status: CustomerThreadStatus;
  messageCount: number;
  lastActivityAt: number;
  lastMessagePreview: string;
  unreadCount: number;
}

export interface SupportSummary {
  openTicketCount: number;
  waitingOnAtlasCount: number;
  newThreadCount: number;
  unreadMessageCount: number;
}