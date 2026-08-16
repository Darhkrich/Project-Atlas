"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasAlert } from "@/components/atlas/alert";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = "Email or phone number is required.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setSubmitError("");

    // Placeholder for API call
    setTimeout(() => {
      setLoading(false);
      setSubmitError("Authentication is not implemented yet.");
    }, 1000);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Log in to your Atlas account
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {submitError && (
          <div className="mb-4">
            <AtlasAlert variant="danger">{submitError}</AtlasAlert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AtlasInput
            label="Email or Phone Number"
            type="text"
            placeholder="name@example.com or 024 XXX XXXX"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <AtlasInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-brand-800 focus:ring-brand-500"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-medium text-brand-800 hover:underline dark:text-brand-300"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-brand-800 hover:underline dark:text-brand-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}