/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { isReservedSlug } from "./reserved-slugs";
import { deriveSlug } from "@/lib/merchant/onboarding/slug";

const STORAGE_KEY = "atlas-taken-slugs";
const DEBOUNCE_MS = 400;

export type SlugAvailability =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken"; suggestion: string }
  | { state: "reserved" }
  | { state: "invalid" };

function loadTaken(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return new Set(["glow-beauty", "techhub", "shopatlas"]);
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch {
    // fall through
  }
  return new Set(["glow-beauty", "techhub", "shopatlas"]);
}

function suggestAlternative(base: string, taken: Set<string>): string {
  for (let i = 0; i < 20; i += 1) {
    const candidate = base + "-" + (i + 1);
    if (!taken.has(candidate)) return candidate;
  }
  return base + "-" + Math.floor(Math.random() * 9999);
}

export function useSlugAvailability(slug: string): SlugAvailability {
  const [state, setState] = useState<SlugAvailability>({ state: "idle" });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) {
      setState({ state: "idle" });
      return;
    }
    const normalised = deriveSlug(trimmed);
    if (!normalised) {
      setState({ state: "invalid" });
      return;
    }
    setState({ state: "checking" });
    timerRef.current = window.setTimeout(() => {
      if (isReservedSlug(normalised)) {
        setState({ state: "reserved" });
        return;
      }
      const taken = loadTaken();
      if (taken.has(normalised)) {
        setState({
          state: "taken",
          suggestion: suggestAlternative(normalised, taken),
        });
      } else {
        setState({ state: "available" });
      }
      timerRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [slug]);

  return state;
}