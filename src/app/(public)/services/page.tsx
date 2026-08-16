import Link from "next/link";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";
import { ServiceCard } from "@/components/atlas/service-card";
import { atlasServices } from "@/lib/services";

const serviceIcons: Record<string, React.ReactNode> = {
  airtime: <AirtimeIcon />,
  data: <DataIcon />,
  electricity: <ElectricityIcon />,
  tv: <TVIcon />,
  results: <ResultsIcon />,
};

const popularServices = atlasServices.filter((service) => service.popular);

const trustItems = [
  {
    title: "Secure",
    description: "Your account and transactions are protected.",
    icon: <SecureIcon />,
  },
  {
    title: "Reliable",
    description: "Clear transaction states help you know what is happening.",
    icon: <ReliableIcon />,
  },
  {
    title: "Transparent",
    description: "Review your transaction details and status.",
    icon: null,
  },
  {
    title: "Convenient",
    description: "Access multiple everyday services from one platform.",
    icon: <ConvenientIcon />,
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* HERO */}
      <AtlasSection size="md" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              Everything you need, in one place.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Access airtime, data, electricity, TV subscriptions and other
              digital services through Atlas.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                How It Works
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* SERVICE CATEGORIES */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Choose a service
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Select the service you need and complete your purchase in just a
              few simple steps.
            </p>
          </div>

          <AtlasGrid cols={3} gap={6}>
            {atlasServices.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description}
                href={service.href}
                icon={serviceIcons[service.icon]}
                actionLabel={
                  service.id === "tv"
                    ? "Subscribe"
                    : service.id === "results"
                      ? "Check Results"
                      : service.id === "electricity"
                        ? "Buy Electricity"
                        : service.id === "data"
                          ? "Buy Data"
                          : "Buy Airtime"
                }
                status={service.status}
                available={service.available}
              />
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* POPULAR SERVICES */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Popular services
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Quick access to the services customers use most.
            </p>
          </div>

          <AtlasGrid cols={3} gap={6}>
            {popularServices.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description}
                href={service.href}
                icon={serviceIcons[service.icon]}
                actionLabel={`Open ${service.name}`}
                status={service.status}
                available={service.available}
              />
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* HOW IT WORKS */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              How it works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose a service",
                description: "Select the digital service you need.",
              },
              {
                step: "02",
                title: "Enter your details",
                description:
                  "Provide the information required to complete the service.",
              },
              {
                step: "03",
                title: "Confirm and receive",
                description:
                  "Review your transaction, pay securely and receive your service.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* TRUST SECTION */}
      <AtlasSection size="lg" className="bg-brand-900 dark:bg-brand-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Simple services. Clear transactions.
            </h2>
            <p className="mt-4 text-lg text-brand-200 dark:text-brand-300">
              Atlas is designed to make everyday digital services easier to
              access, while keeping your transactions clear and easy to track.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-accent-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-200 dark:text-brand-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FINAL CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Create your Atlas account and access the services you need from
              one platform.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Create Your Account
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Explore How It Works
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>
    </>
  );
}


/* ---------- Icons ---------- */
function AirtimeIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function ElectricityIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TVIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}



function ReliableIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function SecureIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function ConvenientIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}





// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OrdersIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}