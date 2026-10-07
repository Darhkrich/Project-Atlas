"use client";

import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SalesContactModal({ open, onClose }: Props) {
  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Enterprise plan"
      description="Bespoke terms, contracts, and support."
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4 rounded-lg bg-brand-50 p-4 dark:bg-brand-950/40">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            <AtlasIcon name="headphones" className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Enterprise is customized to your business. Pricing, payment terms,
            service level, and support are negotiated directly with Atlas.
          </p>
        </div>

        <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <a
            href="mailto:sales@atlas.com?subject=Enterprise%20plan%20enquiry"
            className="flex-1"
          >
            <Button className="w-full">
              <AtlasIcon name="send" className="h-4 w-4" aria-hidden="true" />
              Email sales
            </Button>
          </a>
        </div>
      </div>
    </AtlasModalShell>
  );
}