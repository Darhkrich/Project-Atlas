"use client";

import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { getTemplateById } from "@/lib/merchant/onboarding/templates";

interface TemplateSwitchModalProps {
  open: boolean;
  fromTemplateId: string | null;
  toTemplateId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TemplateSwitchModal({
  open,
  fromTemplateId,
  toTemplateId,
  onCancel,
  onConfirm,
}: TemplateSwitchModalProps) {
  const from = fromTemplateId ? getTemplateById(fromTemplateId) : undefined;
  const to = toTemplateId ? getTemplateById(toTemplateId) : undefined;

  return (
    <AtlasModalShell
      open={open}
      onClose={onCancel}
      title="Switch template?"
      description="This changes how your storefront is laid out."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <AtlasIcon name="check" aria-hidden="true" className="h-4 w-4" />
            Switch template
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Current
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {from?.name ?? "Unknown"}
            </p>
            {from && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {from.description}
              </p>
            )}
          </div>
          <div className="rounded-lg border-2 border-brand-300 bg-brand-50/50 p-3 dark:border-brand-800 dark:bg-brand-900/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              New
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {to?.name ?? "Unknown"}
            </p>
            {to && (
              <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                {to.description}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            What carries over
          </p>
          <ul role="list" className="mt-2 space-y-1.5">
            {[
              "Store name, tagline, and description",
              "Colors, logo, and hero text",
              "Products and categories",
              "Domain and shipping settings",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <AtlasIcon
                  name="check"
                  aria-hidden="true"
                  className="mt-0.5 h-3 w-3 shrink-0 text-success-600 dark:text-success-400"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          You have 30 seconds to undo the switch from the storefront page.
        </p>
      </div>
    </AtlasModalShell>
  );
}