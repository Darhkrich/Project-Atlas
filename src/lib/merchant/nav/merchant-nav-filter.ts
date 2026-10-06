import type { MerchantNavItem } from "./merchant-nav-items";
import {
  MERCHANT_NAV_GROUP_LABELS,
  MERCHANT_NAV_GROUP_ORDER,
} from "./merchant-nav-items";

export interface MerchantNavGroup {
  group: MerchantNavItem["group"];
  label: string;
  items: MerchantNavItem[];
}

// Merchant roles do not exist yet. This is the seam. When they do, filter
// by a permission field on MerchantNavItem and return the reduced set.
export function filterMerchantNavItems(
  items: MerchantNavItem[]
): MerchantNavItem[] {
  return items;
}

export function groupMerchantNavItems(
  items: MerchantNavItem[]
): MerchantNavGroup[] {
  const groups: MerchantNavGroup[] = [];
  for (const group of MERCHANT_NAV_GROUP_ORDER) {
    const groupItems = items.filter((item) => item.group === group);
    if (groupItems.length === 0) continue;
    groups.push({
      group,
      label: MERCHANT_NAV_GROUP_LABELS[group],
      items: groupItems,
    });
  }
  return groups;
}