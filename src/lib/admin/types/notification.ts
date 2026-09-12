// lib/admin/types/notification.ts

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export type NotificationAudience =
  | "all_users"
  | "resellers"
  | "customers"
  | "merchants"
  | "specific_user";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "failed"
  | "cancelled";

export type NotificationSection =
  | "digital_services"
  | "resellers"
  | "ecommerce"
  | "all";

export interface DeliveryStats {
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
  targetSection?: NotificationSection;
  specificUserIds?: string[];
  channels: NotificationChannel[];
  sentChannels?: NotificationChannel[];
  scheduledFor?: string;
  sentAt?: string;
  status: NotificationStatus;

  createdBy: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;

  cancelledAt?: string;
  cancelledById?: string;
  cancelledByName?: string;

  estimatedRecipients?: number;
  deliveryStats?: DeliveryStats;
  failureReason?: string;
  failedRecipientBreakdown?: FailedRecipientBreakdown[];

  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  targetSection?: NotificationSection;
  channels: NotificationChannel[];
}