"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { MerchantNotificationKind } from "./types";

const STORAGE_KEY = "atlas-merchant-notification-filters";

export type NotificationFilter = "all" | "unread" | "read" | "snoozed";
export type KindFilter = MerchantNotificationKind | "all";

interface FilterState {
  filter: NotificationFilter;
  kindFilter: KindFilter;
}

const DEFAULT_STATE: FilterState = {
  filter: "all",
  kindFilter: "all",
};

let current: FilterState = DEFAULT_STATE;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Quota exceeded. State stays in memory only.
  }
}

function initialize(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<FilterState>;
    if (
      parsed.filter === "all" ||
      parsed.filter === "unread" ||
      parsed.filter === "read" ||
      parsed.filter === "snoozed"
    ) {
      current = { ...current, filter: parsed.filter };
    }
    if (typeof parsed.kindFilter === "string") {
      current = { ...current, kindFilter: parsed.kindFilter as KindFilter };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function subscribe(listener: () => void): () => void {
  initialize();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FilterState {
  initialize();
  return current;
}

const SERVER_SNAPSHOT: FilterState = DEFAULT_STATE;

function getServerSnapshot(): FilterState {
  return SERVER_SNAPSHOT;
}

export interface UseNotificationFiltersResult {
  filter: NotificationFilter;
  kindFilter: KindFilter;
  setFilter: (next: NotificationFilter) => void;
  setKindFilter: (next: KindFilter) => void;
}

export function useNotificationFilters(): UseNotificationFiltersResult {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setFilter = useCallback((next: NotificationFilter) => {
    current = { ...current, filter: next };
    persist();
    emit();
  }, []);

  const setKindFilter = useCallback((next: KindFilter) => {
    current = { ...current, kindFilter: next };
    persist();
    emit();
  }, []);

  return {
    filter: state.filter,
    kindFilter: state.kindFilter,
    setFilter,
    setKindFilter,
  };
}