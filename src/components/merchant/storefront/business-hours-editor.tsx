"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  DAY_OF_WEEK_LABEL,
  DAY_OF_WEEK_ORDER,
} from "@/lib/merchant/storefront/config-labels";
import {
  DEFAULT_BUSINESS_HOURS,
  type BusinessHours,
  type BusinessHoursDay,
  type DayOfWeek,
} from "@/types/merchant-storefront";

interface BusinessHoursEditorProps {
  value: BusinessHours | undefined;
  onChange: (value: BusinessHours) => void;
}

function findDay(
  hours: BusinessHours,
  day: DayOfWeek
): BusinessHoursDay {
  const found = hours.find((h) => h.day === day);
  if (found) return found;
  const fallback = DEFAULT_BUSINESS_HOURS.find((h) => h.day === day);
  return fallback ?? { day, closed: true, open: "09:00", close: "18:00" };
}

const timeInputClass =
  "rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white";

export function BusinessHoursEditor({
  value,
  onChange,
}: BusinessHoursEditorProps) {
  const hours = value ?? DEFAULT_BUSINESS_HOURS;

  const patchDay = (day: DayOfWeek, patch: Partial<BusinessHoursDay>) => {
    const next = DAY_OF_WEEK_ORDER.map((d) => {
      const current = findDay(hours, d);
      if (d !== day) return current;
      return { ...current, ...patch };
    });
    onChange(next);
  };

  const applyToAll = () => {
    const monday = findDay(hours, "mon");
    const next = DAY_OF_WEEK_ORDER.map((d) => ({
      ...findDay(hours, d),
      open: monday.open,
      close: monday.close,
      closed: monday.closed,
    }));
    onChange(next);
  };

  const isOpenNow = (day: BusinessHoursDay): boolean => {
    if (day.closed) return false;
    const now = new Date();
    const dayIdx = now.getDay();
    const map: Record<DayOfWeek, number> = {
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
      sun: 0,
    };
    if (map[day.day] !== dayIdx) return false;
    const [oh, om] = day.open.split(":").map(Number);
    const [ch, cm] = day.close.split(":").map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Business hours
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            Shown on your storefront contact section.
          </p>
        </div>
        <button
          type="button"
          onClick={applyToAll}
          className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Apply Monday to all
        </button>
      </div>

      <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {DAY_OF_WEEK_ORDER.map((day) => {
          const row = findDay(hours, day);
          const isNow = isOpenNow(row);
          return (
            <li
              key={day}
              className="flex flex-wrap items-center gap-3 py-2.5"
            >
              <label className="flex w-28 shrink-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={!row.closed}
                  onChange={(e) =>
                    patchDay(day, { closed: !e.target.checked })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
                  aria-label={"Open on " + DAY_OF_WEEK_LABEL[day]}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    row.closed
                      ? "text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-900 dark:text-neutral-100"
                  )}
                >
                  {DAY_OF_WEEK_LABEL[day]}
                </span>
                {isNow && (
                  <span className="rounded-full bg-success-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success-700 dark:bg-success-900/30 dark:text-success-300">
                    Now
                  </span>
                )}
              </label>

              {row.closed ? (
                <span className="flex-1 text-xs italic text-neutral-400 dark:text-neutral-500">
                  Closed
                </span>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={row.open}
                    onChange={(e) => patchDay(day, { open: e.target.value })}
                    aria-label={DAY_OF_WEEK_LABEL[day] + " opening time"}
                    className={timeInputClass}
                  />
                  <span
                    aria-hidden="true"
                    className="text-xs text-neutral-400"
                  >
                    to
                  </span>
                  <input
                    type="time"
                    value={row.close}
                    onChange={(e) => patchDay(day, { close: e.target.value })}
                    aria-label={DAY_OF_WEEK_LABEL[day] + " closing time"}
                    className={timeInputClass}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 p-2.5 dark:border-info-800/60 dark:bg-info-900/20">
        <AtlasIcon
          name="info"
          aria-hidden="true"
          className="mt-0.5 h-3 w-3 shrink-0 text-info-600 dark:text-info-400"
        />
        <p className="text-[10px] leading-relaxed text-info-900 dark:text-info-200">
          Times use Ghana local time (GMT+0).
        </p>
      </div>
    </div>
  );
}