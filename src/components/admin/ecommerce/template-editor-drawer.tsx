/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";

interface TemplateEditorDrawerProps {
  template: EcommerceTemplate | null;
  onClose: () => void;
  onSave: (template: EcommerceTemplate) => void;
}

export function TemplateEditorDrawer({ template, onClose, onSave }: TemplateEditorDrawerProps) {
  const [edited, setEdited] = useState<EcommerceTemplate | null>(template);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  if (!edited) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: keyof EcommerceTemplate, value: any) => {
    setEdited(prev => ({ ...prev!, [field]: value }));
  };

  const handleAllowedPlansChange = (value: string) => {
    const plans = value.split(",").map(s => s.trim()).filter(Boolean);
    setEdited(prev => ({ ...prev!, allowedPlans: plans }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("thumbnail", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(edited);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Edit Template</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm">Name</label>
            <Input value={edited.name} onChange={e => handleChange("name", e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Category</label>
            <Input value={edited.category} onChange={e => handleChange("category", e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Input value={edited.description} onChange={e => handleChange("description", e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Component Name</label>
            <Input value={edited.componentName} onChange={e => handleChange("componentName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Allowed Plans (comma separated)</label>
            <Input value={edited.allowedPlans.join(", ")} onChange={e => handleAllowedPlansChange(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Thumbnail</label>
            <div className="mt-2 flex items-center gap-4">
              {edited.thumbnail ? (
                <img src={edited.thumbnail} alt="Thumbnail" className="h-16 w-16 rounded-md object-cover border border-neutral-200" />
              ) : (
                <div className="h-16 w-16 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <AtlasIcon name="image" className="h-6 w-6" />
                </div>
              )}
              <div>
                <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => thumbnailInputRef.current?.click()}>Upload Thumbnail</Button>
                {edited.thumbnail && (
                  <button
                    onClick={() => handleChange("thumbnail", "")}
                    className="ml-2 text-xs text-neutral-500 hover:text-danger-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={edited.isActive}
              onChange={e => handleChange("isActive", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Active</span>
          </div>
        </div>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}