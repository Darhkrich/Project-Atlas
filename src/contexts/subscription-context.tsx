/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { PlanCode } from "@/config/subscription-plans";
import { getPlanByCode } from "@/config/subscription-plans";
import { useAuth } from "@/contexts/auth-context";

interface SubscriptionState {
  currentPlan: PlanCode;
  billingCycle: "monthly" | "annual";
  autoRenew: boolean;
  subscriptionStartDate: number;
  subscriptionEndDate: number;
}

interface SubscriptionContextType extends SubscriptionState {
  setCurrentPlan: (plan: PlanCode) => void;
  setBillingCycle: (cycle: "monthly" | "annual") => void;
  setAutoRenew: (auto: boolean) => void;
  upgradePlan: (newPlan: PlanCode, cycle: "monthly" | "annual") => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

const STORAGE_KEY = "atlas-subscriptions";

function planPriceValue(
  plan: ReturnType<typeof getPlanByCode>,
  cycle: "monthly" | "annual"
): number {
  const raw = cycle === "monthly" ? plan.monthlyPriceGHS : plan.annualPriceGHS;
  return typeof raw === "number" ? raw : 0;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allSubscriptions, setAllSubscriptions] = useState<
    Record<string, SubscriptionState>
  >({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllSubscriptions(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubscriptions));
    }
  }, [allSubscriptions, loaded]);

  const userKey = user?.email || "guest";
  const defaultState: SubscriptionState = {
    currentPlan: "growth",
    billingCycle: "monthly",
    autoRenew: true,
    subscriptionStartDate: new Date("2025-01-01T00:00:00Z").getTime(),
    subscriptionEndDate:
      new Date("2025-01-01T00:00:00Z").getTime() + 30 * 24 * 60 * 60 * 1000,
  };

  const state = allSubscriptions[userKey] || defaultState;

  const persist = (updates: Partial<SubscriptionState>) => {
    setAllSubscriptions((prev) => ({
      ...prev,
      [userKey]: { ...state, ...updates },
    }));
  };

  const setCurrentPlan = (plan: PlanCode) => persist({ currentPlan: plan });
  const setBillingCycle = (cycle: "monthly" | "annual") =>
    persist({ billingCycle: cycle });
  const setAutoRenew = (auto: boolean) => persist({ autoRenew: auto });

  const upgradePlan = (
    newPlan: PlanCode,
    cycle: "monthly" | "annual"
  ): number => {
    const oldPlan = getPlanByCode(state.currentPlan);
    const newPlanDetails = getPlanByCode(newPlan);

    const oldPrice = planPriceValue(oldPlan, cycle);
    const newPrice = planPriceValue(newPlanDetails, cycle);

    const now = Date.now();
    const remainingMs = Math.max(0, state.subscriptionEndDate - now);
    const totalDurationMs =
      state.subscriptionEndDate - state.subscriptionStartDate;
    const remainingFraction =
      totalDurationMs > 0 ? remainingMs / totalDurationMs : 1;
    const priceDifference = Math.max(0, newPrice - oldPrice);
    const proratedAmount = priceDifference * remainingFraction;

    const duration =
      cycle === "monthly"
        ? 30 * 24 * 60 * 60 * 1000
        : 365 * 24 * 60 * 60 * 1000;
    persist({
      currentPlan: newPlan,
      billingCycle: cycle,
      subscriptionStartDate: now,
      subscriptionEndDate: now + duration,
    });

    return proratedAmount;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan: state.currentPlan,
        billingCycle: state.billingCycle,
        autoRenew: state.autoRenew,
        subscriptionStartDate: state.subscriptionStartDate,
        subscriptionEndDate: state.subscriptionEndDate,
        setCurrentPlan,
        setBillingCycle,
        setAutoRenew,
        upgradePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}