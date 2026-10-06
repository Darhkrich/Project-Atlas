/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

const REVERT_WINDOW_MS = 30 * 1000;

export interface TemplateSwitchBuffer {
  previousTemplateId: string;
  previousTemplateCategory: MerchantTemplateCategory;
  expiresAt: number;
}

export interface UseTemplateSwitchResult {
  buffer: TemplateSwitchBuffer | null;
  secondsLeft: number;
  canRevert: boolean;
  recordSwitch: (
    previousTemplateId: string,
    previousTemplateCategory: MerchantTemplateCategory
  ) => void;
  consume: () => void;
}

export function useTemplateSwitch(): UseTemplateSwitchResult {
  const [buffer, setBuffer] = useState<TemplateSwitchBuffer | null>(null);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!buffer) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [buffer]);

  useEffect(() => {
    if (!buffer) return;
    if (Date.now() >= buffer.expiresAt) {
      setBuffer(null);
    }
  }, [buffer, tick]);

  const recordSwitch = useCallback(
    (
      previousTemplateId: string,
      previousTemplateCategory: MerchantTemplateCategory
    ) => {
      setBuffer({
        previousTemplateId,
        previousTemplateCategory,
        expiresAt: Date.now() + REVERT_WINDOW_MS,
      });
    },
    []
  );

  const consume = useCallback(() => {
    setBuffer(null);
  }, []);

  const secondsLeft = buffer
    ? Math.max(0, Math.ceil((buffer.expiresAt - Date.now()) / 1000))
    : 0;

  return {
    buffer,
    secondsLeft,
    canRevert: buffer !== null && secondsLeft > 0,
    recordSwitch,
    consume,
  };
}