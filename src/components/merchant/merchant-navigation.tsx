"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantNavItem } from "@/lib/merchant/nav/merchant-nav-items";

interface MerchantNavigationProps {
  items: MerchantNavItem[];
  ariaLabel?: string;
  onNavigate?: () => void;
  badges?: Record<string, number>;
}

export function MerchantNavigation({
  items,
  ariaLabel,
  onNavigate,
  badges,
}: MerchantNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      <ul role="list" className="space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const badgeCount = badges?.[item.href] ?? 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                )}
              >
                <AtlasIcon name={item.icon} className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    aria-label={badgeCount + " unread"}
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white"
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}