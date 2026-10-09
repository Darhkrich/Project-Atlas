export type EmailTemplateKey =
  | "order_confirmation"
  | "shipping_notification"
  | "refund_confirmation"
  | "welcome"
  | "password_reset";

export interface EmailTemplate {
  subject: string;
  bodyPrefix: string;
  bodySuffix: string;
  replyTo: string;
}

export type EmailTemplates = Record<EmailTemplateKey, EmailTemplate>;