"use client";

import { Button } from "@/components/admin/ui/button";

interface VerificationDocumentsModalProps {
  entityName: string;
  onClose: () => void;
}

export function VerificationDocumentsModal({ entityName, onClose }: VerificationDocumentsModalProps) {
  // Mock document list
  const documents = [
    { id: "DOC-1", label: "Business Registration Certificate", type: "PDF", status: "submitted" },
    { id: "DOC-2", label: "Government Issued ID", type: "JPG", status: "submitted" },
    { id: "DOC-3", label: "Proof of Address", type: "PDF", status: "missing" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Verification Documents</h3>
        <p className="text-sm text-neutral-500 mt-1">Submitted documents for {entityName}</p>
        <ul className="mt-4 space-y-3">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
              <div>
                <p className="font-medium">{doc.label}</p>
                <p className="text-xs text-neutral-500">{doc.type}</p>
              </div>
              {doc.status === "submitted" ? (
                <span className="text-success-600 text-sm">Submitted</span>
              ) : (
                <span className="text-danger-600 text-sm">Missing</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}