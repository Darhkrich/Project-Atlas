export type RetryOutcome =
  | "success_at_attempt_2"
  | "success_at_attempt_3"
  | "exhaust";

export interface RetryScenario {
  outcome: RetryOutcome;
  providerLatencyMs: number;
}

const scenarios = new Map<string, RetryScenario>();

export function registerRetryScenario(
  orderId: string,
  scenario: RetryScenario
): void {
  scenarios.set(orderId, scenario);
}

export function getRetryScenario(orderId: string): RetryScenario {
  return (
    scenarios.get(orderId) ?? {
      outcome: "success_at_attempt_2",
      providerLatencyMs: 1500,
    }
  );
}

export function clearRetryScenarios(): void {
  scenarios.clear();
}

export function isSuccessAttempt(
  scenario: RetryScenario,
  attempt: number
): boolean {
  if (scenario.outcome === "success_at_attempt_2") return attempt >= 2;
  if (scenario.outcome === "success_at_attempt_3") return attempt >= 3;
  return false;
}