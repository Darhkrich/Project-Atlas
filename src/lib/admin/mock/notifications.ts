import type { PlatformNotification, NotificationTemplate } from "../types/notification";

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: "TPL-001",
    name: "System Maintenance",
    title: "Scheduled Maintenance",
    message: "Atlas will undergo scheduled maintenance this weekend.",
    audience: "all_users",
    channels: ["email", "in_app"],
  },
  {
    id: "TPL-002",
    name: "New Product Launch",
    title: "New Data Bundles Available",
    message: "Check out our new data bundles with exclusive discounts.",
    audience: "customers",
    channels: ["in_app", "email"],
  },
  {
    id: "TPL-003",
    name: "Commission Credit",
    title: "Commission Credited",
    message: "Your commission has been credited to your wallet.",
    audience: "resellers",
    channels: ["in_app", "email"],
  },
];

export const mockNotifications: PlatformNotification[] = [
  {
    id: "NTF-001",
    title: "New MTN Data Bundles",
    message: "We've added new MTN data bundles with better pricing. Check them out now!",
    audience: "customers",
    channels: ["in_app", "email"],
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    status: "scheduled",
    createdBy: "admin@atlas.com",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "NTF-002",
    title: "System Maintenance",
    message: "Atlas will undergo maintenance on Sunday 2-4 AM. Services may be briefly unavailable.",
    audience: "all_users",
    channels: ["email", "sms"],
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    status: "sent",
    createdBy: "admin@atlas.com",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveryStats: {
      delivered: 3200,
      opened: 2100,
      failed: 34,
      totalRecipients: 3234,
    },
  },
  {
    id: "NTF-003",
    title: "Reseller Commission Update",
    message: "Your commission for last month has been credited to your wallet.",
    audience: "resellers",
    channels: ["in_app", "email"],
    sentAt: new Date(Date.now() - 172800000).toISOString(),
    status: "sent",
    createdBy: "finance@atlas.com",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    deliveryStats: {
      delivered: 342,
      opened: 289,
      failed: 0,
      totalRecipients: 342,
    },
  },
];