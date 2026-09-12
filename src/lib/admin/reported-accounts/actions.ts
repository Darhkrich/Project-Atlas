// lib/admin/reported-accounts/actions.ts

export type ReportAction =
  | "warn"
  | "suspend"
  | "issue_refund"
  | "escalate"
  | "dismiss";

export const ALL_REPORT_ACTIONS: ReportAction[] = [
  "warn",
  "suspend",
  "issue_refund",
  "escalate",
  "dismiss",
];

export function actionLabel(action: ReportAction): string {
  switch (action) {
    case "warn":
      return "Send warning";
    case "suspend":
      return "Suspend account";
    case "issue_refund":
      return "Issue refund";
    case "escalate":
      return "Escalate";
    case "dismiss":
      return "Dismiss report";
  }
}

export function actionDescription(action: ReportAction): string {
  switch (action) {
    case "warn":
      return "Notify the customer and log a formal warning on their account.";
    case "suspend":
      return "Block the account from placing new orders on the storefront.";
    case "issue_refund":
      return "Initiate a refund on the disputed order.";
    case "escalate":
      return "Route the report to a specialist team for investigation.";
    case "dismiss":
      return "Close the report without action. Requires a reason.";
  }
}

export function actionTone(
  action: ReportAction
): "default" | "danger" | "warning" | "success" {
  switch (action) {
    case "suspend":
      return "danger";
    case "escalate":
      return "warning";
    case "issue_refund":
      return "warning";
    case "warn":
      return "warning";
    case "dismiss":
      return "default";
  }
}