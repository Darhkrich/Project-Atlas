/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe current time. Returns null on first render, then updates on
 * an interval. Never uses Date.now() in render, so hydration is safe.
 */
export function useNow(): number | null {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return nowMs;
}