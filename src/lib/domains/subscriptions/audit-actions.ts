// lib/domains/subscriptions/audit-actions.ts
//
// Named exports for the audit actions this domain emits. Consumers can
// import the constant rather than the string literal, so a rename in the
// audit union is a compile error here instead of a silent drift.

export const SUBSCRIPTION_PLAN_CREATE = "subscription.plan.create" as const;
export const SUBSCRIPTION_PLAN_UPDATE = "subscription.plan.update" as const;
export const SUBSCRIPTION_PLAN_DELETE = "subscription.plan.delete" as const;
export const SUBSCRIPTION_PLAN_TOGGLE = "subscription.plan.toggle" as const;
export const SUBSCRIPTION_PLAN_REORDER = "subscription.plan.reorder" as const;