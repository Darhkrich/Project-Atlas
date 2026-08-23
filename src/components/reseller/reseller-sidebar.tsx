import { resellerNavItems } from "@/lib/reseller-navigation";
import { ResellerNavigation } from "./reseller-navigation";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

const groupLabels: Record<string, string> = {
  overview: "Overview",
  business: "Business",
  store: "Store",
  wallet: "Wallet",
  support: "Support",
};

export function ResellerSidebar({ className = "" }: { className?: string }) {
  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex-1 space-y-6">
          {Object.entries(groupLabels).map(([group, label]) => {
            const items = resellerNavItems.filter((item) => item.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {label}
                </p>
                <ResellerNavigation items={items} ariaLabel={`${label} navigation`} />
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/40">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white dark:bg-brand-700">
              <AtlasIcon name="store" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Your Storefront
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Share your store and earn commissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}