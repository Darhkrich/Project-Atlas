import type { MerchantTicketCategory, MerchantTicketStatus } from "./types";

export const TICKET_STATUSES: MerchantTicketStatus[] = [
  "open",
  "waiting_on_atlas",
  "resolved",
  "closed",
];

export const TICKET_CATEGORIES: MerchantTicketCategory[] = [
  "orders",
  "payments",
  "products",
  "storefront",
  "billing",
  "account",
  "other",
];

export const TICKET_SUBJECT_MAX_LENGTH = 120;
export const TICKET_BODY_MAX_LENGTH = 4000;
export const MESSAGE_BODY_MAX_LENGTH = 4000;

export const TICKET_SUBJECT_MIN_LENGTH = 4;
export const MESSAGE_BODY_MIN_LENGTH = 2;

export const LAST_MESSAGE_PREVIEW_LENGTH = 80;