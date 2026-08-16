import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection, AtlasGrid } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";

const values = [
  {
    title: "Trust",
    description:
      "We build products that customers, resellers, and businesses can depend on.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Simplicity",
    description:
      "We remove complexity so people can focus on the services they need.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    title: "Reliability",
    description:
      "Our platform is designed for everyday use, with clear transaction states.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description:
      "Essential digital services should be easier for everyone to discover and use.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "Customer Platform",
    description:
      "A simple, secure way for customers to buy airtime, data, electricity, and more.",
    icon: "👤",
  },
  {
    title: "Reseller Infrastructure",
    description:
      "Tools for entrepreneurs to start their own digital services business.",
    icon: "🏪",
  },
  {
    title: "White-Label Stores",
    description:
      "No-code e-commerce websites for businesses and individuals.",
    icon: "🛍️",
  },
  {
    title: "Developer API",
    description:
      "Powerful APIs that let developers integrate Atlas services.",
    icon: "💻",
  },
];

export default function CompanyPage() {
  return (
    <>
      <AtlasNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 py-20 md:py-24 lg:py-28 dark:from-neutral-950 dark:to-neutral-900">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="50" cy="30" r="1" fill="currentColor" />
            <circle cx="90" cy="50" r="1" fill="currentColor" />
            <circle cx="20" cy="80" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>
        <AtlasContainer className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              About Atlas
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              We&apos;re building the future of{" "}
              <span className="text-brand-800 dark:text-brand-300">
                digital services.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Atlas is a unified platform that simplifies how people access,
              purchase, and manage everyday digital services — and how
              businesses and developers build on top of them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-900"
              >
                Explore Services
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Join Atlas
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </section>

      {/* WHO WE ARE / MISSION */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                One platform. Many possibilities.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Atlas is designed to be more than just a place to buy airtime or
                data. It&apos;s a digital services ecosystem that supports
                customers, resellers, businesses, and developers.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Our goal is simple: make everyday services easier, clearer, and
                more accessible for everyone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <span className="text-3xl">{pillar.icon}</span>
                  <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* MISSION STATEMENT */}
      <AtlasSection size="lg" className="bg-brand-950 dark:bg-brand-950">
        <AtlasContainer>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Our mission is to make digital services simple, trusted, and
              accessible to all.
            </h2>
            <p className="mt-6 text-lg text-brand-200">
              We believe that essential services shouldn&apos;t be complicated.
              That&apos;s why we&apos;re building a platform where everything
              works together seamlessly.
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CORE VALUES */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What guides us
            </h2>
          </div>
          <AtlasGrid cols={4} gap={6}>
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {value.description}
                </p>
              </div>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* WHAT WE'RE BUILDING */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What we&apos;re building
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas is designed to grow with you and the ecosystem around it.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <span className="text-3xl">{pillar.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* JOIN US CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Join us on the journey.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Whether you&apos;re here to buy services, start a business, or
              build with our API — Atlas is for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white hover:bg-brand-900"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />
    </>
  );
}