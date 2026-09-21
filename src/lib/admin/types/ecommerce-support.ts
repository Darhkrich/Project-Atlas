// lib/admin/types/ecommerce-support.ts

import type {
  SupportCategory,
  SupportChannel,
  SupportPriority,
  SupportStatus,
  SupportTopic,
} from "@/lib/admin/types/support";

export type EcommerceTicketStatus = SupportStatus;
export type EcommerceTicketPriority = SupportPriority;
export type EcommerceTicketCategory = SupportCategory;
export type EcommerceTicketChannel = SupportChannel;
export type EcommerceTicketTopic = SupportTopic;

export type EcommerceTicketMessageSender = "merchant" | "admin" | "system";

export interface EcommerceTicketMessage {
  id: string;
  sender: EcommerceTicketMessageSender;
  authorId?: string;
  authorName?: string;
  message: string;
  timestamp: string;
  readByAdmin?: boolean;
  internal?: boolean;
}

export interface EcommerceTicketLinkedEntity {
  kind: "merchant" | "storefront" | "subscription" | "plan" | "order" | "template";
  id: string;
  label?: string;
}

export interface EcommerceSupportTicket {
  id: string;
  merchantId: string;
  merchantName: string;
  subject: string;
  category: SupportCategory;
  topic?: SupportTopic;
  channel?: SupportChannel;
  status: SupportStatus;
  priority: SupportPriority;
  assignedToId?: string;
  assignedToName?: string;
  slaDueAt?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  firstResponseAt?: string;
  linkedEntity?: EcommerceTicketLinkedEntity;
  messages: EcommerceTicketMessage[];
}

export interface EcommerceSupportActor {
  id: string;
  name: string;
  email: string;
}

export interface EcommerceSupportSummary {
  total: number;
  open: number;
  pending: number;
  slaAtRisk: number;
  unassigned: number;
}