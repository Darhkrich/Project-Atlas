/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import {
  MAX_CATEGORIES_PER_STORE,
  CATEGORY_NAME_MAX_LENGTH,
} from "@/lib/merchant/categories/constants";
import {
  CATEGORY_DUPLICATE_NAME,
  CATEGORY_LIMIT_REACHED,
  CATEGORY_NAME_REQUIRED,
  CATEGORY_NAME_TOO_LONG,
  CATEGORY_SYSTEM_DELETE_BLOCKED,
} from "@/lib/merchant/categories/labels";

const STORAGE_KEY = "atlas-merchant-categories";

type StoreCategoriesMap = Record<string, MerchantCategory[]>;
type UserCategoriesMap = Record<string, StoreCategoriesMap>;

export interface CategoryMutationResult {
  ok: boolean;
  error: string | null;
  category?: MerchantCategory;
}

interface CategoriesContextType {
  getCategoriesForStore: (slug: string) => MerchantCategory[];
  createCategory: (slug: string, name: string) => CategoryMutationResult;
  renameCategory: (
    slug: string,
    categoryId: string,
    name: string
  ) => CategoryMutationResult;
  deleteCategory: (
    slug: string,
    categoryId: string
  ) => CategoryMutationResult;
  moveCategory: (
    slug: string,
    categoryId: string,
    direction: "up" | "down"
  ) => void;
  seedCategories: (slug: string, categories: MerchantCategory[]) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

function sanitizeStoredMap(value: unknown): UserCategoriesMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const out: UserCategoriesMap = {};
  for (const [email, stores] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (stores === null || typeof stores !== "object" || Array.isArray(stores)) {
      continue;
    }
    const storeOut: StoreCategoriesMap = {};
    for (const [slug, list] of Object.entries(
      stores as Record<string, unknown>
    )) {
      if (!Array.isArray(list)) continue;
      const cleanList: MerchantCategory[] = [];
      for (const entry of list) {
        if (entry === null || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== "string") continue;
        if (typeof e.name !== "string") continue;
        cleanList.push({
          id: e.id,
          name: e.name,
          order: typeof e.order === "number" ? e.order : cleanList.length,
          system: e.system === true,
          createdAt:
            typeof e.createdAt === "number" ? e.createdAt : Date.now(),
        });
      }
      storeOut[slug] = cleanList.sort((a, b) => a.order - b.order);
    }
    out[email] = storeOut;
  }
  return out;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function nameMatches(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allCategories, setAllCategories] = useState<UserCategoriesMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllCategories(sanitizeStoredMap(JSON.parse(stored)));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allCategories));
    } catch {
      // Quota. State stays in memory.
    }
  }, [allCategories, loaded]);

  const userKey = user?.email ?? "guest";

  const getCategoriesForStore = useCallback(
    (slug: string): MerchantCategory[] => {
      const bucket = allCategories[userKey] ?? {};
      const list = bucket[slug] ?? [];
      return list.slice().sort((a, b) => a.order - b.order);
    },
    [allCategories, userKey]
  );

  const persistForStore = useCallback(
    (slug: string, list: MerchantCategory[]) => {
      setAllCategories((prev) => {
        const userBucket = prev[userKey] ?? {};
        return {
          ...prev,
          [userKey]: { ...userBucket, [slug]: list },
        };
      });
    },
    [userKey]
  );

  const createCategory = useCallback(
    (slug: string, rawName: string): CategoryMutationResult => {
      const name = normalizeName(rawName);
      if (name.length < 1) {
        return { ok: false, error: CATEGORY_NAME_REQUIRED };
      }
      if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        return { ok: false, error: CATEGORY_NAME_TOO_LONG };
      }
      const existing = getCategoriesForStore(slug);
      if (existing.some((c) => nameMatches(c.name, name))) {
        return { ok: false, error: CATEGORY_DUPLICATE_NAME };
      }
      if (existing.length >= MAX_CATEGORIES_PER_STORE) {
        return { ok: false, error: CATEGORY_LIMIT_REACHED };
      }
      const category: MerchantCategory = {
        id: crypto.randomUUID(),
        name,
        order: existing.length,
        system: false,
        createdAt: Date.now(),
      };
      persistForStore(slug, [...existing, category]);
      return { ok: true, error: null, category };
    },
    [getCategoriesForStore, persistForStore]
  );

  const renameCategory = useCallback(
    (
      slug: string,
      categoryId: string,
      rawName: string
    ): CategoryMutationResult => {
      const name = normalizeName(rawName);
      if (name.length < 1) {
        return { ok: false, error: CATEGORY_NAME_REQUIRED };
      }
      if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        return { ok: false, error: CATEGORY_NAME_TOO_LONG };
      }
      const existing = getCategoriesForStore(slug);
      const target = existing.find((c) => c.id === categoryId);
      if (!target) {
        return { ok: false, error: "Category not found." };
      }
      if (existing.some(
        (c) => c.id !== categoryId && nameMatches(c.name, name)
      )) {
        return { ok: false, error: CATEGORY_DUPLICATE_NAME };
      }
      const next = existing.map((c) =>
        c.id === categoryId ? { ...c, name } : c
      );
      persistForStore(slug, next);
      return { ok: true, error: null };
    },
    [getCategoriesForStore, persistForStore]
  );

  const deleteCategory = useCallback(
    (slug: string, categoryId: string): CategoryMutationResult => {
      const existing = getCategoriesForStore(slug);
      const target = existing.find((c) => c.id === categoryId);
      if (!target) {
        return { ok: false, error: "Category not found." };
      }
      if (target.system) {
        return { ok: false, error: CATEGORY_SYSTEM_DELETE_BLOCKED };
      }
      const next = existing
        .filter((c) => c.id !== categoryId)
        .map((c, i) => ({ ...c, order: i }));
      persistForStore(slug, next);
      return { ok: true, error: null };
    },
    [getCategoriesForStore, persistForStore]
  );

  const moveCategory = useCallback(
    (slug: string, categoryId: string, direction: "up" | "down") => {
      const existing = getCategoriesForStore(slug);
      const index = existing.findIndex((c) => c.id === categoryId);
      if (index < 0) return;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= existing.length) return;
      const next = existing.slice();
      const a = next[index];
      next[index] = next[swapWith];
      next[swapWith] = a;
      const reordered = next.map((c, i) => ({ ...c, order: i }));
      persistForStore(slug, reordered);
    },
    [getCategoriesForStore, persistForStore]
  );

  const seedCategories = useCallback(
    (slug: string, categories: MerchantCategory[]) => {
      const existing = getCategoriesForStore(slug);
      if (existing.length > 0) return;
      persistForStore(slug, categories);
    },
    [getCategoriesForStore, persistForStore]
  );

  const value = useMemo<CategoriesContextType>(
    () => ({
      getCategoriesForStore,
      createCategory,
      renameCategory,
      deleteCategory,
      moveCategory,
      seedCategories,
    }),
    [
      getCategoriesForStore,
      createCategory,
      renameCategory,
      deleteCategory,
      moveCategory,
      seedCategories,
    ]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
}