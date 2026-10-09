import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import type { MerchantCategory } from "@/lib/merchant/categories/types";

export interface CsvRowResult {
  index: number;
  product: MerchantStorefrontProduct | null;
  errors: string[];
}

export interface ParsedCsvResult {
  rows: CsvRowResult[];
  valid: number;
  invalid: number;
}

const HEADERS = [
  "id",
  "name",
  "sku",
  "categoryid",
  "price",
  "saleprice",
  "stocklevel",
  "status",
  "featured",
  "images",
  "description",
];

function csvEscape(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function productsToCsv(products: MerchantStorefrontProduct[]): string {
  const lines: string[] = [HEADERS.join(",")];
  for (const p of products) {
    const fields = [
      p.id,
      p.name,
      p.sku ?? "",
      p.categoryId,
      String(p.price),
      p.salePrice !== undefined ? String(p.salePrice) : "",
      p.stockLevel !== undefined ? String(p.stockLevel) : "",
      p.status ?? "Active",
      p.featured === true ? "true" : "false",
      Array.isArray(p.images) ? p.images.join("|") : "",
      p.description ?? "",
    ];
    lines.push(fields.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export function downloadProductsCsv(
  products: MerchantStorefrontProduct[],
  filename: string
): void {
  const csv = productsToCsv(products);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      current.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      current.push(field);
      rows.push(current);
      current = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows.filter((row) => row.some((f) => f.length > 0));
}

function normalizeHeader(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, "");
}

function resolveCategory(
  raw: string,
  categories: MerchantCategory[]
): string | null | "unknown" {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const byId = categories.find((c) => c.id === trimmed);
  if (byId) return byId.id;
  const lower = trimmed.toLowerCase();
  const byName = categories.find((c) => c.name.toLowerCase() === lower);
  if (byName) return byName.id;
  return "unknown";
}

export function parseProductsCsv(
  text: string,
  categories: MerchantCategory[]
): ParsedCsvResult {
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return { rows: [], valid: 0, invalid: 0 };
  }

  const headerRow = rows[0].map(normalizeHeader);
  const columnIndex: Record<string, number> = {};
  for (let i = 0; i < headerRow.length; i++) {
    columnIndex[headerRow[i]] = i;
  }

  const results: CsvRowResult[] = [];

  for (let r = 1; r < rows.length; r++) {
    const raw = rows[r];
    const errors: string[] = [];

    const get = (key: string): string => {
      const idx = columnIndex[key];
      if (idx === undefined) return "";
      return (raw[idx] ?? "").trim();
    };

    const name = get("name");
    if (name.length === 0) errors.push("Name is required.");

    const priceRaw = get("price");
    const price = Number.parseFloat(priceRaw);
    if (priceRaw.length === 0) {
      errors.push("Price is required.");
    } else if (!Number.isFinite(price) || price <= 0) {
      errors.push("Price must be a positive number.");
    }

    const saleRaw = get("saleprice");
    let salePrice: number | undefined = undefined;
    if (saleRaw.length > 0) {
      const sale = Number.parseFloat(saleRaw);
      if (!Number.isFinite(sale) || sale < 0) {
        errors.push("Sale price must be zero or more.");
      } else if (Number.isFinite(price) && sale >= price) {
        errors.push("Sale price must be lower than price.");
      } else {
        salePrice = sale;
      }
    }

    const stockRaw = get("stocklevel");
    let stockLevel: number | undefined = undefined;
    if (stockRaw.length > 0) {
      const stock = Number(stockRaw);
      if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.push("Stock level must be a non-negative whole number.");
      } else {
        stockLevel = stock;
      }
    }

    const statusRaw = get("status");
    let status: "Active" | "Draft" | "Archived" = "Active";
    if (statusRaw.length > 0) {
      const normalized =
        statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      if (
        normalized === "Active" ||
        normalized === "Draft" ||
        normalized === "Archived"
      ) {
        status = normalized;
      } else {
        errors.push("Status must be Active, Draft, or Archived.");
      }
    }

    const featuredRaw = get("featured").toLowerCase();
    const featured = featuredRaw === "true";

    const categoryRaw = get("categoryid");
    const categoryResolved = resolveCategory(categoryRaw, categories);
    if (categoryResolved === "unknown") {
      errors.push("Category not found: " + categoryRaw);
    }
    const categoryId = categoryResolved === "unknown" ? "" : categoryResolved ?? "";

    const imagesRaw = get("images");
    const images =
      imagesRaw.length === 0
        ? []
        : imagesRaw
            .split("|")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

    const description = get("description");
    const skuRaw = get("sku");

    if (errors.length > 0) {
      results.push({ index: r + 1, product: null, errors });
      continue;
    }

    const product: MerchantStorefrontProduct = {
      id: crypto.randomUUID(),
      name,
      description,
      price,
      salePrice,
      images,
      categoryId,
      inStock: stockLevel === undefined ? true : stockLevel > 0,
      featured,
      status,
      sku: skuRaw.length > 0 ? skuRaw : undefined,
      stockLevel,
    };

    results.push({ index: r + 1, product, errors: [] });
  }

  const valid = results.filter((r) => r.product !== null).length;
  const invalid = results.length - valid;
  return { rows: results, valid, invalid };
}