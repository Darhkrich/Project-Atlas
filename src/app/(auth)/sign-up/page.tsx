"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasAlert } from "@/components/atlas/alert";
import { cn } from "@/lib/utils";

const accountTypes = [
  {
    id: "customer",
    title: "Customer",
    description: "Buy airtime, data, electricity and more.",
    icon: "👤",
  },
  {
    id: "reseller",
    title: "Reseller",
    description: "Sell digital services and earn commissions.",
    icon: "🏪",
  },
  {
    id: "store-owner",
    title: "Store Owner",
    description: "Launch a white-label e-commerce store.",
    icon: "🛍️",
  },
];

export default function SignUpPage() {
  const [accountType, setAccountType] = useState("customer");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid phone number.";
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!form.agreed) {
      newErrors.agreed = "You must agree to the Terms and Privacy Policy.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setSubmitError("");

    // Placeholder for API call
    setTimeout(() => {
      setLoading(false);
      setSubmitError("Registration is not implemented yet.");
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Create your Atlas account
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          One account for all Atlas services
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {submitError && (
          <div className="mb-4">
            <AtlasAlert variant="danger">{submitError}</AtlasAlert>
          </div>
        )}

        {/* Account type selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Choose account type
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {accountTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAccountType(type.id)}
                className={cn(
                  "flex flex-col items-start rounded-lg border p-4 text-left transition-colors",
                  accountType === type.id
                    ? "border-brand-800 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                )}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {type.title}
                </span>
                <span className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {type.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AtlasInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <AtlasInput
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <AtlasInput
            label="Phone Number"
            type="tel"
            placeholder="024 XXX XXXX"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            autoComplete="tel"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <AtlasInput
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <AtlasInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => handleChange("agreed", String(e.target.checked))}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-800 focus:ring-brand-500"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-brand-800 hover:underline dark:text-brand-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand-800 hover:underline dark:text-brand-300">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreed && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.agreed}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-800 hover:underline dark:text-brand-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}