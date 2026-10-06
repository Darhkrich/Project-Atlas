/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/admin-sidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { sidebarProviderCounts } from "@/lib/admin/providers/sidebar-counts";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { navGroups } from "@/lib/admin/nav/nav-items";
import { filterNavGroups } from "@/lib/admin/nav/nav-filter";
 
interface LiveBadge {
  count: number;
  tone: "warning" | "danger";
  label: string;
}

const STORAGE_KEY = "atlas-admin-sidebar-groups";

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const admin = useCurrentAdmin();
  const { providers } = useProviders();
  const providerCounts = useMemo(
    () => sidebarProviderCounts(providers),
    [providers]
  );

  const filteredGroups = useMemo(
    () => filterNavGroups(navGroups, admin),
    [admin]
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
    return filteredGroups.find(group =>
      group.items.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`))
    )?.label;
  }, [pathname, filteredGroups]);

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
            {filteredGroups.map(group => {
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
                        aria-hidden="true"
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
                                  aria-hidden="true"
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