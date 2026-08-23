/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { AtlasIcon } from "@/components/atlas/icons";

export default function NotFound() {
  return (
    <>
      <AtlasNavbar />

      <section className="relative overflow-hidden bg-white py-20 dark:bg-neutral-950">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="50" cy="30" r="1" fill="currentColor" />
            <circle cx="90" cy="50" r="1" fill="currentColor" />
            <circle cx="20" cy="80" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>

        <AtlasContainer className="relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              <AtlasIcon name="search" className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
              Page not found
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white hover:bg-brand-900"
              >
                Back to Home
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </section>

      <AtlasFooter />
    </>
  );
}