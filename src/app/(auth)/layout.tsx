/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { AtlasIcon } from "@/components/atlas/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="relative hidden bg-gradient-to-br from-brand-900 to-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="20" cy="20" r="1" fill="white" />
            <circle cx="80" cy="30" r="1" fill="white" />
            <circle cx="40" cy="70" r="1" fill="white" />
            <circle cx="90" cy="80" r="1" fill="white" />
          </svg>
        </div>

        <div className="relative z-10">
          <AtlasLogo />
          <h1 className="mt-12 max-w-md text-4xl font-bold leading-tight">
            Your everyday digital services, made simple.
          </h1>
          <p className="mt-4 max-w-md text-lg text-brand-100">
            Buy airtime, data, electricity, and more — all in one secure
            platform.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Fast transactions",
              "Secure wallet",
              "Track orders easily",
              "24/7 support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <AtlasIcon name="check" className="h-4 w-4 text-accent-500" />
                </span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-12 text-sm text-brand-200">
          © {new Date().getFullYear()} Atlas. All rights reserved.
        </p>
      </div>

      {/* Right form panel with image background */}
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-white px-6 py-8 dark:bg-neutral-950">
        {/* Background image with fade overlay */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src="/mtn2.jpg"
            alt=""
            className="h-full w-full object-cover opacity-50 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white dark:from-neutral-950 dark:via-neutral-950/90 dark:to-neutral-950" />
        </div>

        {/* Mobile logo */}
        <div className="relative z-10 mb-8 lg:hidden">
          <AtlasLogo />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="relative z-10 mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400 lg:hidden">
          © {new Date().getFullYear()} Atlas
        </p>
      </div>
    </div>
  );
}