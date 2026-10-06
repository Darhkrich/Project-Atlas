import type {
  CustomerThreadStatus,
  MerchantTicketCategory,
  MerchantTicketStatus,
} from "./types";

export const TICKET_STATUS_LABELS: Record<MerchantTicketStatus, string> = {
  open: "Open",
  waiting_on_atlas: "Waiting on Atlas",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_CATEGORY_LABELS: Record<MerchantTicketCategory, string> = {
  orders: "Orders",
  payments: "Payments",
  products: "Products",
  storefront: "Storefront",
  billing: "Billing",
  account: "Account",
  other: "Other",
};

export const THREAD_STATUS_LABELS: Record<CustomerThreadStatus, string> = {
  new: "New",
  replied: "Replied",
  resolved: "Resolved",
  closed: "Closed",
};

export const TAB_LABELS = {
  tickets: "Atlas support",
  messages: "Customer messages",
} as const;

export const SUBJECT_LABEL = "Subject";
export const CATEGORY_LABEL = "Category";
export const MESSAGE_LABEL = "Message";
export const REPLY_LABEL = "Reply";

export const SUBJECT_REQUIRED = "Add a short subject.";
export const SUBJECT_TOO_LONG = "Subject is too long.";
export const CATEGORY_REQUIRED = "Choose a category.";
export const MESSAGE_REQUIRED = "Write your message.";
export const MESSAGE_TOO_SHORT = "Message is too short.";
export const MESSAGE_TOO_LONG = "Message is too long.";

export const NEW_TICKET_TITLE = "New support request";
export const NEW_TICKET_DESCRIPTION =
  "Describe your issue and Atlas support will reply.";
export const SEND_MESSAGE_BUTTON = "Send";
export const CLOSE_TICKET_LABEL = "Close request";
export const CLOSE_TICKET_CONFIRM =
  "Close this request? You can open a new one at any time.";

export const TICKETS_EMPTY_TITLE = "No support requests";
export const TICKETS_EMPTY_BODY =
  "When you contact Atlas support, your requests appear here.";
export const TICKETS_EMPTY_CTA = "New request";

export const THREADS_EMPTY_TITLE = "No customer messages";
export const THREADS_EMPTY_BODY =
  "When a customer contacts you from your storefront, their message appears here.";

export const SEED_TICKETS_CTA = "Load sample tickets";
export const SEED_THREADS_CTA = "Load sample messages";
export const SEED_HINT =
  "Samples are examples. You can close or delete them any time.";

export const TICKET_NOT_FOUND = "Request not found.";
export const THREAD_NOT_FOUND = "Conversation not found.";

export const BACK_TO_LIST = "Back";
export const SUPPORT_SUBTITLE =
  "Talk to Atlas, or answer messages from your customers.";

export const SEARCH_TICKETS_PLACEHOLDER = "Search requests...";
export const SEARCH_THREADS_PLACEHOLDER = "Search conversations...";