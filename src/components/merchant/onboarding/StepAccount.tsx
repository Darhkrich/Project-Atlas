"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";

interface StepAccountProps {
  data: MerchantOnboardingData;
  updateData: (d: Partial<MerchantOnboardingData>) => void;
}

export default function StepAccount({ data, updateData }: StepAccountProps) {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Create your merchant account
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Start your free trial today. No coding required.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="e.g., John Mensah"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="e.g., 024 123 4567"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            placeholder="At least 8 characters"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">Trusted by thousands.</span>{" "}
          Your data is secure and encrypted.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
          <p className="text-2xl font-bold text-brand-600">1K+</p>
          <p className="text-xs text-neutral-500 mt-1">Stores created</p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
          <p className="text-2xl font-bold text-brand-600">99.9%</p>
          <p className="text-xs text-neutral-500 mt-1">Uptime</p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
          <p className="text-2xl font-bold text-brand-600">24/7</p>
          <p className="text-xs text-neutral-500 mt-1">Support</p>
        </div>
      </div>
    </div>
  );
}