import type { Plan } from "@/lib/services-page-data";
import { slugify } from "@/lib/admin/services/helpers";
import {
  HISTORY_CAP,
  IMPORT_MAX_ROWS,
  marginBand,
  type MarginBand,
} from "./constants";

export { slugify };

/**
 * Plan IDs are scoped to a network via slug prefix. Two categories inside
 * the same network can still produce the same ID if they contain plans with
 * the same name. Enforce uniqueness at the call site (see PlanEditModal
 * existingPlanIds) by passing the full network plan ID set, not the
 * category set.
 */
export function dataPlanIdFor(name: string, networkName: string): string {
  const base = slugify(name) || "plan";
  const prefix = slugify(networkName);
  return `${prefix}-${base}`;
}

export interface PlanMargin {
  absolute: number;
  percent: number;
}

export function computeMargin(plan: Plan): PlanMargin | null {
  if (plan.providerCost === undefined) return null;
  if (plan.price <= 0) return null;
  const absolute = plan.price - plan.providerCost;
  return {
    absolute,
    percent: (absolute / plan.price) * 100,
  };
}

export function marginBandFor(plan: Plan): MarginBand | null {
  const m = computeMargin(plan);
  if (!m) return null;
  return marginBand(m.percent);
}

/* ------------------------------ Filtering ------------------------------ */

export type PlanFilter = "all" | "low-margin" | "inactive";

export function planMatchesSearch(plan: Plan, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    plan.name.toLowerCase().includes(query) ||
    (plan.description?.toLowerCase().includes(query) ?? false)
  );
}

export function planMatchesFilter(plan: Plan, filter: PlanFilter): boolean {
  if (filter === "all") return true;
  if (filter === "inactive") return plan.active === false;
  const band = marginBandFor(plan);
  return band === "tight" || band === "critical";
}

export function filterPlans(
  plans: Plan[],
  q: string,
  filter: PlanFilter
): Plan[] {
  return plans.filter(
    (p) => planMatchesSearch(p, q) && planMatchesFilter(p, filter)
  );
}

/* ------------------------------ Import ------------------------------ */

export interface ImportRow {
  lineNumber: number;
  name: string;
  description: string;
  price: number;
  validity: string;
  typeTag: string;
}

export interface ImportIssue {
  lineNumber: number;
  message: string;
}

export interface ImportValidationResult {
  rows: ImportRow[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
}

const EXPECTED_COLUMNS = 5;
const HEADER_SIGNATURE = ["name", "description", "price"];

export function validateImportCsv(
  raw: string,
  existingPlanNames: string[]
): ImportValidationResult {
  const rows: ImportRow[] = [];
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  if (!raw.trim()) return { rows, errors, warnings };

  const lines = raw.split(/\r?\n/);
  const seen = new Set(existingPlanNames.map((n) => n.trim().toLowerCase()));

  let headerChecked = false;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const lineNumber = i + 1;

    if (!headerChecked) {
      headerChecked = true;
      const probe = rawLine.split(",").map((p) => p.trim().toLowerCase());
      if (
        probe[0] === HEADER_SIGNATURE[0] &&
        probe[1] === HEADER_SIGNATURE[1] &&
        probe[2] === HEADER_SIGNATURE[2]
      ) {
        continue;
      }
    }

    const parts = rawLine.split(",");
    if (parts.length !== EXPECTED_COLUMNS) {
      errors.push({
        lineNumber,
        message: `Expected ${EXPECTED_COLUMNS} columns, got ${parts.length}.`,
      });
      continue;
    }

    const [nameRaw, descriptionRaw, priceRaw, validityRaw, typeTagRaw] =
      parts.map((p) => p.trim());

    if (!nameRaw) {
      errors.push({ lineNumber, message: "Name is required." });
      continue;
    }

    const key = nameRaw.toLowerCase();
    if (seen.has(key)) {
      errors.push({
        lineNumber,
        message: `"${nameRaw}" already exists on this network or is duplicated in this file.`,
      });
      continue;
    }

    const price = Number(priceRaw);
    if (!priceRaw || !Number.isFinite(price) || price < 0) {
      errors.push({
        lineNumber,
        message: `Price must be a non-negative number. Got "${priceRaw}".`,
      });
      continue;
    }

    if (!descriptionRaw) {
      warnings.push({ lineNumber, message: "Description is empty." });
    }
    if (!validityRaw) {
      warnings.push({ lineNumber, message: "Validity is empty." });
    }

    seen.add(key);
    rows.push({
      lineNumber,
      name: nameRaw,
      description: descriptionRaw,
      price,
      validity: validityRaw,
      typeTag: typeTagRaw,
    });
  }

  if (rows.length > IMPORT_MAX_ROWS) {
    errors.push({
      lineNumber: 0,
      message: `${rows.length} rows exceeds the ${IMPORT_MAX_ROWS}-row limit.`,
    });
  }

  return { rows, errors, warnings };
}