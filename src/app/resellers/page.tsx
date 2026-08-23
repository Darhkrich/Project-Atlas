/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const trustBadges = [
  "No Setup Fee",
  "Instant Setup",
  "Multiple Services",
  "24/7 Support",
];

const features: {
  title: string;
  icon: AtlasIconName;
}[] = [
  { title: "Your Own Storefront", icon: "store" },
  { title: "Multiple Digital Services", icon: "grid" },
  { title: "Reseller Wallet", icon: "wallet" },
  { title: "Customer Management", icon: "users" },
  { title: "Orders & Transactions", icon: "receipt" },
  { title: "Business Dashboard", icon: "bar-chart" },
  { title: "Dedicated Support", icon: "headphones" },
];

const steps = [
  { title: "Create Account", desc: "Sign up as a reseller" },
  { title: "Set Up Storefront", desc: "Customize your store details" },
  { title: "Choose Services", desc: "Select the digital services you want to sell" },
  { title: "Share Your Store", desc: "Share your storefront link with customers" },
  { title: "Customers Buy", desc: "Customers visit your storefront and place orders" },
  { title: "You Earn & Grow", desc: "Track earnings and scale your business" },
];

const storefrontVariants = [
  {
    title: "Fast. Reliable. Always Connected.",
    image: "/images/resellers/storefront-variant-dark.jpg",
    alt: "Dark theme reseller storefront",
  },
  {
    title: "All Your Digital Needs. In One Place.",
    image: "/images/resellers/storefront-variant-teal.jpg",
    alt: "Teal theme reseller storefront",
  },
  {
    title: "Simple Services. Trusted by You.",
    image: "/images/resellers/storefront-variant-green.jpg",
    alt: "Green theme reseller storefront",
  },
];

const faqs = [
  "What is an Atlas reseller?",
  "Which services can I offer?",
  "How do I receive payments?",
  "How much does it cost to become a reseller?",
  "Do I need technical skills?",
];

export default function ResellersPage() {
  return (
    <>
      <AtlasNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-l from-neutral-950 via-brand-950 to-brand-800 py-20 md:py-24 lg:py-28">
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="20" cy="20" r="1" fill="white" />
            <circle cx="80" cy="30" r="1" fill="white" />
            <circle cx="40" cy="70" r="1" fill="white" />
            <circle cx="90" cy="80" r="1" fill="white" />
          </svg>
        </div>

        <AtlasContainer className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[55%_45%] lg:items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Atlas Reseller Program
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-white">
                Your Business. Your Storefront.{" "}
                <span className="text-lime-400">Powered by Atlas.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/80">
                Become an Atlas reseller and get your own digital storefront.
                Sell airtime, data, electricity, TV subscriptions and more to
                your customers.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/sign-up?type=reseller"
                  className="inline-flex items-center justify-center rounded-full bg-lime-400 px-7 py-3 text-base font-semibold text-neutral-950 transition-colors hover:bg-lime-300"
                >
                  Start Your Atlas Storefront
                  <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  See How It Works
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-3">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white"
                  >
                    <AtlasIcon name="check" className="h-4 w-4 text-lime-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: images */}
            <div className="relative mx-auto max-w-[520px] lg:max-w-none">
              {/* Person image */}
              <div className="relative z-10 ml-auto w-[65%] overflow-hidden rounded-2xl bg-brand-900 shadow-2xl">
                <img
                  src="/images/resellers/reseller-person.png"
                  alt="Professional reseller"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Device mockup overlay */}
              <div className="absolute left-0 top-8 z-20 w-[75%]">
                <img
                  src="/images/resellers/reseller-dashboard-mockup.png"
                  alt="Reseller dashboard mockup"
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </AtlasContainer>
      </section>

      {/* WHAT YOU GET */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Everything you need to run your digital services business.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <AtlasIcon
                  name={feature.icon}
                  className="mb-3 h-8 w-8 text-brand-800 dark:text-brand-300"
                />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* YOUR OWN STOREFRONT & SOCIAL SHARING */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left copy */}
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Your Own Storefront. Your Store. Your Business.
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  "Your business name and identity",
                  "Your own custom link",
                  "Choose the services you want to sell",
                  "Professional, mobile-friendly experience",
                  "Built to help your customers buy with ease",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      <AtlasIcon name="check" className="h-4 w-4" />
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right visuals */}
            <div>
              <div className="relative">
                <img
                  src="/images/resellers/storefront-mockup.png"
                  alt="Storefront laptop and phone mockup"
                  className="w-full rounded-xl shadow-md"
                />
              </div>

              {/* One Link / Social Sharing */}
              <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      One Link. Reach Everyone.
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      https://atlas.com/store/brightdigital
                    </p>
                    <div className="mt-3 flex gap-3">
                      {["WhatsApp", "Facebook", "Instagram", "Telegram"].map((social) => (
                        <span
                          key={social}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          title={social}
                        >
                          {social.charAt(0)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <img
                      src="/images/resellers/qr-code.png"
                      alt="QR code for store"
                      className="mx-auto h-24 w-24 rounded-lg"
                    />
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Scan to view your store
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* HOW IT WORKS */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950" id="how-it-works">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Start your reseller business in 6 simple steps.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {step.desc}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute -right-5 top-7 hidden text-neutral-300 dark:text-neutral-600 lg:block">
                    <AtlasIcon name="arrow-right" className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* REAL STOREFRONTS */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              See what your storefront could look like.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Every reseller gets a professional storefront designed to convert.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {storefrontVariants.map((variant) => (
              <div
                key={variant.title}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <img
                  src={variant.image}
                  alt={variant.alt}
                  className="h-64 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {variant.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CUSTOMER JOURNEY & RESELLER ECOSYSTEM */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Customer flow */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Built for your customers
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                A smooth experience for every customer.
              </p>
              <div className="mt-6 space-y-4">
                {["Browse Services", "Choose a Product", "Enter Details", "Pay & Receive"].map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
                    {i < 3 && (
                      <AtlasIcon name="arrow-right" className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Reseller flow */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Win you win
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Turn every customer into a business opportunity.
              </p>
              <div className="mt-6 space-y-4">
                {["Customer", "Your Storefront", "Service Purchase", "Atlas Platform", "Your Earnings"].map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* FAQ & BOTTOM CTA */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* FAQ */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Frequently Asked Questions
              </p>
              <ul className="mt-4 space-y-4">
                {faqs.map((faq) => (
                  <li key={faq}>
                    <Link
                      href="#"
                      className="text-lg font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:text-brand-800 dark:text-neutral-100 dark:decoration-neutral-700 dark:hover:text-brand-300"
                    >
                      {faq}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/faq"
                className="mt-6 inline-flex items-center text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
              >
                View all questions
                <AtlasIcon name="arrow-right" className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* CTA Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-8 dark:bg-brand-950">
              <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Ready to Start
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Start Your Atlas Storefront Today
                </h2>
                <p className="mt-3 text-brand-100">
                  Create your account now and launch your business in minutes.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/sign-up?type=reseller"
                    className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-lime-300"
                  >
                    Become a Reseller
                    <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact-sales"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
                  >
                    <AtlasIcon name="phone" className="mr-2 h-4 w-4" />
                    Talk to Sales
                  </Link>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 opacity-90">
                <img
                  src="/images/resellers/cta-illustration.png"
                  alt="3D storefront illustration"
                  className="h-48 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />
    </>
  );
}