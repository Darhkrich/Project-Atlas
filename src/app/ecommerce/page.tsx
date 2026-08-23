/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { StorePreviewTabs } from "@/components/ecommerce/StorePreviewTabs";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const trustBadges = [
  "No Code Required",
  "Free SSL",
  "Instant Launch",
  "24/7 Support",
];

const templates = [
  { name: "Fashion", image: "/Ladies-wear-store.png" },
  { name: "Electronics", image: "/men.png" },
  { name: "Groceries", image: "/store.png" },
  { name: "Beauty", image: "/images/ecommerce/beauty.jpg" },
];

const features = [
  {
    title: "No-Code Store Builder",
    description:
      "Drag, drop, and customize your storefront without writing a single line of code.",
    icon: "grid" as AtlasIconName,
    visual: "/images/ecommerce/builder.jpg",
  },
  {
    title: "Custom Domain & Hosting",
    description:
      "Use your own domain name and let Atlas handle hosting, security, and maintenance.",
    icon: "globe" as AtlasIconName,
    visual: "/images/ecommerce/domain.jpg",
  },
  {
    title: "Secure Payments & Orders",
    description:
      "Accept payments securely and manage orders from a single dashboard.",
    icon: "card" as AtlasIconName,
    visual: "/images/ecommerce/payments.jpg",
  },
];

const steps = [
  { title: "Pick a Template", desc: "Start with a professionally designed store template." },
  { title: "Customize", desc: "Add your logo, colors, products, and content." },
  { title: "Set Up Payments", desc: "Connect your preferred payment methods." },
  { title: "Launch Store", desc: "Publish your website instantly." },
  { title: "Share & Sell", desc: "Promote your store and start receiving orders." },
  { title: "Grow & Manage", desc: "Track sales, manage inventory, and scale." },
];

const faqs = [
  {
    question: "Do I need technical skills to create a store?",
    answer:
      "No. Atlas provides a no-code builder that lets you create and customize your store visually.",
  },
  {
    question: "Can I use my own domain name?",
    answer: "Yes, you can connect your own custom domain to your Atlas store.",
  },
  {
    question: "How do I receive payments from customers?",
    answer:
      "Atlas integrates with secure payment methods so you can accept payments directly.",
  },
  {
    question: "What products can I sell?",
    answer:
      "You can sell physical or digital products, services, or any combination that suits your business.",
  },
  {
    question: "Is hosting and security included?",
    answer:
      "Yes, hosting, SSL certificates, and security updates are included with your Atlas store.",
  },
];

export default function EcommercePage() {
  return (
    <>
      <AtlasNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-24 lg:py-28 dark:bg-neutral-950">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="50" cy="30" r="1" fill="currentColor" />
            <circle cx="90" cy="50" r="1" fill="currentColor" />
            <circle cx="20" cy="80" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>

        <AtlasContainer className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                White-Label E-commerce
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Your Own Online Store.{" "}
                <span className="text-brand-700 dark:text-brand-300">
                  No Code. No Stress.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                Pick a template, add your products, and launch a fully hosted
                store in minutes — no coding or maintenance required.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/sign-up?type=store-owner"
                  className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-900"
                >
                  Start Your Store
                  <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#templates"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  View Templates
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-3">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    <AtlasIcon name="check" className="h-4 w-4 text-brand-700 dark:text-brand-300" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: store builder mockup */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                    yourstore.atlas.com
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Store Builder
                    </span>
                    <span className="rounded-md bg-brand-800 px-2 py-1 text-xs font-medium text-white">
                      Preview
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="col-span-2 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
                      <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Your Storefront
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="h-8 rounded bg-white dark:bg-neutral-900" />
                        <div className="h-8 rounded bg-white dark:bg-neutral-900" />
                        <div className="h-8 rounded bg-white dark:bg-neutral-900" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-neutral-900">
                        <AtlasIcon name="settings" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        <span className="ml-1 text-xs">Color</span>
                      </div>
                      <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-neutral-900">
                        <AtlasIcon name="mobile" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        <span className="ml-1 text-xs">Layout</span>
                      </div>
                      <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-neutral-900">
                        <AtlasIcon name="user" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        <span className="ml-1 text-xs">Logo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating product card with actual image */}
              <div className="absolute -bottom-4 -right-2 w-32 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-900">
                <img
                  src="/images/ecommerce/product-sample.jpg"
                  alt="Product"
                  className="h-16 w-full rounded object-cover"
                />
                <div className="mt-2 text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  Product Name
                </div>
                <div className="text-xs font-semibold text-brand-800 dark:text-brand-300">
                  GH₵ 49.99
                </div>
              </div>
            </div>
          </div>
        </AtlasContainer>
      </section>

      {/* TEMPLATES SHOWCASE */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950" id="templates">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Start with a template made to sell.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Choose from professionally designed templates for any industry.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <div
                key={template.name}
                className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <img
                  src={template.image}
                  alt={`${template.name} template`}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </h3>
                  <button className="mt-3 w-full rounded-md border border-brand-800 px-4 py-2 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30">
                    Use this template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FEATURES (Alternating rows) */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                    <AtlasIcon name={feature.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <img
                      src={feature.visual}
                      alt={`${feature.title} visual`}
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* HOW IT WORKS (Vertical timeline) */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950" id="how-it-works">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Start your e-commerce website in 6 simple steps.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex gap-6 pb-10">
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 h-full w-px border-l-2 border-dashed border-neutral-200 dark:border-neutral-700" />
                )}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* STORE PREVIEW TABS */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              See what your store could look like.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Explore different storefront designs and layouts.
            </p>
          </div>
          <StorePreviewTabs />
        </AtlasContainer>
      </AtlasSection>

      {/* BUILT FOR YOU (Two cards) */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Built for your customers
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                A smooth shopping experience that builds trust.
              </p>
              <div className="mt-6 space-y-4">
                {["Browse Products", "Add to Cart", "Checkout", "Pay & Receive"].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Built for your business
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Manage your store and grow with confidence.
              </p>
              <div className="mt-6 space-y-4">
                {["Your Store", "Customer Orders", "Secure Payments", "Inventory", "Analytics"].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/15 text-sm font-semibold text-accent-600">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FAQ ACCORDION */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <summary className="cursor-pointer text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FINAL CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Launch your store today.
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                No code. No maintenance. Just your business, online.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/sign-up?type=store-owner"
                  className="inline-flex items-center justify-center rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900"
                >
                  Create Your Store
                </Link>
                <Link
                  href="/contact-sales"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-950">
              <img
                src="/images/ecommerce/store-screenshot.jpg"
                alt="Store screenshot"
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />
    </>
  );
}