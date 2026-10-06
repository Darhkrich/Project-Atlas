/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasField } from "@/components/atlas/field";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useSlugAvailability } from "@/lib/merchant/storefront/use-slug-availability";
import { storefrontSlugSuggestions } from "@/lib/merchant/storefront/slug-suggestions";

interface SubdomainEditorProps {
  currentSlug: string;
  root: string;
  isCustomSlug: boolean;
  storeName: string;
  onChange: (slug: string) => { ok: boolean; error?: string };
}

export function SubdomainEditor({
  currentSlug,
  root,
  isCustomSlug,
  storeName,
  onChange,
}: SubdomainEditorProps) {
  const [draft, setDraft] = useState(currentSlug);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availability = useSlugAvailability(draft);
  const suggestions = storefrontSlugSuggestions(storeName);

  useEffect(() => {
    setDraft(currentSlug);
  }, [currentSlug]);

  const normalised = draft.trim().toLowerCase();
  const dirty = normalised !== currentSlug;
  const canSave =
    dirty &&
    (availability.state === "available" ||
      availability.state === "idle");

  const handleSave = () => {
    const result = onChange(normalised);
    if (!result.ok) {
      setError(result.error ?? "Could not save your subdomain.");
      return;
    }
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const availabilityLine = (() => {
    if (availability.state === "checking") {
      return {
        text: "Checking availability...",
        className: "text-neutral-500 dark:text-neutral-400",
      };
    }
    if (availability.state === "taken") {
      return {
        text:
          "Taken. Try " +
          availability.suggestion +
          " instead.",
        className: "text-danger-600 dark:text-danger-400",
      };
    }
    if (availability.state === "reserved") {
      return {
        text: "Reserved by Atlas. Pick a different name.",
        className: "text-danger-600 dark:text-danger-400",
      };
    }
    if (availability.state === "invalid") {
      return {
        text: "Use letters, numbers, and hyphens only.",
        className: "text-danger-600 dark:text-danger-400",
      };
    }
    if (availability.state === "available") {
      return {
        text: "Available.",
        className: "text-success-600 dark:text-success-400",
      };
    }
    return {
      text: normalised
        ? "Your storefront will be served from " + normalised + "." + root
        : "Enter a subdomain",
      className: "text-neutral-500 dark:text-neutral-400",
    };
  })();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Atlas subdomain
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Free and always active. This is the address customers can always reach.
        </p>
      </div>

      <AtlasField
        label="Subdomain"
        htmlFor="subdomain-slug"
        hint={error ?? undefined}
        error={error ?? undefined}
      >
        <div className="flex items-stretch">
          <input
            id="subdomain-slug"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="your-store"
            autoComplete="off"
            className={cn(
              "min-w-0 flex-1 rounded-l-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white",
              availability.state === "taken" ||
                availability.state === "reserved" ||
                availability.state === "invalid"
                ? "border-danger-500"
                : ""
            )}
          />
          <span className="flex items-center rounded-r-lg border border-l-0 border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            .{root}
          </span>
        </div>
      </AtlasField>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          role="status"
          aria-live="polite"
          className={cn("text-[11px]", availabilityLine.className)}
        >
          {saved ? "Saved. It may take a moment to propagate." : availabilityLine.text}
        </p>
        <Button variant="outline" onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </div>

      {suggestions.length > 0 && !normalised && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Suggestions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft(s)}
                aria-label={"Use suggested subdomain: " + s}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-brand-800 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
              >
                <AtlasIcon name="globe" aria-hidden="true" className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCustomSlug && (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          This subdomain was changed from the default. The originally assigned slug is no longer valid.
        </p>
      )}
    </div>
  );
}