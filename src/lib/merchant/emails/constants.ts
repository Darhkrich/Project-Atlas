import type {
  EmailTemplateKey,
  EmailTemplates,
} from "./types";

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "order_confirmation",
  "shipping_notification",
  "refund_confirmation",
  "welcome",
  "password_reset",
];

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  order_confirmation: "Order confirmation",
  shipping_notification: "Shipping notification",
  refund_confirmation: "Refund confirmation",
  welcome: "Welcome email",
  password_reset: "Password reset",
};

export const EMAIL_TEMPLATE_TRIGGERS: Record<EmailTemplateKey, string> = {
  order_confirmation: "Sent when a customer places an order.",
  shipping_notification: "Sent when you mark an order as shipped.",
  refund_confirmation: "Sent when you process a refund for an order.",
  welcome: "Sent when a customer creates an account on your storefront.",
  password_reset: "Sent when a customer requests a password reset.",
};

export const EMAIL_SUBJECT_MAX = 120;
export const EMAIL_BODY_MAX = 600;
export const EMAIL_REPLY_TO_MAX = 120;

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplates = {
  order_confirmation: {
    subject: "Order confirmation",
    bodyPrefix: "Thanks for your order.",
    bodySuffix: "If you have any questions, reply to this email.",
    replyTo: "",
  },
  shipping_notification: {
    subject: "Your order is on the way",
    bodyPrefix: "Your order has been shipped.",
    bodySuffix: "Track your delivery using the link in the details above.",
    replyTo: "",
  },
  refund_confirmation: {
    subject: "Your refund is processing",
    bodyPrefix: "We have processed your refund.",
    bodySuffix: "It may take a few days to appear on your statement.",
    replyTo: "",
  },
  welcome: {
    subject: "Welcome",
    bodyPrefix: "Thanks for creating an account.",
    bodySuffix:
      "You can now track your orders and save your delivery details.",
    replyTo: "",
  },
  password_reset: {
    subject: "Reset your password",
    bodyPrefix: "We received a request to reset your password.",
    bodySuffix:
      "If you did not request this, you can ignore this email and your password will not change.",
    replyTo: "",
  },
};