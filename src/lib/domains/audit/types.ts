// lib/domains/audit/types.ts
//
// Audit trail for money-adjacent mutations. One entry per mutation call.

export interface AuditActor {
  id: string;
  name: string;
  email: string;
}

export type AuditResourceType =
  | "wallet"
  | "order"
  | "refund"
  | "commission"
  | "payout_run"
  | "treasury_event"
  | "treasury_period"
  | "provider_payout_batch"
  | "catalog_category"
  | "catalog_plan"
  | "catalog_network"
  | "subscription_plan"
  | "subscription"
  | "invoice"
  | "support_conversation"
  | "customer";

export type AuditAction =
  // Wallet, storefront user
  | "wallet.storefront_user.fund"
  | "wallet.storefront_user.purchase"
  | "wallet.storefront_user.freeze"
  | "wallet.storefront_user.unfreeze"
  | "wallet.storefront_user.adjust"
  | "wallet.storefront_user.refund_credit"
  // Wallet, customer
  | "wallet.customer.fund"
  | "wallet.customer.withdraw_request"
  | "wallet.customer.withdraw_approve"
  | "wallet.customer.withdraw_reject"
  | "wallet.customer.withdraw_cancel"
  | "wallet.customer.freeze"
  | "wallet.customer.unfreeze"
  | "wallet.customer.adjust"
  | "wallet.customer.refund_credit"
  // Wallet, reseller
  | "wallet.reseller.fund"
  | "wallet.reseller.withdraw_request"
  | "wallet.reseller.withdraw_approve"
  | "wallet.reseller.withdraw_reject"
  | "wallet.reseller.withdraw_cancel"
  | "wallet.reseller.adjust"
  | "wallet.reseller.freeze"
  | "wallet.reseller.unfreeze"
  | "wallet.reseller.refund_credit"
  // Wallet, merchant
  | "wallet.merchant.fund"
  | "wallet.merchant.transfer"
  | "wallet.merchant.withdraw_request"
  | "wallet.merchant.withdraw_approve"
  | "wallet.merchant.withdraw_reject"
  | "wallet.merchant.withdraw_cancel"
  | "wallet.merchant.adjust"
  | "wallet.merchant.freeze"
  | "wallet.merchant.unfreeze"
  | "wallet.merchant.checkout_credit"
  | "wallet.merchant.plan_charge"
  | "wallet.merchant.refund_settled"
  | "wallet.merchant.dispute_resolve"
  // Refund, storefront user
  | "refund.storefront_user.create"
  | "refund.storefront_user.approve"
  | "refund.storefront_user.cancel"
  | "refund.storefront_user.reject"
  // Refund, general
  | "refund.create_requested"
  | "refund.approve"
  | "refund.reject"
  | "refund.process"
  | "refund.automatic"
  // Commission
  | "commission.reseller.credit"
  | "commission.create"
  | "commission.settle"
  | "commission.cancel"
  | "commission.reverse"
  // Payout run
  | "payout_run.create"
  | "payout_run.complete"
  | "payout_run.fail"
  // Order
  | "order.cancel"
  // Order, merchant storefront
  | "order.merchant.status_change"
  | "order.merchant.ship"
  | "order.merchant.cancel"
  | "order.merchant.note_add"
  | "order.merchant.payment_confirm"
  | "order.merchant.payment_fail"
  | "order.merchant.refund_create"
  // Report, merchant
  | "report.merchant.customer_create"
  | "report.merchant.customer_withdraw"
  // Treasury
  | "treasury.fund"
  | "treasury.transfer_to_bank"
  | "treasury.adjustment"
  | "treasury.approve_outbound"
  | "treasury.reject_outbound"
  | "treasury.settle_outbound"
  | "treasury.reconcile"
  | "treasury.period_close"
  | "treasury.provider_payout.create"
  | "treasury.provider_payout.approve"
  | "treasury.provider_payout.settle"
  | "treasury.provider_payout.fail"
  | "treasury.provider_payout.cancel"
  // Catalog
  | "catalog.category.create"
  | "catalog.category.update"
  | "catalog.category.delete"
  | "catalog.category.reorder"
  | "catalog.plan.create"
  | "catalog.plan.update"
  | "catalog.plan.delete"
  | "catalog.plan.reorder"
  | "catalog.plan.toggle"
  | "catalog.pricing.update"
  // Subscription plans
  | "subscription.plan.create"
  | "subscription.plan.update"
  | "subscription.plan.delete"
  | "subscription.plan.toggle"
  | "subscription.plan.reorder"
  // Subscription, merchant
  | "subscription.merchant.start"
  | "subscription.merchant.change_plan"
  | "subscription.merchant.change_cycle"
  | "subscription.merchant.cancel"
  | "subscription.merchant.reactivate"
  | "subscription.merchant.charge_success"
  | "subscription.merchant.charge_failure"
  | "subscription.merchant.past_due"
  // Invoice, merchant
  | "invoice.merchant.issue"
  | "invoice.merchant.paid"
  | "invoice.merchant.failed"
  | "invoice.merchant.void"
  | "invoice.merchant.refunded"
  // Support
  | "support.ticket.status_change"
  | "support.ticket.priority_change"
  | "support.ticket.assign"
  | "support.ticket.reply"
  | "support.ticket.note"
  | "support.ticket.tag"
  | "support.ticket.snooze"
  | "support.ticket.escalate"
  | "support.ticket.incident_set"
  | "support.ticket.merge"
  | "support.ticket.bulk"
  // Support, cross-domain stubs (wired in a follow-up batch)
  | "support.ticket.retry_fulfillment"
  | "support.ticket.credit_commission"
  | "support.ticket.hold_payout"
  | "support.ticket.change_plan"
  | "support.ticket.extend_trial"
  | "support.ticket.reset_template"
  | "support.ticket.compensation";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppendAuditInput {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  actor: AuditActor;
  metadata?: Record<string, unknown>;
}