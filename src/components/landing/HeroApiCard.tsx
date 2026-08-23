import { AtlasIcon } from "@/components/atlas/icons";

export function HeroApiCard() {
  return (
    <div className="absolute left-0 bottom-0 z-30 w-[220px] rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            API & Developer Access
          </h4>
          <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            Build. Integrate. Scale.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003D2E] text-white dark:bg-brand-800">
          <AtlasIcon name="code" className="h-4 w-4" />
        </div>
      </div>
      <button className="mt-2 inline-flex items-center text-xs font-medium text-[#003D2E] hover:underline dark:text-brand-300">
        Learn more
        <AtlasIcon name="arrow-right" className="ml-1 h-3 w-3" />
      </button>
    </div>
  );
}