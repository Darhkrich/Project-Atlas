// lib/admin/notifications/constants.ts

import type { AtlasIconName } from "@/components/atlas/icons";
import type {
  NotificationAudience,
  NotificationChannel,
  NotificationSection,
  NotificationStatus,
} from "@/lib/admin/types/notification";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const STATUS_LABEL: Record<NotificationStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const STATUS_VARIANT: Record<NotificationStatus, BadgeVariant> = {
  draft: "neutral",
  scheduled: "warning",
  sent: "success",
  failed: "danger",
  cancelled: "neutral",
};

export const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  in_app: "In-app",
  email: "Email",
  sms: "SMS",
  push: "Push",
};

export const CHANNEL_ICON: Record<NotificationChannel, AtlasIconName> = {
  in_app: "bell",
  email: "mail",
  sms: "message-square",
  push: "smartphone",
};

export const CHANNEL_DESCRIPTION: Record<NotificationChannel, string> = {
  in_app: "Shown in the recipient's Atlas inbox",
  email: "Sent to the recipient's registered email",
  sms: "Sent to the recipient's registered phone number",
  push: "Delivered to the recipient's device",
};

export const AUDIENCE_LABEL: Record<NotificationAudience, string> = {
  all_users: "All users",
  resellers: "Resellers",
  customers: "Customers",
  merchants: "Merchants",
  specific_user: "Specific users",
};

export const AUDIENCE_DESCRIPTION: Record<NotificationAudience, string> = {
  all_users: "Every registered account across Atlas",
  resellers: "Atlas Digital Services resellers",
  customers: "Digital services and ecommerce shoppers",
  merchants: "Atlas Ecommerce merchants",
  specific_user: "Only the user IDs listed",
};

export const SECTION_LABEL: Record<NotificationSection, string> = {
  all: "All sections",
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
};

export const ALL_STATUSES: NotificationStatus[] = [
  "draft",
  "scheduled",
  "sent",
  "failed",
  "cancelled",
];

export const ALL_CHANNELS: NotificationChannel[] = [
  "in_app",
  "email",
  "sms",
  "push",
];

export const ALL_AUDIENCES: NotificationAudience[] = [
  "all_users",
  "resellers",
  "customers",
  "merchants",
  "specific_user",
];

export const ALL_SECTIONS: NotificationSection[] = [
  "all",
  "digital_services",
  "resellers",
  "ecommerce",
];

const BASE_COUNTS: Record<NotificationAudience, number> = {
  all_users: 25000,
  resellers: 342,
  customers: 12980,
  merchants: 156,
  specific_user: 0,
};

const SECTION_SHARE: Record<NotificationSection, number> = {
  all: 1,
  digital_services: 0.78,
  resellers: 0.014,
  ecommerce: 0.21,
};

export function estimateRecipients(
  audience: NotificationAudience,
  section: NotificationSection | undefined,
  specificUserIds: string[] | undefined
): number {
  if (audience === "specific_user") {
    return specificUserIds?.length ?? 0;
  }

  const base = BASE_COUNTS[audience];

  if (audience === "all_users" && section && section !== "all") {
    return Math.round(base * SECTION_SHARE[section]);
  }

  return base;
}

export function formatRecipientEstimate(count: number): string {
  if (count === 0) return "No recipients";
  if (count === 1) return "1 recipient";
  return `~${count.toLocaleString("en-GH")} recipients`;
}