"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StorefrontSaveState } from "./types";

export interface UseAutosaveOptions<T> {
  value: T;
  delay?: number;
  onSave: (value: T) => void;
}

export interface UseAutosaveResult {
  state: StorefrontSaveState;
  lastSavedAt: number | null;
  errorMessage: string | null;
  trigger: () => void;
}

const SUCCESS_VISIBLE_MS = 2000;

export function useAutosave<T>({
  value,
  delay = 500,
  onSave,
}: UseAutosaveOptions<T>): UseAutosaveResult {
  const [state, setState] = useState<StorefrontSaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firstRunRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const latestValueRef = useRef(value);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const commit = useCallback(() => {
    try {
      setState("saving");
      onSaveRef.current(latestValueRef.current);
      setLastSavedAt(Date.now());
      setErrorMessage(null);
      setState("saved");
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setState("idle");
        successTimerRef.current = null;
      }, SUCCESS_VISIBLE_MS);
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not save. Try again."
      );
    }
  }, []);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      commit();
      timerRef.current = null;
    }, delay);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, commit]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    lastSavedAt,
    errorMessage,
    trigger: commit,
  };
}