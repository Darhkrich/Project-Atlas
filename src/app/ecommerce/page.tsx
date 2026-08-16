/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";

const trustBadges = [
  "No Code Required",
  "Instant Launch",
  "Fully Hosted",
  "24/7 Support",
];

const features = [
  { title: "No Code Builder", icon: "🛠️" },
  { title: "Modern Templates", icon: "🎨" },
  { title: "Custom Domain", icon: "🌐" },
  { title: "Secure Hosting", icon: "☁️" },
  { title: "Integrated Payments", icon: "💳" },
  { title: "Product Management", icon: "📦" },
  { title: "Business Analytics", icon: "📊" },
];

const steps = [
  { title: "Pick a Template", desc: "Choose a design that fits your brand" },
  { title: "Customize", desc: "Add your logo, colors, and content" },
  { title: "Add Products", desc: "Upload products, prices, and images" },
  { title: "Set Up Payments", desc: "Connect your preferred payment methods" },
  { title: "Launch Store", desc: "Publish your website instantly" },
  { title: "Sell & Grow", desc: "Manage orders and track your sales" },
];

const storeExamples = [
  {
    title: "Fashion Boutique",
    image: "/images/ecommerce/store-fashion.jpg",
    alt: "Fashion store example",
  },
  {
    title: "Electronics Store",
    image: "/images/ecommerce/store-electronics.jpg",
    alt: "Electronics store example",
  },
  {
    title: "Grocery Market",
    image: "/images/ecommerce/store-groceries.jpg",
    alt: "Grocery store example",
  },
];

const faqs = [
  "Do I need technical skills to create a store?",
  "Can I use my own domain name?",
  "How do I receive payments from customers?",
  "What products can I sell?",
  "Is hosting and security included?",
];

export default function EcommercePage() {
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
                White-Label E-commerce
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-white">
                Launch Your Own E-commerce Website.{" "}
                <span className="text-lime-400">No Code Needed.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/80">
                Choose a template, customize it with your brand, add your
                products, and launch a fully hosted online store in minutes —
                without writing a single line of code.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/sign-up?type=store-owner"
                  className="inline-flex items-center justify-center rounded-full bg-lime-400 px-7 py-3 text-base font-semibold text-neutral-950 transition-colors hover:bg-lime-300"
                >
                  Start Your Store
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
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
                    <svg className="h-4 w-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: images */}
            <div className="relative mx-auto max-w-[520px] lg:max-w-none">
              {/* Store builder mockup */}
              <div className="absolute left-0 top-10 z-20 w-[75%]">
                <img
                  src="/images/ecommerce/store-builder-mockup.png"
                  alt="Store builder interface"
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>
              {/* Store owner person image */}
              <div className="relative z-10 ml-auto w-[60%] overflow-hidden rounded-2xl bg-brand-900 shadow-2xl">
                <img
                  src="/images/ecommerce/store-owner-hero.png"
                  alt="E-commerce store owner"
                  className="h-full w-full object-cover"
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
              Everything you need to sell online.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="mb-3 text-4xl">{feature.icon}</span>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* YOUR OWN STORE & SOCIAL SHARING */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left copy */}
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Your Store. Your Brand. Your Rules.
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  "Choose from modern, mobile-friendly templates",
                  "Use your own custom domain name",
                  "Add unlimited products and categories",
                  "Accept payments securely through Atlas",
                  "Launch and manage your store with ease",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right visuals */}
            <div>
              <div className="relative">
                <img
                  src="/images/ecommerce/storefront-preview.png"
                  alt="Storefront preview on laptop and phone"
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
                      https://yourstore.atlas.com
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
                      src="/images/ecommerce/qr-code.png"
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
              Start your e-commerce website in 6 simple steps.
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
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* REAL STORE EXAMPLES */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              See what your store could look like.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Every store is built on a professional template designed to sell.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {storeExamples.map((example) => (
              <div
                key={example.title}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <img
                  src={example.image}
                  alt={example.alt}
                  className="h-64 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {example.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* CUSTOMER JOURNEY & MERCHANT FLOW */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Customer flow */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Built for your customers
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                A smooth shopping experience that builds trust.
              </p>
              <div className="mt-6 space-y-4">
                {["Browse Products", "Add to Cart", "Checkout", "Pay & Receive"].map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
                    {i < 3 && <span className="text-neutral-300 dark:text-neutral-600">→</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Merchant flow */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Built for your business
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Manage your store and grow with confidence.
              </p>
              <div className="mt-6 space-y-4">
                {["Your Store", "Customer Orders", "Secure Payments", "Inventory Management", "Analytics & Growth"].map((step, i) => (
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
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
            </div>

            {/* CTA Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-8 dark:bg-brand-950">
              <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Ready to Launch
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Start Your E-commerce Website Today
                </h2>
                <p className="mt-3 text-brand-100">
                  Create your store now and start selling online in minutes.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/sign-up?type=store-owner"
                    className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-lime-300"
                  >
                    Create Your Store
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact-sales"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Talk to Sales 📞
                  </Link>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 opacity-90">
                <img
                  src="/images/ecommerce/cta-illustration.png"
                  alt="3D e-commerce illustration"
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