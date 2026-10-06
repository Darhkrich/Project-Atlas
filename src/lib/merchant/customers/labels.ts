import type {
  CustomerReportReason,
  CustomerSegment,
  CustomerSortKey,
} from "./types";

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  new: "New",
  returning: "Returning",
  vip: "VIP",
};

export const SORT_LABELS: Record<CustomerSortKey, string> = {
  recent_activity: "Recent activity",
  orders_desc: "Most orders",
  spend_desc: "Highest spend",
  name_asc: "Name (A to Z)",
  oldest_customer: "Oldest first",
};

export const REPORT_REASON_LABELS: Record<CustomerReportReason, string> = {
  fraud: "Suspected fraud",
  abuse: "Abusive behaviour",
  chargebacks: "Repeated chargebacks",
  repeated_refunds: "Repeated refund requests",
  harassment: "Harassment",
  other: "Other",
};

export const CUSTOMER_EMPTY_NO_CUSTOMERS_TITLE = "No customers yet";
export const CUSTOMER_EMPTY_NO_CUSTOMERS_BODY =
  "When a customer buys from your store, they will appear here.";
export const CUSTOMER_EMPTY_NO_CUSTOMERS_CTA = "View your storefront";

export const CUSTOMER_EMPTY_NO_MATCHES_TITLE = "No customers match";
export const CUSTOMER_EMPTY_NO_MATCHES_BODY =
  "Try adjusting your search or filter criteria.";
export const CUSTOMER_EMPTY_NO_MATCHES_CTA = "Clear filters";

export const CUSTOMER_NOT_FOUND_TITLE = "Customer not found";
export const CUSTOMER_NOT_FOUND_BODY =
  "This customer may have been removed.";
export const CUSTOMER_NOT_FOUND_CTA = "Back to customers";

export const REPORT_MODAL_TITLE = "Report customer";
export const REPORT_MODAL_BODY =
  "Your report is sent to Atlas. The customer is not notified.";
export const REPORT_ALREADY_ACTIVE =
  "You have already reported this customer. Withdraw the existing report to file a new one.";
export const REPORT_NOTE_REQUIRED_FOR_OTHER =
  "Please describe the reason for the report.";
export const REPORT_WITHDRAW_CONFIRM_TITLE = "Withdraw report";
export const REPORT_WITHDRAW_CONFIRM_BODY =
  "The report is removed from Atlas review. You can file a new one at any time.";

export const CUSTOMER_NOT_PROVIDED = "Not provided";
export const MEMBER_SINCE_EMPTY = "No orders yet";