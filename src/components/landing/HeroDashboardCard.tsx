import { AtlasIcon } from "@/components/atlas/icons";

export function HeroDashboardCard() {
  return (
    <div className="absolute -right-4 top-0 z-30 w-[240px] rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Business Overview</span>
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">This Month ▾</span>
      </div>
      <div className="mt-2">
        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Total Sales</div>
        <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">₵ 3,245.00</div>
      </div>

      {/* Chart */}
      <svg className="mt-2 h-10 w-full" viewBox="0 0 200 40" fill="none">
        <path d="M0,35 L30,30 L60,33 L90,20 L120,25 L150,10 L180,15 L200,5" stroke="#003D2E" strokeWidth="1.5" fill="none" />
      </svg>

      <div className="mt-2 flex gap-4">
        <div className="flex items-center gap-1">
          <AtlasIcon name="bag" className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
          <span className="text-[10px] text-neutral-600 dark:text-neutral-400">256 Orders</span>
        </div>
        <div className="flex items-center gap-1">
          <AtlasIcon name="users" className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
          <span className="text-[10px] text-neutral-600 dark:text-neutral-400">189 Customers</span>
        </div>
      </div>
    </div>
  );
}