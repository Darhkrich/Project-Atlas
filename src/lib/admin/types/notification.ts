// lib/admin/types/notification.ts

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "failed"
  | "cancelled";

export type NotificationAudience =
  | "all_users"
  | "resellers"
  | "customers"
  | "merchants"
  | "specific_user";

export type NotificationSection =
  | "all"
  | "digital_services"
  | "resellers"
  | "ecommerce";

export interface NotificationDeliveryStats {
  delivered: number;
  opened: number;
  failed: number;
  totalRecipients: number;
}

export interface FailedRecipientBreakdown {
  reason: string;
  count: number;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  targetSection: NotificationSection;
  channels: NotificationChannel[];
  scheduledFor?: string;
  sentChannels?: NotificationChannel[];
  sentAt?: string;
  status: NotificationStatus;
  createdBy: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  estimatedRecipients: number;
  deliveryStats?: NotificationDeliveryStats;
  failedRecipientBreakdown?: FailedRecipientBreakdown[];
  failureReason?: string;
  cancelledAt?: string;
  cancelledById?: string;
  cancelledByName?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  targetSection: NotificationSection;
  channels: NotificationChannel[];
}