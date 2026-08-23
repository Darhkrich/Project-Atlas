import Link from "next/link";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const problems: {
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    title: "Different platforms",
    description: "Different services often require different platforms.",
    icon: "grid",
  },
  {
    title: "Repeated steps",
    description: "Customers may have to repeat similar information across services.",
    icon: "repeat",
  },
  {
    title: "Unclear status",
    description: "Transaction status may not always be clear.",
    icon: "help-circle",
  },
  {
    title: "Disconnected experience",
    description: "Payment and fulfillment can feel disconnected.",
    icon: "disconnect",
  },
  {
    title: "Unnecessary effort",
    description: "Finding the right service can take unnecessary effort.",
    icon: "search",
  },
];

const principles: {
  step: string;
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    step: "01",
    title: "Simplicity",
    description: "Customers should be able to understand what to do without unnecessary complexity.",
    icon: "check",
  },
  {
    step: "02",
    title: "Transparency",
    description: "Transactions should be clear, understandable and easy to track.",
    icon: "eye",
  },
  {
    step: "03",
    title: "Reliability",
    description: "The platform should be designed around dependable service delivery and clear transaction states.",
    icon: "shield",
  },
  {
    step: "04",
    title: "Security",
    description: "Customer accounts, information and transactions should be handled responsibly.",
    icon: "lock",
  },
  {
    step: "05",
    title: "Accessibility",
    description: "Essential digital services should be easier for people to discover and use.",
    icon: "accessibility",
  },
];

const trustItems: {
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    title: "Clear pricing",
    description: "Customers should understand what they are paying.",
    icon: "price",
  },
  {
    title: "Clear status",
    description: "Customers should know what is happening with their transaction.",
    icon: "status",
  },
  {
    title: "Account protection",
    description: "Customer accounts and information should be handled responsibly.",
    icon: "protect",
  },
  {
    title: "Transaction records",
    description: "Customers should be able to review their activity.",
    icon: "record",
  },
  {
    title: "Support",
    description: "Customers should have a clear path when they need help.",
    icon: "headphones",
  },
];

const services: {
  name: string;
  icon: AtlasIconName;
}[] = [
  { name: "Airtime", icon: "phone" },
  { name: "Data", icon: "globe" },
  { name: "Electricity", icon: "zap" },
  { name: "TV Subscriptions", icon: "tv" },
  { name: "Results Checker", icon: "graduation" },
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
                <AtlasIcon
                  name={service.icon}
                  className="h-6 w-6 text-brand-800 dark:text-brand-300"
                />
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
                  <AtlasIcon name={problem.icon} className="h-6 w-6" />
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
                  <li key={step} className="flex items-center gap-4">
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
                    <AtlasIcon name={principle.icon} className="h-6 w-6" />
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
                      <AtlasIcon
                        name={service.icon}
                        className="h-6 w-6 text-brand-800 dark:text-brand-300"
                      />
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
                    <li key={step} className="flex items-center gap-4">
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
                  <AtlasIcon name={item.icon} className="h-6 w-6" />
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