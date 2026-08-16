import { customerNavItems } from "@/lib/customer-navigation";
import { CustomerNavigation } from "./customer-navigation";
import { cn } from "@/lib/utils";

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
        {/* Primary navigation */}
        <CustomerNavigation
          items={primaryItems}
          ariaLabel="Primary customer navigation"
          className="space-y-1"
        />

        {/* Divider + secondary navigation */}
        <div>
          <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />
          <CustomerNavigation
            items={secondaryItems}
            ariaLabel="Secondary customer navigation"
            className="space-y-1"
          />
        </div>
      </div>
    </aside>
  );
}