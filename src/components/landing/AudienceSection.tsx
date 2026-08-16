import { AtlasContainer } from "@/components/atlas/atlas-container";

const audiences = [
  { title: "For Customers", description: "Enjoy digital services anytime, anywhere.", action: "Get Started", icon: "users", image: "woman" },
  { title: "For Resellers", description: "Start your own business, sell digital services and earn more.", action: "Start Selling", icon: "store", image: "man" },
  { title: "For Businesses", description: "Power your business operations and pay bills seamlessly.", action: "Learn More", icon: "building", image: "building" },
  { title: "For Developers", description: "Integrate Atlas services into your apps with our powerful API.", action: "Explore API", icon: "code", image: "laptop" },
];

export function AudienceSection() {
  return (
    <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900">
      <AtlasContainer>
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#003D2E] dark:text-brand-300">Built for everyone</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">A platform that grows with you</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">Whether you want to buy, sell, or build — Atlas is for you.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience) => (
            <div key={audience.title} className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition-transform hover:-translate-y-1.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF] text-[#003D2E] dark:bg-brand-900/40 dark:text-brand-300">
                <AudienceIcon name={audience.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{audience.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{audience.description}</p>
              <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-[#003D2E] hover:underline dark:text-brand-300">
                {audience.action}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" /></svg>
              </a>
              <div className="pointer-events-none absolute -bottom-1 -right-1 h-24 w-24 opacity-20 dark:opacity-15">
                <AudienceIllustration type={audience.image} />
              </div>
            </div>
          ))}
        </div>
      </AtlasContainer>
    </section>
  );
}

function AudienceIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "users":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case "store":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5M3 9h18M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9M9 21v-6h6v6" /></svg>;
    case "building":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>;
    case "code":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 9l-3 3 3 3m8 0l3-3-3-3m-5 12l4-18" /></svg>;
    default:
      return null;
  }
}

function AudienceIllustration({ type }: { type: string }) {
  switch (type) {
    case "woman":
      return <svg viewBox="0 0 100 100" fill="none" stroke="#003D2E" strokeWidth="2"><circle cx="50" cy="30" r="18"/><path d="M20 100c0-20 13-35 30-35s30 15 30 35"/></svg>;
    case "man":
      return <svg viewBox="0 0 100 100" fill="none" stroke="#003D2E" strokeWidth="2"><circle cx="50" cy="30" r="18"/><path d="M20 100c0-20 13-35 30-35s30 15 30 35"/><rect x="35" y="45" width="30" height="20" rx="3"/></svg>;
    case "building":
      return <svg viewBox="0 0 100 100" fill="none" stroke="#003D2E" strokeWidth="2"><rect x="20" y="20" width="60" height="70" rx="2"/><path d="M35 20v-5h30v5M40 30h.01M50 30h.01M60 30h.01M40 40h.01M50 40h.01M60 40h.01M40 50h.01M50 50h.01M60 50h.01M40 60h.01M50 60h.01M60 60h.01M40 70h.01M50 70h.01M60 70h.01"/></svg>;
    case "laptop":
      return <svg viewBox="0 0 100 100" fill="none" stroke="#003D2E" strokeWidth="2"><rect x="20" y="30" width="60" height="35" rx="3"/><path d="M10 75h80M30 85h40"/></svg>;
    default:
      return null;
  }
}