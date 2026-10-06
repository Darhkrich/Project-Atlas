// components/admin/audit-logs/audit-log-tabs.tsx
"use client";

import { cn } from "@/lib/utils";

export type AuditTab = "security" | "financial";

interface AuditLogTabsProps {
  value: AuditTab;
  onChange: (tab: AuditTab) => void;
  securityCount: number;
  financialCount: number;
}

export function AuditLogTabs({
  value,
  onChange,
  securityCount,
  financialCount,
}: AuditLogTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Audit streams"
      className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800"
    >
      <button
        type="button"
        role="tab"
        id="audit-tab-security"
        aria-selected={value === "security"}
        aria-controls="audit-panel-security"
        onClick={() => onChange("security")}
        className={cn(
          "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
          value === "security"
            ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
            : "border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        )}
      >
        <span>Security</span>
        <span className="min-w-5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-center text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {securityCount}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        id="audit-tab-financial"
        aria-selected={value === "financial"}
        aria-controls="audit-panel-financial"
        onClick={() => onChange("financial")}
        className={cn(
          "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
          value === "financial"
            ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
            : "border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        )}
      >
        <span>Financial</span>
        <span className="min-w-5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-center text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {financialCount}
        </span>
      </button>
    </div>
  );
}