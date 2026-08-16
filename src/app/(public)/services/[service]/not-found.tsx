import Link from "next/link";
import {
  AtlasContainer,
  AtlasSection,
} from "@/components/atlas";

export default function ServiceNotFound() {
  return (
    <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
      <AtlasContainer>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Service not found
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            The service you&apos;re looking for may no longer be available.
          </p>
          <div className="mt-8">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              View Services
            </Link>
          </div>
        </div>
      </AtlasContainer>
    </AtlasSection>
  );
}