// lib/admin/audit-logs/financial-labels.ts

import type { AuditAction, AuditResourceType } from "@/lib/domains/audit";
import type { AtlasSection } from "@/lib/admin/types/settings";

export const FINANCIAL_ACTION_LABEL: Record<AuditAction, string> = {
  // Wallet, storefront user
  "wallet.storefront_user.fund": "Storefront user wallet funded",
  "wallet.storefront_user.purchase": "Storefront user purchase",
  "wallet.storefront_user.freeze": "Storefront user wallet frozen",
  "wallet.storefront_user.unfreeze": "Storefront user wallet unfrozen",
  "wallet.storefront_user.adjust": "Storefront user wallet adjusted",
  "wallet.storefront_user.refund_credit": "Storefront user refund credited",

  // Wallet, customer
  "wallet.customer.fund": "Customer wallet funded",
  "wallet.customer.withdraw_request": "Customer withdrawal requested",
  "wallet.customer.withdraw_approve": "Customer withdrawal approved",
  "wallet.customer.withdraw_reject": "Customer withdrawal rejected",
  "wallet.customer.withdraw_cancel": "Customer withdrawal cancelled",
  "wallet.customer.freeze": "Customer wallet frozen",
  "wallet.customer.unfreeze": "Customer wallet unfrozen",
  "wallet.customer.adjust": "Customer wallet adjusted",
  "wallet.customer.refund_credit": "Customer refund credited",

  // Wallet, reseller
  "wallet.reseller.fund": "Reseller wallet funded",
  "wallet.reseller.withdraw_request": "Reseller withdrawal requested",
  "wallet.reseller.withdraw_approve": "Reseller withdrawal approved",
  "wallet.reseller.withdraw_reject": "Reseller withdrawal rejected",
  "wallet.reseller.withdraw_cancel": "Reseller withdrawal cancelled",
  "wallet.reseller.adjust": "Reseller wallet adjusted",
  "wallet.reseller.freeze": "Reseller wallet frozen",
  "wallet.reseller.unfreeze": "Reseller wallet unfrozen",
  "wallet.reseller.refund_credit": "Reseller refund credited",

  // Wallet, merchant
  "wallet.merchant.fund": "Merchant wallet funded",
  "wallet.merchant.transfer": "Merchant wallet transfer",
  "wallet.merchant.withdraw_request": "Merchant withdrawal requested",
  "wallet.merchant.withdraw_approve": "Merchant withdrawal approved",
  "wallet.merchant.withdraw_reject": "Merchant withdrawal rejected",
  "wallet.merchant.withdraw_cancel": "Merchant withdrawal cancelled",
  "wallet.merchant.adjust": "Merchant wallet adjusted",
  "wallet.merchant.freeze": "Merchant wallet frozen",
  "wallet.merchant.unfreeze": "Merchant wallet unfrozen",
  "wallet.merchant.checkout_credit": "Merchant checkout credited",
  "wallet.merchant.plan_charge": "Merchant plan charge",
  "wallet.merchant.refund_settled": "Merchant refund settled",
  "wallet.merchant.dispute_resolve": "Merchant dispute resolved",

  // Refund, storefront user
  "refund.storefront_user.create": "Storefront refund created",
  "refund.storefront_user.approve": "Storefront refund approved",
  "refund.storefront_user.cancel": "Storefront refund cancelled",
  "refund.storefront_user.reject": "Storefront refund rejected",

  // Refund, general
  "refund.create_requested": "Refund requested",
  "refund.approve": "Refund approved",
  "refund.reject": "Refund rejected",
  "refund.process": "Refund processed",
  "refund.automatic": "Automatic refund",

  // Commission
  "commission.reseller.credit": "Reseller commission credited",
  "commission.create": "Commission created",
  "commission.settle": "Commission settled",
  "commission.cancel": "Commission cancelled",
  "commission.reverse": "Commission reversed",

  // Payout run
  "payout_run.create": "Payout run created",
  "payout_run.complete": "Payout run completed",
  "payout_run.fail": "Payout run failed",

  // Order
  "order.cancel": "Order cancelled",

  // Order, merchant storefront
  "order.merchant.status_change": "Order status changed",
  "order.merchant.ship": "Order marked shipped",
  "order.merchant.cancel": "Order cancelled by merchant",
  "order.merchant.note_add": "Order note added",
  "order.merchant.payment_confirm": "Order payment confirmed",
  "order.merchant.payment_fail": "Order payment marked failed",
  "order.merchant.refund_create": "Order refund issued",

  // Report, merchant
  "report.merchant.customer_create": "Customer reported to Atlas",
  "report.merchant.customer_withdraw": "Customer report withdrawn",

  // Treasury
  "treasury.fund": "Treasury funded",
  "treasury.transfer_to_bank": "Treasury transfer to bank",
  "treasury.adjustment": "Treasury adjustment",
  "treasury.approve_outbound": "Treasury outbound approved",
  "treasury.reject_outbound": "Treasury outbound rejected",
  "treasury.settle_outbound": "Treasury outbound settled",
  "treasury.reconcile": "Treasury event reconciled",
  "treasury.period_close": "Treasury period closed",
  "treasury.provider_payout.create": "Provider payout batch created",
  "treasury.provider_payout.approve": "Provider payout batch approved",
  "treasury.provider_payout.settle": "Provider payout batch settled",
  "treasury.provider_payout.fail": "Provider payout batch failed",
  "treasury.provider_payout.cancel": "Provider payout batch cancelled",

  // Catalog
  "catalog.category.create": "Catalog category created",
  "catalog.category.update": "Catalog category updated",
  "catalog.category.delete": "Catalog category deleted",
  "catalog.category.reorder": "Catalog category reordered",
  "catalog.plan.create": "Catalog plan created",
  "catalog.plan.update": "Catalog plan updated",
  "catalog.plan.delete": "Catalog plan deleted",
  "catalog.plan.reorder": "Catalog plan reordered",
  "catalog.plan.toggle": "Catalog plan toggled",
  "catalog.pricing.update": "Catalog pricing updated",

  // Subscription plans
  "subscription.plan.create": "Subscription plan created",
  "subscription.plan.update": "Subscription plan updated",
  "subscription.plan.delete": "Subscription plan deleted",
  "subscription.plan.toggle": "Subscription plan toggled",
  "subscription.plan.reorder": "Subscription plan reordered",

  // Subscription, merchant
  "subscription.merchant.start": "Merchant subscription started",
  "subscription.merchant.change_plan": "Merchant plan changed",
  "subscription.merchant.change_cycle": "Merchant billing cycle changed",
  "subscription.merchant.cancel": "Merchant subscription cancelled",
  "subscription.merchant.reactivate": "Merchant subscription reactivated",
  "subscription.merchant.charge_success": "Merchant subscription charge succeeded",
  "subscription.merchant.charge_failure": "Merchant subscription charge failed",
  "subscription.merchant.past_due": "Merchant subscription past due",

  // Invoice, merchant
  "invoice.merchant.issue": "Merchant invoice issued",
  "invoice.merchant.paid": "Merchant invoice paid",
  "invoice.merchant.failed": "Merchant invoice failed",
  "invoice.merchant.void": "Merchant invoice voided",
  "invoice.merchant.refunded": "Merchant invoice refunded",

  // Support
  "support.ticket.status_change": "Ticket status changed",
  "support.ticket.priority_change": "Ticket priority changed",
  "support.ticket.assign": "Ticket assigned",
  "support.ticket.reply": "Ticket reply sent",
  "support.ticket.note": "Internal note added",
  "support.ticket.tag": "Ticket tagged",
  "support.ticket.snooze": "Ticket snoozed",
  "support.ticket.escalate": "Ticket escalated to provider",
  "support.ticket.incident_set": "Ticket added to incident",
  "support.ticket.merge": "Tickets merged",
  "support.ticket.bulk": "Bulk ticket action",
  "support.ticket.retry_fulfillment": "Fulfillment retry triggered",
  "support.ticket.credit_commission": "Commission credited via support",
  "support.ticket.hold_payout": "Payout held via support",
  "support.ticket.change_plan": "Plan change requested via support",
  "support.ticket.extend_trial": "Trial extended via support",
  "support.ticket.reset_template": "Template reset via support",
  "support.ticket.compensation": "Compensation issued via support",
};

export const FINANCIAL_RESOURCE_LABEL: Record<AuditResourceType, string> = {
  wallet: "Wallet",
  order: "Order",
  refund: "Refund",
  commission: "Commission",
  payout_run: "Payout run",
  treasury_event: "Treasury event",
  treasury_period: "Treasury period",
  provider_payout_batch: "Provider payout batch",
  catalog_category: "Catalog category",
  catalog_plan: "Catalog plan",
  catalog_network: "Catalog network",
  subscription_plan: "Subscription plan",
  subscription: "Subscription",
  invoice: "Invoice",
  support_conversation: "Support conversation",
  customer: "Customer",
};

export function sectionForAction(
  action: AuditAction
): AtlasSection | undefined {
  if (action.startsWith("wallet.customer.")) return "digital_services";
  if (action.startsWith("wallet.storefront_user.")) return "digital_services";
  if (action.startsWith("wallet.reseller.")) return "resellers";
  if (action.startsWith("wallet.merchant.")) return "ecommerce";
  if (action.startsWith("order.merchant.")) return "ecommerce";
  if (action.startsWith("order.")) return "digital_services";
  if (action.startsWith("refund.")) return "digital_services";
  if (action.startsWith("report.merchant.")) return "ecommerce";
  if (action.startsWith("commission.")) return "resellers";
  if (action.startsWith("payout_run.")) return "resellers";
  if (action.startsWith("treasury.")) return "admin";
  if (action.startsWith("catalog.")) return "digital_services";
  if (action.startsWith("subscription.")) return "ecommerce";
  if (action.startsWith("invoice.")) return "ecommerce";
  if (action.startsWith("support.")) return "admin";
  return undefined;
}

export const ALL_FINANCIAL_ACTIONS: AuditAction[] = Object.keys(
  FINANCIAL_ACTION_LABEL
) as AuditAction[];

export const ALL_FINANCIAL_RESOURCE_TYPES: AuditResourceType[] = Object.keys(
  FINANCIAL_RESOURCE_LABEL
) as AuditResourceType[];