/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { AtlasContainer, AtlasSection, AtlasGrid, AtlasCard } from "@/components/atlas";

const values = [
  {
    title: "Trust",
    description: "We build products people can depend on.",
    icon: "🤝",
  },
  {
    title: "Simplicity",
    description: "We remove complexity so customers can focus on what matters.",
    icon: "✨",
  },
  {
    title: "Reliability",
    description: "Our platform is designed for everyday use.",
    icon: "🛡️",
  },
  {
    title: "Innovation",
    description: "We continuously improve to meet evolving needs.",
    icon: "💡",
  },
];

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              The company behind Atlas.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas is on a mission to make everyday digital services simpler and
              more accessible for everyone.
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Mission */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What we're building
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas is a digital services platform designed to unify the way
              people buy airtime, data, electricity, and more. We also provide
              infrastructure for resellers, businesses, and developers.
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Values */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Our values
            </h2>
          </div>
          <AtlasGrid cols={4} gap={6}>
            {values.map((value) => (
              <AtlasCard key={value.title} padding="md" className="text-center">
                <div className="mb-4 text-4xl">{value.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {value.description}
                </p>
              </AtlasCard>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* Trust / Policy */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Built on trust
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Privacy Policy", "Terms of Service", "Support"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                  className="rounded-lg border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Final CTA */}
      <AtlasSection size="lg" className="bg-brand-900 dark:bg-brand-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Join us on the journey.
            </h2>
            <p className="mt-4 text-lg text-brand-200">
              Create your Atlas account and start exploring.
            </p>
            <div className="mt-8">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-base font-medium text-brand-900 transition-colors hover:bg-brand-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>
    </>
  );
}