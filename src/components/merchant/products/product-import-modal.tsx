/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useStoreProducts } from "@/contexts/store-products-context";
import {
  parseProductsCsv,
  type CsvRowResult,
} from "@/lib/merchant/products/csv";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import { ProductImportPreview } from "./product-import-preview";

interface ProductImportModalProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  categories: MerchantCategory[];
  onImported: (added: number, skipped: number) => void;
}

type Stage = "pick" | "preview" | "importing";

export function ProductImportModal({
  open,
  onClose,
  slug,
  categories,
  onImported,
}: ProductImportModalProps) {
  const { addProducts } = useStoreProducts();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [stage, setStage] = useState<Stage>("pick");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<{
    rows: CsvRowResult[];
    valid: number;
    invalid: number;
  } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStage("pick");
    setFileName("");
    setParsed(null);
    setParseError(null);
  }, [open]);

  async function handleFile(file: File) {
    setParseError(null);
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Only .csv files are accepted.");
      setParsed(null);
      return;
    }
    try {
      const text = await file.text();
      const result = parseProductsCsv(text, categories);
      if (result.rows.length === 0) {
        setParseError("The file has no data rows.");
        setParsed(null);
        return;
      }
      setParsed(result);
      setStage("preview");
    } catch {
      setParseError("Could not read the file.");
      setParsed(null);
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    const products: MerchantStorefrontProduct[] = parsed.rows
      .map((r) => r.product)
      .filter((p): p is MerchantStorefrontProduct => p !== null);
    if (products.length === 0) return;

    setStage("importing");
    const result = addProducts(slug, products);
    const added = result.added;
    const skipped = result.skipped + parsed.invalid;
    onImported(added, skipped);
    onClose();
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Import products"
      description={
        stage === "pick"
          ? "Choose a CSV file exported from Atlas or a spreadsheet."
          : fileName
      }
      size="lg"
    >
      {stage === "pick" && (
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-brand-500"
          >
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Choose a CSV file
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Columns: name, price, and any of sku, categoryId, salePrice,
              stockLevel, status, featured, images, description.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
            className="hidden"
          />

          {parseError && (
            <div
              role="alert"
              className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
            >
              {parseError}
            </div>
          )}
        </div>
      )}

      {stage === "preview" && parsed && (
        <div className="space-y-4">
          <ProductImportPreview
            rows={parsed.rows}
            valid={parsed.valid}
            invalid={parsed.invalid}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStage("pick");
                setParsed(null);
                setFileName("");
              }}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Choose a different file
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={parsed.valid === 0}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {"Import " + parsed.valid + " products"}
            </button>
          </div>
        </div>
      )}
    </AtlasModalShell>
  );
}