export type SupportChannel = "live_chat" | "ticket";
export type SupportStatus = "open" | "pending" | "resolved" | "closed";
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportUserType = "customer" | "reseller" | "merchant";

export interface SupportMessage {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
  timestamp: string;
  readByAdmin: boolean;
  attachments?: { id: string; fileName: string; size?: number; type: string }[];
}

export interface InternalNote {
  id: string;
  admin: string;
  content: string;
  timestamp: string;
}

export interface SupportConversation {
  id: string;
  userType: SupportUserType;
  userId: string;
  userName: string;
  channel: SupportChannel;
  subject: string;
  status: SupportStatus;
  priority: SupportPriority;
  assignee?: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: SupportMessage[];
  internalNotes?: InternalNote[];
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
}