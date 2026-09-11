"use client";

import { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";

interface TemplatePreviewModalProps {
  template: EcommerceTemplate;
  onClose: () => void;
}

export function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  // In production, this would render the actual React component associated with `template.componentName`
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-semibold">{template.name} Preview</h3>
            <p className="text-sm text-neutral-500">{template.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-4">
          {/* Mock preview area – replace with actual template renderer when integrated */}
          <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
            <div className="h-48 rounded-lg bg-brand-50 flex items-center justify-center dark:bg-brand-900/20">
              <p className="text-4xl font-bold text-brand-700 dark:text-brand-300">Storefront</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-neutral-100 p-4 h-32 dark:bg-neutral-800"></div>
              <div className="rounded-lg bg-neutral-100 p-4 h-32 dark:bg-neutral-800"></div>
              <div className="rounded-lg bg-neutral-100 p-4 h-32 dark:bg-neutral-800"></div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm font-medium">Allowed Plans:</p>
            {template.allowedPlans.map(plan => (
              <Badge key={plan} variant="info">{plan}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}