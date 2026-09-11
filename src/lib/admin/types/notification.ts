export type NotificationChannel = "in_app" | "email" | "sms" | "push";
export type NotificationAudience = "all_users" | "resellers" | "customers" | "merchants" | "specific_user";
export type NotificationStatus = "draft" | "scheduled" | "sent" | "failed";

export interface DeliveryStats {
  delivered: number;
  opened: number;
  failed: number;
  totalRecipients: number;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  specificUserIds?: string[];
  channels: NotificationChannel[];
  scheduledFor?: string;
  sentAt?: string;
  status: NotificationStatus;
  createdBy: string;
  createdAt: string;
  deliveryStats?: DeliveryStats;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  channels: NotificationChannel[];
}