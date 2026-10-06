// lib/admin/resellers/tier-constants.ts
//
// Sentinel used when a reseller has no tier assigned yet. A new reseller
// created via onboarding starts without a tier. Rather than collapsing
// that state into an empty string, we bucket those resellers under a
// named identity so tier-keyed projections stay honest.
//
// The double-underscore prefix means this value cannot collide with a
// real tier ID from the catalog.

export const UNASSIGNED_TIER_ID = "__unassigned";
export const UNASSIGNED_TIER_NAME = "Unassigned";