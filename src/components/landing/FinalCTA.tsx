import { AtlasContainer } from "@/components/atlas/atlas-container";

export function FinalCTA() {
  return (
    <section className="py-16 md:py-20 dark:bg-neutral-950">
      <AtlasContainer>
        <div className="rounded-xl border border-neutral-200 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-neutral-100">
                Ready to experience<br />a better way?
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                Join thousands of people and businesses already growing with Atlas.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-[#003D2E] px-6 py-3 text-sm font-medium text-white hover:bg-[#004B3B] dark:bg-brand-800 dark:hover:bg-brand-700">
                  Create Free Account
                </a>
                <a href="/contact" className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
                  Contact Sales
                </a>
              </div>
            </div>

            {/* Phone illustration */}
            <div className="relative mx-auto w-full max-w-[320px]">
              <div className="relative mx-auto h-[380px] w-[180px] rounded-[36px] bg-neutral-900 p-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-[31px] bg-white dark:bg-neutral-100">
                  <svg className="h-16 w-16 text-[#003D2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3L21 20H3L12 3Z" strokeLinejoin="round" />
                    <path d="M8 16H16" strokeLinecap="round" />
                  </svg>
                  <span className="mt-2 text-lg font-semibold text-[#003D2E]">ATLAS</span>
                </div>
              </div>

              {/* Floating icons */}
              <div className="absolute -left-4 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-neutral-800">
                <span className="text-lg">📱</span>
              </div>
              <div className="absolute -right-6 top-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-neutral-800">
                <span className="text-lg">🌐</span>
              </div>
              <div className="absolute -left-6 bottom-16 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-neutral-800">
                <span className="text-lg">⚡</span>
              </div>
              <div className="absolute -right-4 bottom-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-neutral-800">
                <span className="text-lg">🎓</span>
              </div>
            </div>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}