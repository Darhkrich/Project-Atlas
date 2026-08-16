import Link from "next/link";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";

const problems = [
  {
    title: "Different platforms",
    description: "Different services often require different platforms.",
    icon: <GridIcon />,
  },
  {
    title: "Repeated steps",
    description: "Customers may have to repeat similar information across services.",
    icon: <RepeatIcon />,
  },
  {
    title: "Unclear status",
    description: "Transaction status may not always be clear.",
    icon: <QuestionIcon />,
  },
  {
    title: "Disconnected experience",
    description: "Payment and fulfillment can feel disconnected.",
    icon: <DisconnectIcon />,
  },
  {
    title: "Unnecessary effort",
    description: "Finding the right service can take unnecessary effort.",
    icon: <SearchIcon />,
  },
];

const principles = [
  {
    step: "01",
    title: "Simplicity",
    description: "Customers should be able to understand what to do without unnecessary complexity.",
    icon: <SimpleIcon />,
  },
  {
    step: "02",
    title: "Transparency",
    description: "Transactions should be clear, understandable and easy to track.",
    icon: <EyeIcon />,
  },
  {
    step: "03",
    title: "Reliability",
    description: "The platform should be designed around dependable service delivery and clear transaction states.",
    icon: <ShieldIcon />,
  },
  {
    step: "04",
    title: "Security",
    description: "Customer accounts, information and transactions should be handled responsibly.",
    icon: <LockIcon />,
  },
  {
    step: "05",
    title: "Accessibility",
    description: "Essential digital services should be easier for people to discover and use.",
    icon: <AccessIcon />,
  },
];

const trustItems = [
  {
    title: "Clear pricing",
    description: "Customers should understand what they are paying.",
    icon: <PriceIcon />,
  },
  {
    title: "Clear status",
    description: "Customers should know what is happening with their transaction.",
    icon: <StatusIcon />,
  },
  {
    title: "Account protection",
    description: "Customer accounts and information should be handled responsibly.",
    icon: <ProtectIcon />,
  },
  {
    title: "Transaction records",
    description: "Customers should be able to review their activity.",
    icon: <RecordIcon />,
  },
  {
    title: "Support",
    description: "Customers should have a clear path when they need help.",
    icon: <SupportIcon />,
  },
];

const services = [
  { name: "Airtime", icon: <AirtimeIcon /> },
  { name: "Data", icon: <DataIcon /> },
  { name: "Electricity", icon: <ElectricityIcon /> },
  { name: "TV Subscriptions", icon: <TVIcon /> },
  { name: "Results Checker", icon: <ResultsIcon /> },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <AtlasSection size="md" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
              Making everyday digital services simpler.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Atlas is being built to bring essential digital services together
              in one clear, reliable and easy-to-use platform.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Explore Services
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

      {/* WHAT IS ATLAS */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What is Atlas?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Atlas is a digital services platform designed to make everyday
              services easier to access, purchase and manage from one place.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Instead of navigating different websites, apps or payment
              experiences, customers can use Atlas for services such as
              airtime, data, electricity, TV subscriptions, results checking
              and more — as the platform grows.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <span className="text-brand-800 dark:text-brand-300">
                  {service.icon}
                </span>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* THE PROBLEM */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Everyday services shouldn&apos;t feel complicated.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas is designed around simplifying the experience of accessing
              digital services.
            </p>
          </div>

          <AtlasGrid cols={3} gap={6}>
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {problem.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {problem.description}
                </p>
              </div>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* ATLAS APPROACH */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                We&apos;re building around the customer.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Instead of making customers understand complicated systems,
                Atlas handles the complexity behind the scenes.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                The customer experience remains simple: find what you need,
                provide the required information, review, pay, receive and
                track.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Customer experience
              </div>
              <ul className="space-y-4">
                {[
                  "Find what you need",
                  "Provide the required information",
                  "Review",
                  "Pay",
                  "Receive",
                  "Track",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CORE PRINCIPLES */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What guides Atlas
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.step}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                    {principle.icon}
                  </div>
                  <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    {principle.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* THE BIGGER VISION */}
      <AtlasSection size="lg" className="bg-brand-900 dark:bg-brand-950">
        <AtlasContainer>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Building beyond individual services.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-200 dark:text-brand-300">
              Atlas is designed to grow beyond its initial collection of
              services. As Atlas grows, the platform can support more everyday
              digital services through one consistent customer experience.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-brand-200 dark:text-brand-300">
              Over time, customers should not need to learn a new system for
              every new service they use.
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CUSTOMER-CENTERED EXPERIENCE */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              One experience across many services.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Different services, same clear Atlas experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Services
              </div>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-md bg-neutral-50 p-4 dark:bg-neutral-800"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      <span className="text-brand-800 dark:text-brand-300">
                        {service.icon}
                      </span>
                      {service.name}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Consistent experience
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Same flow
              </div>
              <ul className="space-y-3">
                {["Select", "Enter details", "Review", "Pay", "Track"].map(
                  (step, index) => (
                    <li
                      key={step}
                      className="flex items-center gap-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {step}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* TRUST SECTION */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Trust is part of the product.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Trust should be reflected through the actual product experience —
              not treated as a marketing statement.
            </p>
          </div>

          <AtlasGrid cols={3} gap={6}>
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* FINAL CTA */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Experience Atlas for yourself.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Explore the services available today and see how Atlas is making
              everyday digital services simpler.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Explore Services
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Create Your Account
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
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function ElectricityIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function TVIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DisconnectIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function SimpleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function AccessIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProtectIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function RecordIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
    </svg>
  );
}