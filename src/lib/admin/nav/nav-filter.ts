// lib/admin/nav/nav-filter.ts
//
// Filters a nav group tree by the current admin's permissions. Items
// without a permission field are always visible. Groups with zero
// visible items are dropped. Pure function. No hooks.

import { hasPermission, type RbacSubject } from "@/lib/admin/rbac/access";
import type { NavGroup } from "./nav-items";

export function filterNavGroups(
  groups: NavGroup[],
  subject: RbacSubject | null
): NavGroup[] {
  const result: NavGroup[] = [];

  for (const group of groups) {
    const items = group.items.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(subject, item.permission);
    });

    if (items.length === 0) continue;

    result.push({ ...group, items });
  }

  return result;
}