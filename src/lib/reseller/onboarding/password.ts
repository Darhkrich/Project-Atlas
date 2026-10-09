export interface PasswordRule {
  id: string;
  label: string;
  satisfied: boolean;
}

export type PasswordStrength = "weak" | "fair" | "strong";

export interface PasswordEvaluation {
  strength: PasswordStrength;
  rules: PasswordRule[];
  isValid: boolean;
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: "At least 8 characters",
      satisfied: password.length >= 8,
    },
    {
      id: "letter",
      label: "Contains a letter",
      satisfied: /[A-Za-z]/.test(password),
    },
    {
      id: "number",
      label: "Contains a number",
      satisfied: /[0-9]/.test(password),
    },
  ];
  const satisfied = rules.filter((r) => r.satisfied).length;
  const strength: PasswordStrength =
    satisfied <= 1 ? "weak" : satisfied === 2 ? "fair" : "strong";
  return { strength, rules, isValid: satisfied === rules.length };
}