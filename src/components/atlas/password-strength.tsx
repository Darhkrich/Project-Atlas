"use client";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (value: string) => {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score, 3);
  };

  const strength = getStrength(password);

  const labels = ["", "Weak", "Fair", "Strong"];
  const colors = ["", "bg-danger-500", "bg-warning-500", "bg-success-500"];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full ${
              level <= strength ? colors[strength] : "bg-neutral-200 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Password strength:{" "}
        <span className="font-medium">{labels[strength] || "Too short"}</span>
      </p>
    </div>
  );
}