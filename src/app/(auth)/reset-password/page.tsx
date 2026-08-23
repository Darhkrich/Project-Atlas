/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasAlert } from "@/components/atlas/alert";
import { PasswordStrength } from "@/components/atlas/password-strength";
import { useAuth } from "@/components/auth/AuthProvider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string | undefined> = {};

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

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Mock reset success
      setTimeout(() => router.replace("/login"), 1500);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter a new password for your Atlas account.
        </p>
      </div>

      {success ? (
        <AtlasAlert variant="success">
          Password reset successful. Redirecting to login...
        </AtlasAlert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <AtlasInput
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
          </div>

          <AtlasInput
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Reset Password
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-800 hover:underline dark:text-brand-300"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}