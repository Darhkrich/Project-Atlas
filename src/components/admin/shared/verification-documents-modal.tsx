/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/admin/formatters";
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_STATUS_VARIANT,
} from "@/lib/admin/resellers/verification-labels";
import type { VerificationDocument } from "@/lib/admin/types/verification-document";

export type { VerificationDocument };

export interface VerificationContextField {
  label: string;
  value: string;
  mono?: boolean;
}

export interface VerificationContext {
  subtitle?: string;
  fields: VerificationContextField[];
}

interface VerificationDocumentsModalProps {
  open: boolean;
  entityName: string;
  documents: VerificationDocument[];
  context?: VerificationContext;
  onClose: () => void;
}

export function VerificationDocumentsModal({
  open,
  entityName,
  documents,
  context,
  onClose,
}: VerificationDocumentsModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const titleId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedId(documents[0]?.id ?? null);
  }, [open, documents]);

  if (!open) return null;

  const selected = documents.find((d) => d.id === selectedId) ?? null;
  const hasContext = context && context.fields.length > 0;

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
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900">
        <div className="border-b border-neutral-200 p-5 dark:border-neutral-800">
          <h3 id={titleId} className="text-lg font-semibold">
            Verification review
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {entityName}
            {context?.subtitle ? " · " + context.subtitle : ""}
          </p>
        </div>

        {documents.length === 0 && !hasContext ? (
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No documents submitted yet.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "grid flex-1 overflow-y-auto",
              hasContext
                ? "grid-cols-1 lg:grid-cols-[minmax(0,16rem)_minmax(0,16rem)_1fr]"
                : "grid-cols-1 md:grid-cols-[minmax(0,18rem)_1fr]"
            )}
          >
            {documents.length > 0 && (
              <section
                aria-label="Submitted documents"
                className="border-b border-neutral-200 p-3 lg:border-b-0 lg:border-r dark:border-neutral-800"
              >
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Documents
                </p>
                <ul role="list">
                  {documents.map((doc) => {
                    const isSelected = doc.id === selectedId;
                    return (
                      <li key={doc.id} className="mb-1 last:mb-0">
                        <button
                          type="button"
                          onClick={() => setSelectedId(doc.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                            isSelected
                              ? "bg-brand-50 dark:bg-brand-900/30"
                              : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          )}
                        >
                          <span className="flex w-full items-center justify-between gap-2">
                            <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {doc.label}
                            </span>
                            <Badge
                              variant={DOCUMENT_STATUS_VARIANT[doc.status]}
                              size="sm"
                            >
                              {DOCUMENT_STATUS_LABEL[doc.status]}
                            </Badge>
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {doc.type}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {hasContext && (
              <section
                aria-label="Reseller details to compare"
                className="border-b border-neutral-200 p-5 lg:border-b-0 lg:border-r dark:border-neutral-800"
              >
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Compare with
                </p>
                <dl className="space-y-3">
                  {context.fields.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                        {f.label}
                      </dt>
                      <dd
                        className={cn(
                          "mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100",
                          f.mono && "font-mono text-xs"
                        )}
                      >
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 rounded-md bg-info-50 p-2 text-[11px] text-info-800 dark:bg-info-900/20 dark:text-info-200">
                  Confirm the document matches these details before
                  approving.
                </p>
              </section>
            )}

            <section
              aria-label="Document preview"
              className="flex min-h-[16rem] flex-col p-5"
            >
              {selected ? (
                <DocumentPreview document={selected} />
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Select a document to preview.
                </p>
              )}
            </section>
          </div>
        )}

        <div className="flex justify-end border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({ document }: { document: VerificationDocument }) {
  if (document.status === "missing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
        <AtlasIcon
          name="alert"
          aria-hidden="true"
          className="h-6 w-6 text-warning-600"
        />
        <p className="mt-2 text-sm font-medium">Not yet submitted</p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {document.label} has not been uploaded by the reseller.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col items-center text-center">
          <AtlasIcon
            name="file-text"
            aria-hidden="true"
            className="h-10 w-10 text-neutral-400"
          />
          <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {document.label}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {document.type}
          </p>
          <p className="mt-3 max-w-xs text-xs text-neutral-400 dark:text-neutral-500">
            Preview unavailable in mock. Real uploaded files render here
            once the reseller-side upload flow ships.
          </p>
        </div>
      </div>
      {document.uploadedAt && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Uploaded {formatDate(document.uploadedAt)}
        </p>
      )}
    </div>
  );
}