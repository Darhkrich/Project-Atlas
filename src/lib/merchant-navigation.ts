// Compatibility shim. The authoritative merchant nav source lives at
// lib/merchant/nav/. Delete this shim once every consumer imports from
// the new location directly.

export type { MerchantNavItem } from "./merchant/nav/merchant-nav-items";
export {
  merchantNavItems,
  MERCHANT_NAV_GROUP_LABELS,
  MERCHANT_NAV_GROUP_ORDER,
} from "./merchant/nav/merchant-nav-items";