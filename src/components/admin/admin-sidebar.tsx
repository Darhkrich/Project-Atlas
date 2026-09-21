/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { sidebarProviderCounts } from "@/lib/admin/providers/sidebar-counts";

interface NavItem {
  label: string;
  href: string;
  icon: AtlasIconName;
  badge?: string | number;
  permission?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

interface LiveBadge {
  count: number;
  tone: "warning" | "danger";
  label: string;
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    collapsible: false,
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", href: "/admin/orders", icon: "orders", permission: "orders.read" },
      { label: "Transactions", href: "/admin/transactions", icon: "transactions", permission: "transactions.read" },
      { label: "Payments", href: "/admin/payments", icon: "credit-card", permission: "payments.read" },
      { label: "Refunds", href: "/admin/refunds", icon: "receipt", permission: "refunds.read" },
      { label: "Domains", href: "/admin/domains", icon: "globe", permission: "domains.read" },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "Customers", href: "/admin/customers", icon: "user", permission: "customers.read" },
      { label: "Reseller Accounts", href: "/admin/resellers", icon: "users", permission: "resellers.read" },
      { label: "Merchant Accounts", href: "/admin/ecommerce/merchants", icon: "briefcase", permission: "ecommerce.merchants.read" },
      { label: "Reported Accounts", href: "/admin/reported-accounts", icon: "alert", permission: "customers.read" },
      { label: "Admin Users", href: "/admin/admin-users", icon: "shield", permission: "admins.read" },
      { label: "Reseller Storefront Users", href: "/admin/resellers/storefront-users", icon: "users", permission: "customers.read" },
      { label: "Merchant Storefront Users", href: "/admin/ecommerce/storefront-users", icon: "users", permission: "customers.read" },
    ],
  },
  {
    label: "Resellers",
    items: [
      { label: "Reseller Dashboard", href: "/admin/resellers/dashboard", icon: "sales", permission: "resellers.dashboard.read" },
      { label: "Commission Wallets", href: "/admin/resellers/commission-wallets", icon: "wallet", permission: "resellers.commissions.read" },
      { label: "Analytics", href: "/admin/resellers/analytics", icon: "bar-chart", permission: "resellers.analytics.read" },
      { label: "Tiers", href: "/admin/resellers/tiers", icon: "star", permission: "resellers.tiers.read" },
      { label: "Verification Queue", href: "/admin/resellers/verification-queue", icon: "shield", permission: "resellers.verify" },
      { label: "Support Tickets", href: "/admin/resellers/support-tickets", icon: "support", permission: "support.read" },
      { label: "Promotions", href: "/admin/resellers/promotions", icon: "gift", permission: "resellers.promotions.read" },
      { label: "Storefronts", href: "/admin/resellers/storefronts", icon: "store", permission: "resellers.storefronts.read" },
    ],
  },
  {
    label: "E-commerce",
    items: [
      { label: "E‑commerce Dashboard", href: "/admin/ecommerce/dashboard", icon: "sales", permission: "ecommerce.dashboard.read" },
      { label: "Subscriptions", href: "/admin/ecommerce/subscriptions", icon: "repeat", permission: "ecommerce.subscriptions.read" },
      { label: "Templates", href: "/admin/ecommerce/templates", icon: "file-text", permission: "ecommerce.templates.read" },
      { label: "Payments", href: "/admin/ecommerce/payments", icon: "credit-card", permission: "ecommerce.payments.read" },
      { label: "Support", href: "/admin/ecommerce/support", icon: "support", permission: "ecommerce.support.read" },
      { label: "Analytics", href: "/admin/ecommerce/analytics", icon: "bar-chart", permission: "ecommerce.analytics.read" },
      { label: "Settings", href: "/admin/ecommerce/settings", icon: "settings", permission: "ecommerce.settings.read" },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Treasury", href: "/admin/treasury", icon: "wallet", permission: "treasury.view" },
   
      { label: "Wallets", href: "/admin/wallets", icon: "wallet", permission: "wallets.read" },
      { label: "Revenue", href: "/admin/revenue", icon: "trending-up", permission: "revenue.read" },
      { label: "Commissions", href: "/admin/commissions", icon: "percent", permission: "commissions.read" },
      { label: "Pricing", href: "/admin/pricing", icon: "price", permission: "pricing.read" },
      { label: "Promotions", href: "/admin/promotions", icon: "gift", permission: "promotions.read" },
     ],
  },
  {
    label: "Services",
    items: [
      { label: "Services", href: "/admin/services", icon: "grid", permission: "services.read" },
      { label: "Data Plans", href: "/admin/data-plans", icon: "wifi", permission: "data_plans.read" },
      { label: "Providers", href: "/admin/providers", icon: "server", permission: "providers.read" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Storefronts", href: "/admin/storefronts", icon: "store", permission: "storefronts.read" },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Support", href: "/admin/support", icon: "support", permission: "support.read" },
      { label: "Notifications", href: "/admin/notifications", icon: "bell", permission: "notifications.read" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "bar-chart", permission: "analytics.read" },
      { label: "Reports", href: "/admin/reports", icon: "file-text", permission: "reports.read" },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Security Center", href: "/admin/security", icon: "lock", permission: "security.read" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: "list", permission: "audit_logs.read" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "settings", permission: "settings.read" },
    ],
  },
];

const STORAGE_KEY = "atlas-admin-sidebar-groups";

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const { providers } = useProviders();
  const providerCounts = useMemo(
    () => sidebarProviderCounts(providers),
    [providers]
  );

  const liveBadges = useMemo<Record<string, LiveBadge>>(() => {
    const map: Record<string, LiveBadge> = {};
    if (providerCounts.attention > 0) {
      map["/admin/providers"] = {
        count: providerCounts.attention,
        tone: providerCounts.down > 0 ? "danger" : "warning",
        label: `${providerCounts.attention} provider${
          providerCounts.attention === 1 ? "" : "s"
        } need attention`,
      };
    }
    return map;
  }, [providerCounts]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setOpenGroups(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
    } catch {}
  }, [openGroups]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeGroup = useMemo(() => {
    return navGroups.find(group =>
      group.items.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`))
    )?.label;
  }, [pathname]);

  useEffect(() => {
    if (!activeGroup) return;
    setOpenGroups(current => {
      if (current[activeGroup]) return current;
      return { ...current, [activeGroup]: true };
    });
  }, [activeGroup]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(current => ({ ...current, [groupLabel]: !current[groupLabel] }));
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-neutral-200 bg-white",
          "dark:border-neutral-800 dark:bg-neutral-950",
          "transition-transform duration-200 ease-in-out",
          "lg:static lg:z-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-neutral-200 px-5 dark:border-neutral-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2" aria-label="Atlas Admin Dashboard">
            <span className="text-xl font-bold tracking-tight text-brand-600">Atlas</span>
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Admin
            </span>
          </Link>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {navGroups.map(group => {
              const isGroupActive = group.label === activeGroup;
              const isOpen = group.collapsible === false || openGroups[group.label] || isGroupActive;

              return (
                <section key={group.label}>
                  {group.collapsible === false ? (
                    <div className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
                      {group.label}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        "flex w-full items-center justify-between",
                        "rounded-md px-3 py-1.5",
                        "text-[10px] font-bold uppercase tracking-[0.12em]",
                        "text-neutral-400 transition-colors",
                        "hover:bg-neutral-100 hover:text-neutral-600",
                        "dark:text-neutral-500",
                        "dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
                      )}
                      aria-expanded={isOpen}
                    >
                      <span>{group.label}</span>
                      <AtlasIcon
                        name="chevron-down"
                        className={cn("h-3.5 w-3.5 transition-transform", !isOpen && "-rotate-90")}
                      />
                    </button>
                  )}

                  <div className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <ul className="mt-1 space-y-0.5">
                        {group.items.map(item => {
                          const active = isActive(item.href);
                          const live = liveBadges[item.href];
                          const badgeCount = live ? live.count : item.badge;
                          const badgeTone = live?.tone;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "group flex items-center gap-3 rounded-lg px-3 py-2.5",
                                  "text-sm font-medium",
                                  "transition-colors duration-150",
                                  active
                                    ? ["bg-brand-50 text-brand-700", "dark:bg-brand-950/50 dark:text-brand-300"]
                                    : [
                                        "text-neutral-600",
                                        "hover:bg-neutral-100",
                                        "hover:text-neutral-950",
                                        "dark:text-neutral-400",
                                        "dark:hover:bg-neutral-900",
                                        "dark:hover:text-neutral-100",
                                      ]
                                )}
                              >
                                <AtlasIcon
                                  name={item.icon}
                                  className={cn(
                                    "h-[18px] w-[18px] shrink-0",
                                    active
                                      ? "text-brand-600 dark:text-brand-400"
                                      : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"
                                  )}
                                />
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                {badgeCount !== undefined && (
                                  <span
                                    aria-label={live?.label}
                                    className={cn(
                                      "min-w-5 rounded-full px-1.5 py-0.5",
                                      "text-center text-[10px] font-semibold",
                                      badgeTone === "danger" &&
                                        "bg-danger-100 text-danger-700 dark:bg-danger-900/60 dark:text-danger-300",
                                      badgeTone === "warning" &&
                                        "bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300",
                                      !badgeTone &&
                                        active &&
                                        "bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300",
                                      !badgeTone &&
                                        !active &&
                                        "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                    )}
                                  >
                                    {badgeCount}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                System operational
              </span>
            </div>
            <p className="mt-1 text-[10px] text-neutral-400">Atlas Control Center</p>
          </div>
        </div>
      </aside>
    </>
  );
}