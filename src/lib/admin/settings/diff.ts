// lib/admin/settings/diff.ts

export interface RawDiff {
  path: string;
  previous: unknown;
  next: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffObjects(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  pathPrefix = ""
): RawDiff[] {
  const diffs: RawDiff[] = [];
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);

  for (const key of keys) {
    const path = pathPrefix ? `${pathPrefix}.${key}` : key;
    const p = previous[key];
    const n = next[key];

    if (isEqual(p, n)) continue;

    if (isPlainObject(p) && isPlainObject(n)) {
      diffs.push(...diffObjects(p, n, path));
      continue;
    }

    if (Array.isArray(p) && Array.isArray(n)) {
      const pById = indexById(p);
      const nById = indexById(n);

      if (pById && nById) {
        const allIds = new Set([...pById.keys(), ...nById.keys()]);
        for (const id of allIds) {
          const pItem = pById.get(id);
          const nItem = nById.get(id);

          if (!pItem && nItem) {
            diffs.push({
              path: `${path}.${id}.__added__`,
              previous: undefined,
              next: nItem,
            });
            continue;
          }
          if (pItem && !nItem) {
            diffs.push({
              path: `${path}.${id}.__removed__`,
              previous: pItem,
              next: undefined,
            });
            continue;
          }
          if (pItem && nItem && !isEqual(pItem, nItem)) {
            diffs.push(
              ...diffObjects(
                pItem as Record<string, unknown>,
                nItem as Record<string, unknown>,
                `${path}.${id}`
              )
            );
          }
        }
        continue;
      }

      diffs.push({ path, previous: p, next: n });
      continue;
    }

    diffs.push({ path, previous: p, next: n });
  }

  return diffs;
}

function indexById(
  items: unknown[]
): Map<string, Record<string, unknown>> | null {
  const map = new Map<string, Record<string, unknown>>();
  for (const item of items) {
    if (!isPlainObject(item)) return null;
    const id = item.id;
    if (typeof id !== "string") return null;
    map.set(id, item);
  }
  return map;
}