// components/admin/shared/verification-documents-modal.tsx
"use client";

import { useId } from "react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";

export interface VerificationDocument {
  id: string;
  label: string;
  type: string;
  status: "submitted" | "missing";
}

interface VerificationDocumentsModalProps {
  open: boolean;
  entityName: string;
  documents: VerificationDocument[];
  onClose: () => void;
}

export function VerificationDocumentsModal({
  open,
  entityName,
  documents,
  onClose,
}: VerificationDocumentsModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 id={titleId} className="text-lg font-semibold">
          Verification documents
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Submitted documents for {entityName}
        </p>

        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            No documents submitted yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {doc.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {doc.type}
                  </p>
                </div>
                <Badge
                  variant={doc.status === "submitted" ? "success" : "danger"}
                >
                  {doc.status === "submitted" ? "Submitted" : "Missing"}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}