import { AtlasContainer } from "@/components/atlas/atlas-container";

const stats = [
  { value: "50K+", label: "Happy Customers", icon: "users" },
  { value: "10K+", label: "Active Resellers", icon: "store" },
  { value: "99.9%", label: "Service Uptime", icon: "uptime" },
  { value: "1M+", label: "Transactions Completed", icon: "check" },
  { value: "24/7", label: "Customer Support", icon: "headphones" },
];

export function TrustStats() {
  return (
    <section className="py-16 md:py-20">
      <AtlasContainer>
        <div className="rounded-xl bg-[#003D2E] px-6 py-12 md:px-10 md:py-14">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Trusted by thousands across the country
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-green-200">
                  <StatIcon name={stat.icon} className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-xs text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}

function StatIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "users":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case "store":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5M3 9h18M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9M9 21v-6h6v6" /></svg>;
    case "uptime":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "check":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>;
    case "headphones":
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6m0 0h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2m-16 0h2a2 2 0 012 2v2a2 2 0 01-2 2H3" /></svg>;
    default:
      return null;
  }
}