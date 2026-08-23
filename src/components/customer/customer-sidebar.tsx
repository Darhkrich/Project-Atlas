import { customerNavItems } from "@/lib/customer-navigation";
import { CustomerNavigation } from "./customer-navigation";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface CustomerSidebarProps {
  className?: string;
}

export function CustomerSidebar({ className = "" }: CustomerSidebarProps) {
  const primaryItems = customerNavItems.filter((item) => item.section === "primary");
  const secondaryItems = customerNavItems.filter((item) => item.section === "secondary");

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <div>
          <CustomerNavigation
            items={primaryItems}
            ariaLabel="Primary customer navigation"
            className="space-y-1"
          />
          <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />
          <CustomerNavigation
            items={secondaryItems}
            ariaLabel="Secondary customer navigation"
            className="space-y-1"
          />
        </div>

        {/* Download App Widget */}
        <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/40">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white dark:bg-brand-700">
              <AtlasIcon name="mobile" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Download Atlas App
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Experience the best services on the go
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-neutral-700">
              App Store
            </button>
            <button className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-neutral-700">
              Google Play
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}