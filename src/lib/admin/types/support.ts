// lib/admin/types/support.ts

export type SupportChannel = "live_chat" | "ticket" | "whatsapp" | "phone";

export type SupportStatus = "open" | "pending" | "resolved" | "closed";

export type SupportPriority = "low" | "medium" | "high" | "urgent";

export type SupportUserType = "customer" | "reseller" | "merchant";

export type SupportCategory =
  | "fulfillment"
  | "billing"
  | "account"
  | "kyc"
  | "technical"
  | "other";

export type SupportTopic =
  | "airtime"
  | "data"
  | "bills"
  | "tv"
  | "exam_pins"
  | "gift_cards"
  | "commissions"
  | "payouts"
  | "downstream_pricing"
  | "reseller_storefront"
  | "subscription"
  | "merchant_storefront"
  | "template"
  | "merchant_billing";

export type DigitalServiceCategory =
  | "airtime"
  | "data"
  | "bills"
  | "tv"
  | "results"
  | "gift_cards"
  | "other";

export type DigitalTransactionStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refunded";

export type GhanaNetwork = "MTN" | "Telecel" | "AirtelTigo";

export interface DigitalTransactionLink {
  kind: "digital_transaction";
  transactionId: string;
  providerId: string;
  providerName: string;
  providerTransactionId?: string;
  service: string;
  serviceCategory: DigitalServiceCategory;
  network?: GhanaNetwork;
  amount: number;
  currency: "GHS";
  recipient: string;
  status: DigitalTransactionStatus;
  failureReason?: string;
  retryCount: number;
  lastProviderResponse?: {
    httpStatus?: number;
    providerCode?: string;
    message: string;
  };
}

export type PayoutState = "pending" | "settled" | "on_hold" | "failed";

export interface ResellerOrderLink {
  kind: "reseller_order";
  orderId: string;
  resellerId: string;
  resellerName: string;
  tier?: string;
  downstreamPrice: number;
  commission: number;
  currency: "GHS";
  payoutState: PayoutState;
  settledAt?: string;
}

export type SubscriptionState =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

export type StorefrontState = "draft" | "live" | "suspended";

export interface MerchantAccountLink {
  kind: "merchant_account";
  merchantId: string;
  merchantName: string;
  plan: string;
  subscriptionState: SubscriptionState;
  templateId: string;
  templateVersion: string;
  storefrontState: StorefrontState;
}

export type LinkedEntity =
  | DigitalTransactionLink
  | ResellerOrderLink
  | MerchantAccountLink;

export interface SupportAttachment {
  id: string;
  fileName: string;
  size?: number;
  type: string;
  url?: string;
  mimeType?: string;
  scanStatus?: "pending" | "clean" | "quarantined";
}

export interface SupportMessage {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
  timestamp: string;
  readByAdmin: boolean;
  attachments?: SupportAttachment[];
  authorId?: string;
  authorName?: string;
}

export interface InternalNote {
  id: string;
  admin: string;
  adminId?: string;
  content: string;
  timestamp: string;
}

export interface SupportConversation {
  ticketRef: ReactNode;
  ticketRef: import("react").JSX.Element;
  id: string;

  userType: SupportUserType;
  userId: string;
  userName: string;
  contactName?: string;

  channel: SupportChannel;
  subject: string;
  status: SupportStatus;
  priority: SupportPriority;
  category: SupportCategory;
  topic?: SupportTopic;
  tags: string[];

  queueId?: string;
  assignee?: string;
  assigneeId?: string;
  assigneeName?: string;

  createdAt: string;
  updatedAt?: string;
  lastMessageAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;

  slaPolicyId?: string;
  slaDueAt?: string;

  linkedEntity?: LinkedEntity;
  escalatedToProvider?: {
    providerId: string;
    reference: string;
    at: string;
  };
  incidentId?: string;
  snoozedUntil?: string;

  unreadCount: number;
  messages: SupportMessage[];
  internalNotes?: InternalNote[];
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  scope?: {
    categories?: SupportCategory[];
    userTypes?: SupportUserType[];
    channels?: SupportChannel[];
  };
  tokens?: string[];
}