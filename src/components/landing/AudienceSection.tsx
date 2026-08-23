/* eslint-disable @next/next/no-img-element */
import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const audiences: {
  title: string;
  description: string;
  action: string;
  icon: AtlasIconName;
  image: string;
}[] = [
  {
    title: "For Customers",
    description: "Enjoy digital services anytime, anywhere.",
    action: "Get Started",
    icon: "users",
    image: "/images/audience/customer.jpg",
  },
  {
    title: "For Resellers",
    description: "Start your own business, sell digital services and earn more.",
    action: "Start Selling",
    icon: "store",
    image: "/images/audience/reseller.jpg",
  },
  {
    title: "For Businesses",
    description: "Power your business operations and pay bills seamlessly.",
    action: "Learn More",
    icon: "bank",
    image: "/images/audience/business.jpg",
  },
  {
    title: "For Developers",
    description: "Integrate Atlas services into your apps with our powerful API.",
    action: "Explore API",
    icon: "code",
    image: "/images/audience/developer.jpg",
  },
];

export function AudienceSection() {
  return (
    <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900">
      <AtlasContainer>
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#003D2E] dark:text-brand-300">
            Built for everyone
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            A platform that grows with you
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Whether you want to buy, sell, or build — Atlas is for you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition-transform hover:-translate-y-1.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF] text-[#003D2E] dark:bg-brand-900/40 dark:text-brand-300">
                <AtlasIcon name={audience.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {audience.description}
              </p>
              <a
                href="#"
                className="mt-4 inline-flex items-center text-sm font-medium text-[#003D2E] hover:underline dark:text-brand-300"
              >
                {audience.action}
                <AtlasIcon name="arrow-right" className="ml-1 h-4 w-4" />
              </a>

              {/* Actual audience image */}
              <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 overflow-hidden rounded-br-xl">
                <img
                  src={audience.image}
                  alt={audience.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </AtlasContainer>
    </section>
  );
}