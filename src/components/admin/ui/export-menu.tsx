/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/ui/export-menu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type ExportFormat = "csv" | "excel" | "pdf";

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  formats?: ExportFormat[];
}

const FORMAT_LABEL: Record<ExportFormat, string> = {
  csv: "CSV",
  excel: "Excel",
  pdf: "PDF",
};

export function ExportMenu({
  onExport,
  disabled,
  formats = ["csv", "excel", "pdf"],
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, formats.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onExport(formats[activeIndex]);
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, formats, activeIndex, onExport]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Export
      </Button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {formats.map((format, index) => (
            <li key={format} role="none">
              <button
                role="menuitem"
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onExport(format);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  index === activeIndex
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {FORMAT_LABEL[format]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}