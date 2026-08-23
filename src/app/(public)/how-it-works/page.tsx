import Link from "next/link";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const journeySteps = [
  {
    step: "01",
    title: "Choose a service",
    description: "Select the service you need from the Atlas services available to you.",
    examples: ["Buy Airtime", "Buy Data", "Buy Electricity", "Subscribe to TV"],
  },
  {
    step: "02",
    title: "Enter your details",
    description: "Provide the information required for the selected service.",
    examples: ["Mobile number", "Network", "Data bundle", "Meter number", "Smart card number"],
  },
  {
    step: "03",
    title: "Review and pay",
    description: "Review your transaction details before confirming your purchase.",
    examples: ["Service", "Recipient", "Amount", "Fees", "Total amount"],
  },
  {
    step: "04",
    title: "Receive and track",
    description: "Atlas processes your transaction and keeps you informed about its status.",
    examples: ["Processing", "Successful", "Pending", "Failed", "Cancelled"],
  },
];

const transactionStatuses: {
  title: string;
  description: string;
  icon: AtlasIconName;
  textClass: string;
  bgClass: string;
}[] = [
  {
    title: "Successful",
    description: "The transaction has been completed successfully.",
    icon: "check",
    textClass: "text-success-600 dark:text-success-400",
    bgClass: "bg-success-100 dark:bg-success-900/40",
  },
  {
    title: "Processing",
    description: "Atlas is currently processing the transaction.",
    icon: "clock",
    textClass: "text-info-600 dark:text-info-400",
    bgClass: "bg-info-100 dark:bg-info-900/40",
  },
  {
    title: "Pending",
    description: "The transaction has not completed yet and requires further processing.",
    icon: "help-circle",
    textClass: "text-warning-600 dark:text-warning-400",
    bgClass: "bg-warning-100 dark:bg-warning-900/40",
  },
  {
    title: "Failed",
    description: "The transaction could not be completed.",
    icon: "x-circle",
    textClass: "text-danger-600 dark:text-danger-400",
    bgClass: "bg-danger-100 dark:bg-danger-900/40",
  },
  {
    title: "Cancelled",
    description: "The transaction was cancelled and will not continue.",
    icon: "disconnect",
    textClass: "text-neutral-600 dark:text-neutral-400",
    bgClass: "bg-neutral-100 dark:bg-neutral-800",
  },
];

const accountFeatures: {
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    title: "Transaction history",
    description: "See every transaction and its current status.",
    icon: "record",
  },
  {
    title: "Order details",
    description: "Access the details behind each service order.",
    icon: "receipt",
  },
  {
    title: "Payment records",
    description: "Review payments and amounts clearly.",
    icon: "wallet",
  },
  {
    title: "Service status",
    description: "Know whether a service has been fulfilled.",
    icon: "status",
  },
];

const trustItems: {
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    title: "Secure account access",
    description: "Customer information should be protected.",
    icon: "lock",
  },
  {
    title: "Clear transactions",
    description: "Customers should always understand what they are paying for.",
    icon: "eye",
  },
  {
    title: "Transaction visibility",
    description: "Customers can see the state of their transactions.",
    icon: "status",
  },
  {
    title: "Responsible processing",
    description: "Atlas coordinates the transaction and fulfillment process behind the scenes.",
    icon: "shield",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* HERO */}
      <AtlasSection size="md" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
              Digital services without the confusion.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Atlas brings everyday digital services into one simple platform.
              Choose what you need, complete your transaction and track what
              happens from start to finish.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Get Started
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* WHAT ATLAS DOES */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              One platform. Multiple everyday services.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Use Atlas for airtime, data, electricity, TV subscriptions,
              results checking and more — without needing to understand the
              suppliers or fulfillment systems behind them.
            </p>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas handles the complexity so you can focus on the service you
              need.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Airtime",
              "Data",
              "Electricity",
              "TV Subscriptions",
              "Results Checking",
              "More as Atlas expands",
            ].map((service) => (
              <div
                key={service}
                className="rounded-lg border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              >
                {service}
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CUSTOMER JOURNEY */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              How Atlas works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step) => (
              <div key={step.step} className="flex flex-col items-start">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
                {step.examples.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {step.examples.map((example) => (
                      <li key={example}>• {example}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* DETAILED TRANSACTION EXAMPLE */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              See what a transaction looks like
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              A simple airtime purchase from start to finish.
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="grid md:grid-cols-5">
              <div className="border-b border-neutral-200 p-5 dark:border-neutral-800 md:border-b-0 md:border-r">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  1. Choose
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Airtime
                </p>
              </div>
              <div className="border-b border-neutral-200 p-5 dark:border-neutral-800 md:border-b-0 md:border-r">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  2. Enter details
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  024 XXX XXXX
                </p>
              </div>
              <div className="border-b border-neutral-200 p-5 dark:border-neutral-800 md:border-b-0 md:border-r">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  3. Review
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  GHS 20.00
                </p>
              </div>
              <div className="border-b border-neutral-200 p-5 dark:border-neutral-800 md:border-b-0 md:border-r">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  4. Pay
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Confirm
                </p>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  5. Receive
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Fulfilled
                </p>
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* TRANSACTION STATUS */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Always know what&apos;s happening.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas never leaves you wondering whether your transaction worked.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {transactionStatuses.map((status) => (
              <div
                key={status.title}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${status.bgClass} ${status.textClass}`}
                >
                  <AtlasIcon name={status.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {status.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {status.description}
                </p>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* PAYMENT EXPERIENCE */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Review before you pay.
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                You should always have an opportunity to verify your transaction
                before confirming payment.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Transaction Summary
              </div>
              <div className="space-y-3">
                {[
                  ["Service", "Airtime"],
                  ["Recipient", "024 XXX XXXX"],
                  ["Amount", "GHS 20.00"],
                  ["Fee", "GHS 0.00"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {label}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      GHS 20.00
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="inline-flex w-full items-center justify-center rounded-full bg-brand-800 px-6 py-3 text-base font-medium text-white">
                  Confirm Payment
                </div>
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* ACCOUNT EXPERIENCE */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Your transactions stay organized.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Atlas is more than a one-time payment website.
            </p>
          </div>

          <AtlasGrid cols={4} gap={6}>
            {accountFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  <AtlasIcon name={feature.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* WHEN SOMETHING GOES WRONG */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              What happens if a transaction doesn&apos;t go as expected?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              If a transaction fails or remains pending, Atlas shows you the
              current status and relevant information.
            </p>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              {[
                "View transaction details",
                "Wait for processing",
                "Retry where permitted",
                "Contact support",
                "Review refund information where applicable",
              ].map((action) => (
                <div
                  key={action}
                  className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* SECURITY / TRUST */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Built with trust in mind.
            </h2>
          </div>

          <AtlasGrid cols={4} gap={6}>
            {trustItems.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
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

      {/* BEHIND THE SCENES */}
      <AtlasSection size="lg" className="bg-brand-900 dark:bg-brand-950">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Atlas handles the complexity behind the scenes.
              </h2>
              <p className="mt-4 text-lg text-brand-200 dark:text-brand-300">
                You see a simple transaction. Atlas coordinates validation,
                payment, order creation, supplier fulfillment, and status
                updates.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="mb-3 text-sm font-semibold text-accent-500">
                  Customer sees
                </div>
                <ul className="space-y-2 text-sm text-white">
                  <li>Choose service</li>
                  <li>Enter details</li>
                  <li>Pay</li>
                  <li>Receive service</li>
                </ul>
              </div>
              <div>
                <div className="mb-3 text-sm font-semibold text-accent-500">
                  Behind Atlas
                </div>
                <ul className="space-y-2 text-sm text-brand-200">
                  <li>Service selection</li>
                  <li>Validation</li>
                  <li>Payment processing</li>
                  <li>Order creation</li>
                  <li>Supplier / fulfillment processing</li>
                  <li>Transaction status</li>
                  <li>Customer notification</li>
                </ul>
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FINAL CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Ready to use Atlas?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Access the digital services you need from one simple platform.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Create Your Account
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>
    </>
  );
}