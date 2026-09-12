/* eslint-disable react/no-unescaped-entities */
// components/admin/services/service-icon-picker.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  SERVICE_ICON_CATALOG,
  iconLabelFor,
  resolveServiceIcon,
  searchIcons,
} from "@/lib/admin/services/icon-catalog";

interface ServiceIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export function ServiceIconPicker({
  value,
  onChange,
  disabled = false,
}: ServiceIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchIcons(query), [query]);
  const current = resolveServiceIcon(value);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        )}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200"
          aria-hidden="true"
        >
          <AtlasIcon name={current} className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{iconLabelFor(value)}</span>
        <span className="ml-auto text-xs text-neutral-400">Change</span>
      </button>

      <ModalShell
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        title="Choose an icon"
        description="Icons are shown on the storefront service grid."
        size="md"
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          >
            Cancel
          </Button>
        }
      >
        <div className="space-y-4">
          <Input
            aria-label="Search icons"
            placeholder="Search icons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {results.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No icons match "{query}".
            </p>
          ) : (
            <ul
              role="listbox"
              aria-label="Available icons"
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {results.map((option) => {
                const isCurrent = option.name === current;
                return (
                  <li key={option.name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => {
                        onChange(option.name);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full flex-col items-center gap-2 rounded-md border p-3 text-xs transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        isCurrent
                          ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      )}
                    >
                      <AtlasIcon
                        name={option.name}
                        className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                      />
                      <span className="truncate text-neutral-700 dark:text-neutral-300">
                        {option.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The icon catalog is fixed. Contact engineering to add new icons.
          </p>
        </div>
      </ModalShell>
    </>
  );
}